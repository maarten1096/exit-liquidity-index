
# EXITLIQUIDITY - Biggest Losers Leaderboard

A dark minimalist website for a Solana meme coin that ranks wallet holders by their losses, embracing the "exit liquidity" narrative with weaponized sarcasm.

## Pages

### Landing Page
- Hero section with the tagline "Be early. Or be exit liquidity."
- Sad Wojak mascot with sunglasses illustration
- "Accept Fate" button linking to the DEX/swap
- Brief explanation of what the token is about
- Scroll down to the leaderboard section

### Who's Exit Liquidity Leaderboard
- Clean dark table showing top 25 biggest losers
- Columns: Rank, Wallet (truncated address), Holdings, ROI %, Label
- Labels based on loss severity:
  - ROI below -90%: "Not selling since 2025"
  - ROI below -70%: "HODLer"  
  - ROI below -50%: "Exit Liquidity"
- Subtle red accent colors for negative percentages
- Auto-refresh indicator showing last update time

## Backend Architecture

### Supabase Database
- `token_holders` table: wallet_address, balance, avg_entry_price, current_value, roi_percent, last_updated
- `wallet_buys` table: wallet_address, amount, price_at_buy, tx_signature, timestamp
- `token_price` table: price, timestamp
- RLS policies: public read access, service role write only

### Supabase Edge Function (Cron Job)
- Runs every 10 minutes via pg_cron
- Fetches all token holders from Solana RPC (using Helius or similar)
- Parses swap transactions to calculate weighted average entry price
- Fetches current token price from Jupiter/Raydium
- Calculates ROI for each holder
- Updates Supabase database

## Design System
- Background: Near-black (#0a0a0a)
- Card backgrounds: Dark gray (#111111)
- Text: White and muted gray
- Accent: Deep red (#dc2626) for losses
- Font: Clean sans-serif (Inter or similar)
- Subtle glow effects on key elements

## Technical Notes
- You'll need to provide a Helius API key (or similar Solana RPC provider) for blockchain data
- Token contract address required for deployment
- SQL migration files will be provided separately as requested
