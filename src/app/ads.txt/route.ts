import { env } from "@/lib/config";

/** Google Ads / AdSense ads.txt certification authority ID (Google as exchange). */
const GOOGLE_CA_ID = "f08c47fec0942fa0";

/**
 * Serves https://spec.example/ads.txt for AdSense authorization crawlers.
 * @see https://support.google.com/adsense/answer/7532444
 */
export async function GET() {
  const client = env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() ?? "";
  const match = /^ca-(pub-\d+)$/i.exec(client);

  if (!match) {
    return new Response(
      "# AdSense: set NEXT_PUBLIC_ADSENSE_CLIENT to ca-pub-XXXXXXXX\n",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  }

  const pubId = match[1].toLowerCase();
  const body = `google.com, ${pubId}, DIRECT, ${GOOGLE_CA_ID}\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
