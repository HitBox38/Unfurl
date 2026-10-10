import { Link } from "@tanstack/react-router";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export const MissingFile = () => (
  <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-left">
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>File not found</CardTitle>
        <CardDescription>
          This file is not available in this browser. Return to projects to
          import a saved copy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/">Back to projects</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);
