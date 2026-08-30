import { ExternalLink } from "lucide-react";

import { Badge, Button, Card } from "@/components/ui";

type UpdateCadence = "Daily" | "Weekly" | "Annual" | "Continuous" | "Periodic";

export type SourceCardProps = {
  /** Source name, e.g. "disease.sh". */
  name: string;
  /** Plain-English sentence describing what this source feeds into the dashboard. */
  provides: string;
  /** How often the source refreshes. */
  cadence: UpdateCadence;
  /** External URL to the source's homepage/docs. */
  href: string;
};

/**
 * A single data-source attribution card: name, what it provides (plain
 * sentence), an update-cadence badge, and a link out to the source itself.
 */
export function SourceCard({ name, provides, cadence, href }: SourceCardProps) {
  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">{name}</h3>
        <Badge variant="accent">{cadence}</Badge>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-text-secondary">{provides}</p>
      <Button href={href} variant="outline" size="sm" className="self-start">
        Visit source
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </Button>
    </Card>
  );
}
