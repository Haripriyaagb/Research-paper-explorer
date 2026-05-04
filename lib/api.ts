export interface Paper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  year: number;
  category: string;
  url?: string;
  citationCount?: number;
}

export type SortOption = "relevance" | "citations" | "year_desc" | "year_asc";

export async function fetchPapersFromAPI({
  query,
  year,
  limit = 50,
}: {
  query?: string;
  year?: string;
  limit?: number;
}): Promise<Paper[]> {
  const params = new URLSearchParams();
  params.set("query", query?.trim() || "deep learning neural networks");
  if (year && year !== "all") params.set("year", year);
  params.set("limit", String(limit));

  const res = await fetch(`/api/papers?${params}`);

  if (!res.ok) {
    let message = `API error (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const data = await res.json();

  if (!Array.isArray(data?.data)) {
    throw new Error("Unexpected response format from API");
  }

  return data.data
    .filter((p: any) => p?.title && p?.abstract && p?.year)
    .map((p: any): Paper => ({
      id: p.paperId,
      title: p.title,
      authors: (p.authors ?? []).slice(0, 5).map((a: any) => a?.name).filter(Boolean),
      summary: p.abstract,
      year: Number(p.year),
      category: inferCategory(p.fieldsOfStudy, p.title, p.abstract),
      url:
        p.openAccessPdf?.url ??
        (p.externalIds?.DOI
          ? `https://doi.org/${p.externalIds.DOI}`
          : `https://www.semanticscholar.org/paper/${p.paperId}`),
      citationCount: p.citationCount ?? 0,
    }));
}

function inferCategory(fields: any[], title: string, abstract: string): string {
  if (Array.isArray(fields) && fields.length > 0) {
    const names = fields.map((f: any) =>
      (typeof f === "string" ? f : f?.category ?? "").toLowerCase()
    );
    if (names.some((n) => n.includes("vision") || n.includes("image"))) return "Computer Vision";
    if (names.some((n) => n.includes("natural language") || n.includes("nlp") || n.includes("linguistics"))) return "Natural Language Processing";
    if (names.some((n) => n.includes("reinforcement"))) return "Reinforcement Learning";
    if (names.some((n) => n.includes("robot"))) return "Robotics";
    if (names.some((n) => n.includes("biol") || n.includes("biomed") || n.includes("genomic"))) return "Biology";
    if (names.some((n) => n.includes("physic"))) return "Physics";
    if (names.some((n) => n.includes("math") || n.includes("statistic"))) return "Mathematics";
    if (names.some((n) => n.includes("medicine") || n.includes("medical") || n.includes("clinical"))) return "Medicine";
  }
  const text = `${title} ${abstract}`.toLowerCase();
  if (/\bvision\b|image classif|object detect|segmentation\b|convolutional/.test(text)) return "Computer Vision";
  if (/natural language|\bnlp\b|language model|text classif|bert\b|gpt|transformer/.test(text)) return "Natural Language Processing";
  if (/reinforcement learn|reward function|policy gradient|q-learning|markov decision/.test(text)) return "Reinforcement Learning";
  if (/\brobot|locomotion|manipulation|actuator/.test(text)) return "Robotics";
  return "Machine Learning";
}

export function sortPapers(papers: Paper[], sort: SortOption): Paper[] {
  const copy = [...papers];
  switch (sort) {
    case "citations": return copy.sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0));
    case "year_desc": return copy.sort((a, b) => b.year - a.year);
    case "year_asc": return copy.sort((a, b) => a.year - b.year);
    case "relevance":
    default: return copy; // API returns by relevance
  }
}

export function getUniqueYears(papers: Paper[]): number[] {
  return [...new Set(papers.map((p) => p.year).filter(Boolean))].sort((a, b) => b - a);
}

export function getUniqueCategories(papers: Paper[]): string[] {
  return [...new Set(papers.map((p) => p.category))].sort();
}

// Saved papers — localStorage helpers
const SAVED_KEY = "rpe_saved_papers";

export function getSavedPapers(): Paper[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch { return []; }
}

export function savePaper(paper: Paper): void {
  const saved = getSavedPapers();
  if (!saved.find((p) => p.id === paper.id)) {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...saved, paper]));
  }
}

export function unsavePaper(id: string): void {
  const saved = getSavedPapers().filter((p) => p.id !== id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
}

export function isPaperSaved(id: string): boolean {
  return getSavedPapers().some((p) => p.id === id);
}
