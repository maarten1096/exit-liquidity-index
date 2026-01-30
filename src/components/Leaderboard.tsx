import { useHolders, useLastUpdated } from "@/hooks/useHolders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

function truncateWallet(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}

function getLabelVariant(label: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (label) {
    case "Not selling since 2025":
      return "destructive";
    case "HODLer":
      return "secondary";
    case "Exit Liquidity":
      return "outline";
    default:
      return "default";
  }
}

export function Leaderboard() {
  const { data: holders, isLoading, error } = useHolders();
  const { data: lastUpdated } = useLastUpdated();

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load leaderboard</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Who's Exit Liquidity?
        </h2>
        {lastUpdated && (
          <span className="text-sm text-muted-foreground">
            Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
          </span>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-16 text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">Wallet</TableHead>
              <TableHead className="text-right text-muted-foreground">Holdings</TableHead>
              <TableHead className="text-right text-muted-foreground">ROI %</TableHead>
              <TableHead className="text-right text-muted-foreground">Label</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : holders && holders.length > 0 ? (
              holders.map((holder, index) => (
                <TableRow key={holder.id} className="border-border">
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-mono text-foreground">
                    {truncateWallet(holder.wallet_address)}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {formatNumber(holder.balance)}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${
                    holder.roi_percent < 0 ? "text-destructive" : "text-green-500"
                  }`}>
                    {holder.roi_percent.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {holder.label && (
                      <Badge variant={getLabelVariant(holder.label)}>
                        {holder.label}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No holders indexed yet. Run the indexer to populate data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
