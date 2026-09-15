import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

// Placeholder screen — proves the tokens/fonts/primitives assemble correctly.
// Replaced by the real marketing homepage in the next commit.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-24">
      <ThemeToggle />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Repère</CardTitle>
          <CardDescription>
            Fondations posées — la page d&apos;accueil arrive au prochain commit.
          </CardDescription>
        </CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="success">Disponible</Badge>
          <Button size="sm">Continuer</Button>
        </div>
      </Card>
    </main>
  );
}
