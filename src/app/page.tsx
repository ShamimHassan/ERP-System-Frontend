import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-1 text-center">
          <Badge variant="secondary" className="mx-auto">
            ERP Frontend · Step 3
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            shadcn/ui Initialized
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            New York style · Slate palette · Tailwind CSS v4
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-50">
              Checkpoint: Component Smoke Test
            </CardTitle>
            <CardDescription>
              If this renders correctly, shadcn/ui is properly configured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="hello">Label + Input</Label>
              <Input id="hello" placeholder="shadcn input with slate ring" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button>Hello</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
