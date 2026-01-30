import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenAccount {
  address: string;
  amount: number;
}

function getLabel(roiPercent: number): string {
  if (roiPercent < -90) return "lol what the fuck is he doing";
  if (roiPercent < -70) return "couldve wiped your ass with that";
  if (roiPercent < -50) return "let me guess no financial advisor?";
  return "Paper hands";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const heliusApiKey = Deno.env.get("HELIUS_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get token mint address from config
    const { data: configData, error: configError } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "token_mint")
      .single();

    if (configError || !configData) {
      console.error("Failed to get token mint address:", configError);
      return new Response(
        JSON.stringify({ error: "Token mint not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenMint = configData.value;
    console.log("Indexing token:", tokenMint);

    // Fetch all token holders from Helius
    const holdersResponse = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "holders",
          method: "getTokenAccounts",
          params: {
            mint: tokenMint,
            limit: 1000,
          },
        }),
      }
    );

    const holdersData = await holdersResponse.json();
    
    if (holdersData.error) {
      console.error("Helius API error:", holdersData.error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch token holders" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenAccounts: TokenAccount[] = holdersData.result?.token_accounts || [];
    console.log(`Found ${tokenAccounts.length} token holders`);

    // Fetch current token price from Jupiter
    const priceResponse = await fetch(
      `https://api.jup.ag/price/v2?ids=${tokenMint}`
    );
    const priceData = await priceResponse.json();
    const currentPrice = priceData.data?.[tokenMint]?.price || 0;
    console.log("Current price:", currentPrice);

    // Store current price
    await supabase.from("token_price").insert({
      price: currentPrice,
      timestamp: new Date().toISOString(),
    });

    // Process each holder
    const holdersToUpsert = tokenAccounts.map((account) => {
      const balance = account.amount;
      // For now, use a simple estimation - assume avg entry was 2x current price
      // In production, you'd parse historical transactions
      const avgEntryPrice = currentPrice * 2;
      const currentValue = balance * currentPrice;
      const entryValue = balance * avgEntryPrice;
      const roiPercent = entryValue > 0 
        ? ((currentValue - entryValue) / entryValue) * 100 
        : 0;

      return {
        wallet_address: account.address,
        balance,
        avg_entry_price: avgEntryPrice,
        current_value: currentValue,
        roi_percent: roiPercent,
        label: getLabel(roiPercent),
        last_updated: new Date().toISOString(),
      };
    });

    // Upsert holders in batches
    const batchSize = 100;
    for (let i = 0; i < holdersToUpsert.length; i += batchSize) {
      const batch = holdersToUpsert.slice(i, i + batchSize);
      const { error: upsertError } = await supabase
        .from("token_holders")
        .upsert(batch, { onConflict: "wallet_address" });

      if (upsertError) {
        console.error("Upsert error:", upsertError);
      }
    }

    // Update last indexed timestamp
    await supabase
      .from("app_config")
      .upsert({ key: "last_indexed", value: new Date().toISOString() });

    console.log("Indexing complete");

    return new Response(
      JSON.stringify({ 
        success: true, 
        holders: holdersToUpsert.length,
        price: currentPrice 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Indexer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
