import { NextRequest, NextResponse } from "next/server";

const SS_BASE = "https://api.semanticscholar.org/graph/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() || "deep learning neural networks";
  const year = searchParams.get("year");
  const limit = searchParams.get("limit") || "50";

  const params = new URLSearchParams({
    query,
    limit,
    fields:
      "paperId,title,authors,abstract,year,fieldsOfStudy,externalIds,citationCount,openAccessPdf",
  });

  if (year && year !== "all") {
    params.set("year", `${year}-${year}`);
  }

  try {
    const res = await fetch(`${SS_BASE}/paper/search?${params}`, {
      headers: {
        "User-Agent": "ResearchPaperExplorer/1.0 (educational)",
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`SS API ${res.status}:`, text);
      return NextResponse.json(
        { error: `Could not reach Semantic Scholar (${res.status}). Please try again.` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (err: any) {
    console.error("Papers route error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Network error reaching Semantic Scholar" },
      { status: 500 }
    );
  }
}
