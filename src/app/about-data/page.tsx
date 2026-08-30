import type { Metadata } from "next";

import { SourceCard } from "@/components/about/SourceCard";
import { Reveal } from "@/components/motion";
import { Button, Card, SectionHeader } from "@/components/ui";
import { COVERAGE_COPY, METRIC_COPY, type MetricKey } from "@/lib/copy";

export const metadata: Metadata = {
  title: "About the data — Virus Tracker",
  description:
    "Where Virus Tracker's numbers come from: the health agencies and research groups behind each chart, how often they update, and what their limits are.",
};

const SOURCES = [
  {
    name: "disease.sh",
    provides: "COVID-19 country and state case counts, plus 90-day case history, that power the live dashboard and trend charts.",
    cadence: "Daily" as const,
    href: "https://disease.sh",
  },
  {
    name: "CDC FluView via CMU Delphi",
    provides: "US flu activity levels, sourced from the CDC's FluView surveillance network through Carnegie Mellon's Delphi API.",
    cadence: "Weekly" as const,
    href: "https://delphi.cmu.edu/",
  },
  {
    name: "WHO Global Health Observatory",
    provides: "Annual global totals for cholera and measles cases, published by the World Health Organization.",
    cadence: "Annual" as const,
    href: "https://www.who.int/data/gho",
  },
  {
    name: "Our World in Data",
    provides: "Per-country mpox case counts, compiled and maintained by the Our World in Data research team.",
    cadence: "Daily" as const,
    href: "https://ourworldindata.org/mpox",
  },
  {
    name: "WHO Disease Outbreak News",
    provides: "Official outbreak bulletins from the World Health Organization, pulled in as a live RSS feed.",
    cadence: "Continuous" as const,
    href: "https://www.who.int/emergencies/disease-outbreak-news",
  },
  {
    name: "ReliefWeb",
    provides: "Humanitarian and public-health situation reports from the UN's ReliefWeb service, pulled in as a live RSS feed.",
    cadence: "Continuous" as const,
    href: "https://reliefweb.int/",
  },
  {
    name: "ProMED",
    provides: "Early outbreak reports and disease alerts from the Program for Monitoring Emerging Diseases, pulled in as a live RSS feed.",
    cadence: "Continuous" as const,
    href: "https://promedmail.org/",
  },
  {
    name: "CDC Outbreaks",
    provides: "Current outbreak advisories published by the US Centers for Disease Control and Prevention, pulled in as a live RSS feed.",
    cadence: "Continuous" as const,
    href: "https://www.cdc.gov/outbreaks/index.html",
  },
  {
    name: "Curated seed estimates",
    provides: "Reviewed baseline figures we maintain by hand for viruses that don't have a live public feed, so every tracked virus still has a starting point.",
    cadence: "Periodic" as const,
    href: "/viruses",
  },
];

const GLOSSARY_KEYS: MetricKey[] = [
  "activeCases",
  "confirmedCases",
  "deaths",
  "recovered",
  "cfr",
  "growthRate",
  "pressure",
  "recoveryRatio",
  "severityScore",
  "confidence",
  "staleness",
  "trackedViruses",
  "newCases7d",
  "incidencePer100k",
];

const COVERAGE_KEYS: Array<keyof typeof COVERAGE_COPY> = ["live", "periodic", "curated"];

const LIMITATIONS = [
  "Reporting lags: a country or agency may take days (or longer) to publish updated figures, so the most recent numbers can undercount what's really happening.",
  "Definitions differ: what counts as a \"confirmed case\" or a \"death from\" a virus isn't standardized across every country, so totals aren't always perfectly comparable.",
  "Some totals are estimates: viruses without a live public feed use curated, periodically reviewed figures rather than day-by-day counts.",
  "This is not medical advice: nothing on this site is a substitute for guidance from a doctor or public health authority.",
];

export default function AboutDataPage() {
  return (
    <div className="space-y-12">
      <Reveal as="header">
        <SectionHeader
          eyebrow="Methodology"
          title="Where our numbers come from"
          description="We combine public data from health agencies and research groups. Here's exactly what feeds each chart — and what the limits are."
        />
      </Reveal>

      <Reveal as="section" className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Data sources</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.map((source) => (
            <SourceCard key={source.name} {...source} />
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Live vs. curated</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COVERAGE_KEYS.map((key) => (
            <Card key={key}>
              <p className="text-sm font-semibold text-text-primary">{COVERAGE_COPY[key].label}</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{COVERAGE_COPY[key].description}</p>
            </Card>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Glossary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GLOSSARY_KEYS.map((key) => {
            const entry = METRIC_COPY[key];
            return (
              <Card key={key} id={key} className="scroll-mt-24">
                <h3 className="text-sm font-semibold text-text-primary">{entry.label}</h3>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-text-faint">{entry.technical}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{entry.explainer}</p>
              </Card>
            );
          })}
        </div>
      </Reveal>

      <Reveal as="section" className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Limitations</h2>
        <Card>
          <ul className="space-y-3">
            {LIMITATIONS.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>

      <Reveal as="section" className="flex flex-wrap gap-3">
        <Button href="/">Back to dashboard</Button>
        <Button href="/viruses" variant="outline">
          Browse tracked viruses
        </Button>
      </Reveal>
    </div>
  );
}
