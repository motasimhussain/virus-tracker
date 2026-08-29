"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-default bg-surface-inset px-6 py-10 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-surface-raised text-text-faint">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-primary">
            Something went wrong loading this page
          </p>
          <p className="max-w-sm text-sm text-text-muted">
            The data sources may be briefly unavailable. This usually resolves itself in a
            moment.
          </p>
          {error.digest ? <p className="sr-only">Error reference: {error.digest}</p> : null}
        </div>
        <Button onClick={() => reset()} variant="outline" size="sm" className="mt-1">
          Try again
        </Button>
      </div>
    </div>
  );
}
