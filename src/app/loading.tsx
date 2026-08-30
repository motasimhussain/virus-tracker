import { Card, Skeleton } from "@/components/ui";

/**
 * Root-level instant loading state: a page-shaped skeleton (hero bar, four
 * stat tiles, two chart cards) shown while a route segment streams in.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page…</span>

      <Skeleton variant="card" className="h-16" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex flex-col gap-3">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="h-8 w-2/3" />
        </Card>
        <Card className="flex flex-col gap-3">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="h-8 w-2/3" />
        </Card>
        <Card className="flex flex-col gap-3">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="h-8 w-2/3" />
        </Card>
        <Card className="flex flex-col gap-3">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="h-8 w-2/3" />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <Skeleton variant="chart" />
        </Card>
        <Card>
          <Skeleton variant="chart" />
        </Card>
      </div>
    </div>
  );
}
