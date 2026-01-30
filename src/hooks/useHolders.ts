import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TokenHolder {
  id: string;
  wallet_address: string;
  balance: number;
  avg_entry_price: number;
  current_value: number;
  roi_percent: number;
  label: string | null;
  last_updated: string;
}

export function useHolders() {
  return useQuery({
    queryKey: ["holders"],
    queryFn: async (): Promise<TokenHolder[]> => {
      // Using any to bypass type checking since tables may not exist yet
      const { data, error } = await (supabase as any)
        .from("token_holders")
        .select("*")
        .order("roi_percent", { ascending: true })
        .limit(25);

      if (error) {
        console.error("Failed to fetch holders:", error);
        return [];
      }
      return (data as TokenHolder[]) || [];
    },
    refetchInterval: 60000,
  });
}

export function useLastUpdated() {
  return useQuery({
    queryKey: ["last-updated"],
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await (supabase as any)
        .from("app_config")
        .select("value")
        .eq("key", "last_indexed")
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch last updated:", error);
        return null;
      }
      return data?.value || null;
    },
    refetchInterval: 60000,
  });
}
