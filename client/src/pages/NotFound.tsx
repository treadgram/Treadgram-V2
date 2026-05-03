import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-lg border-[#222222] bg-[#141414]">
        <CardContent className="px-8 pb-10 pt-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex size-16 items-center justify-center border border-primary/40 bg-[#0a0a0a]">
              <AlertCircle className="size-9 text-primary" />
            </div>
          </div>

          <p className="section-label mb-3 text-center">// Error</p>
          <h1 className="font-display text-5xl font-black uppercase tracking-[-0.02em] text-foreground">404</h1>

          <h2 className="mt-2 font-display text-xl font-bold uppercase tracking-wide text-foreground">Page not found</h2>

          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-[#aaaaaa]">
            That route is off the map. It may have moved or never existed.
          </p>

          <div id="not-found-button-group" className="mt-8 flex justify-center">
            <Button onClick={handleGoHome} size="lg" className="gap-2">
              <Home className="size-4" />
              Back home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
