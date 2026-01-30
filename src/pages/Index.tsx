import { Leaderboard } from "@/components/Leaderboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            EXITLIQUIDITY
          </h1>
          <p className="text-lg text-muted-foreground">
            Top 25 biggest losers ranked by negative ROI
          </p>
        </header>

        <Leaderboard />
      </div>
    </div>
  );
};

export default Index;
