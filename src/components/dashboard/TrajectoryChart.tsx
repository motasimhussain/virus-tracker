import type { TrajectoryPoint } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { TrajectoryLineChart } from "@/components/charts/TrajectoryLineChart";
import { formatShortDateTick } from "@/components/charts/format";

export type TrajectoryChartProps = {
  points: TrajectoryPoint[];
  /** Optional virus name used in the chart title and its plain-English summary. Defaults to "this virus". */
  virusName?: string;
};

/**
 * Case-trajectory panel. Wraps the shared `charts/TrajectoryLineChart` (which
 * already renders the confidence band and the "Illustrative estimate" badge
 * for synthetic leading points) with a plain-English header inside the card.
 */
export function TrajectoryChart({ points, virusName = "this virus" }: TrajectoryChartProps) {
  const plainSummary =
    points.length > 0
      ? `Projected case trajectory for ${virusName} from ${formatShortDateTick(points[0]!.date)} to ${formatShortDateTick(points[points.length - 1]!.date)}, with a shaded range showing the uncertainty.`
      : `No projected case trajectory is available for ${virusName} right now.`;

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Outlook</p>
        <h3 className="mt-1 text-lg font-bold text-text-primary">Where cases could be headed</h3>
        <p className="mt-1 text-sm text-text-secondary">
          A projected trend for {virusName}, based on recent reporting. The shaded band shows how uncertain that
          projection is.
        </p>
      </div>
      <TrajectoryLineChart points={points} virusName={virusName} plainSummary={plainSummary} />
    </Card>
  );
}
