
# EXITLIQUIDITY - Leaderboard Only (Fast Build)

## Overview
Single-page leaderboard showing the top 25 biggest losers ranked by negative ROI. Dark minimalist design, real Solana blockchain data.

## What You Need to Provide
1. **Helius API Key** - For Solana RPC access to fetch token holders and transaction data
2. **Token Mint Address** - Your Solana token's contract address

## Database Schema (SQL File)
I will create a `database-schema.sql` file you can run manually in Supabase:

```text
Tables:
- token_holders: wallet_address, balance, avg_entry_price, current_value, roi_percent, label, last_updated
- token_price: price, timestamp
- app_config: key-value store for token mint address

RLS Policies:
- Public SELECT on all tables
- Service role only for INSERT/UPDATE/DELETE
```

## Frontend Components
1. **Leaderboard Page** (`/`)
   - Dark background (#0a0a0a)
   - Table with columns: Rank, Wallet, Holdings, ROI%, Label
   - Labels: "Not selling since 2025" (<-90%), "HODLer" (<-70%), "Exit Liquidity" (<-50%)
   - Auto-refresh every 60 seconds
   - Last updated timestamp

## Backend (Edge Function)
1. **index-holders** - Cron job that:
   - Fetches all token holders from Helius API
   - Gets current token price from Jupiter
   - Calculates ROI for each holder
   - Updates database

## File Structure
```text
database-schema.sql          <- Run this in Supabase SQL editor
src/
  pages/Index.tsx            <- Leaderboard UI
  components/Leaderboard.tsx <- Table component
  hooks/useHolders.ts        <- Data fetching hook
  lib/utils.ts               <- Helper functions
supabase/functions/
  index-holders/index.ts     <- Blockchain indexer
```

## Technical Details

### ROI Calculation
- Fetch holder balances from Helius `getTokenAccounts`
- Get historical swaps to estimate entry price
- Current price from Jupiter API
- ROI = ((current_value - entry_value) / entry_value) * 100

### Labels
- ROI < -90%: "Not selling since 2025"
- ROI < -70%: "HODLer"
- ROI < -50%: "Exit Liquidity"
- ROI >= -50%: "Paper hands"

### Cron Schedule
Edge function runs every 10 minutes via pg_cron (SQL provided in schema file)
