import { Clock } from "lucide-react";

import { Badge } from "@/components/ui";
import { formatRelativeMinutes } from "@/lib/copy";

export type DataFreshnessBadgeProps = {
  /** ISO timestamp the dashboard snapshot was generated at. */
  generatedAt: string;
};

/** Small badge showing how fresh the current data is, e.g. "Updated 12 minutes ago". */
export function DataFreshnessBadge({ generatedAt }: DataFreshnessBadgeProps) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <Clock className="size-3" aria-hidden="true" />
      {formatRelativeMinutes(generatedAt)}
    </Badge>
  );
}
