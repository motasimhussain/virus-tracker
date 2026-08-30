import Link from "next/link";

const EXPLORE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/map", label: "World Map" },
  { href: "/news", label: "Outbreak News" },
  { href: "/viruses", label: "Virus Guide" },
  { href: "/about-data", label: "About the Data" },
] as const;

const DATA_SOURCES = [
  { href: "https://disease.sh/", label: "disease.sh" },
  { href: "https://delphi.cmu.edu/", label: "CDC FluView via Delphi" },
  { href: "https://www.who.int/data/gho", label: "WHO GHO" },
  { href: "https://ourworldindata.org/", label: "Our World in Data" },
  { href: "https://www.who.int/emergencies/disease-outbreak-news", label: "WHO Disease Outbreak News" },
  { href: "https://reliefweb.int/", label: "ReliefWeb" },
  { href: "https://promedmail.org/", label: "ProMED" },
  { href: "https://www.cdc.gov/outbreaks/index.html", label: "CDC Outbreaks" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-default bg-surface-page">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="text-sm font-bold tracking-[0.2em] text-text-primary">VIRUS TRACKER</p>
          <p className="text-sm text-text-secondary">
            Virus Tracker turns public outbreak data into plain-English heat maps, trends, and
            news so anyone can follow what&apos;s spreading and where.
          </p>
          <p className="text-xs text-text-faint">
            Figures are estimates compiled from public sources and can lag or differ from
            official counts. Not medical advice.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Explore</p>
          <ul className="space-y-2 text-sm">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-text-secondary hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Data sources</p>
          <ul className="space-y-2 text-sm">
            {DATA_SOURCES.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-accent"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border-default">
        <div className="mx-auto w-full max-w-7xl px-6 py-4 text-xs text-text-faint">
          © {year} Virus Tracker
        </div>
      </div>
    </footer>
  );
}
