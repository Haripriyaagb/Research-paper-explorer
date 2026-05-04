"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { SearchBar } from "@/components/search-bar";
import { FilterDropdowns } from "@/components/filter-dropdowns";
import { PaperList } from "@/components/paper-list";
import { SortSelect } from "@/components/sort-select";
import { SavedPapersPanel } from "@/components/saved-papers-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, RefreshCw, AlertCircle, Bookmark } from "lucide-react";
import {
  fetchPapersFromAPI,
  sortPapers,
  getUniqueYears,
  getUniqueCategories,
  getSavedPapers,
  type Paper,
  type SortOption,
} from "@/lib/api";

export default function Home() {
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  const [activeTab, setActiveTab] = useState("explore");

  const lastFetchRef = useRef<{ query: string; year: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load saved papers from localStorage ──────────────────────────────────
  const refreshSaved = useCallback(() => {
    setSavedPapers(getSavedPapers());
  }, []);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  // ── Core API fetch ────────────────────────────────────────────────────────
  const doFetch = useCallback(async (query: string, year: string) => {
    if (
      lastFetchRef.current &&
      lastFetchRef.current.query === query &&
      lastFetchRef.current.year === year
    ) return;

    lastFetchRef.current = { query, year };
    setLoading(true);
    setError(null);

    try {
      const results = await fetchPapersFromAPI({ query, year, limit: 50 });
      setAllPapers(results);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch papers.");
      setAllPapers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch("", "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced re-fetch on search/year change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doFetch(searchQuery, yearFilter);
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, yearFilter]);

  // ── Derived values ────────────────────────────────────────────────────────
  const years = useMemo(() => getUniqueYears(allPapers), [allPapers]);
  const categories = useMemo(() => getUniqueCategories(allPapers), [allPapers]);

  // Reset stale category when results change
  useEffect(() => {
    if (categoryFilter !== "all" && !categories.includes(categoryFilter)) {
      setCategoryFilter("all");
    }
  }, [categories, categoryFilter]);

  const displayedPapers = useMemo(() => {
    let papers = allPapers;
    if (categoryFilter !== "all") {
      papers = papers.filter((p) => p.category === categoryFilter);
    }
    return sortPapers(papers, sortBy);
  }, [allPapers, categoryFilter, sortBy]);

  function clearFilters() {
    setYearFilter("all");
    setCategoryFilter("all");
    setSortBy("relevance");
  }

  const hasActiveFilters = yearFilter !== "all" || categoryFilter !== "all";

  return (
    <main className="min-h-screen bg-background">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  Research Paper Explorer
                </h1>
                <p className="text-xs text-muted-foreground">
                  Live results via Semantic Scholar
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/50">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger
                value="explore"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium"
              >
                Explore Papers
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium gap-2"
              >
                <Bookmark className="h-3.5 w-3.5" />
                Saved
                {savedPapers.length > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                    {savedPapers.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Explore Tab ─────────────────────────────────────────────────── */}
          <TabsContent value="explore" className="mt-0">
            {/* Search + Filters toolbar */}
            <section className="border-b border-border/50 bg-card/30 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 max-w-xl">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <FilterDropdowns
                    yearFilter={yearFilter}
                    categoryFilter={categoryFilter}
                    onYearChange={(v) => { setCategoryFilter("all"); setYearFilter(v); }}
                    onCategoryChange={setCategoryFilter}
                    onClearFilters={clearFilters}
                    years={years}
                    categories={categories}
                  />
                </div>
              </div>
            </section>

            {/* Results section */}
            <section className="py-6">
              {error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="rounded-full bg-destructive/10 p-5">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Failed to load papers
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 max-w-sm">{error}</p>
                    <button
                      onClick={() => {
                        lastFetchRef.current = null;
                        doFetch(searchQuery, yearFilter);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Results bar */}
                  <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Fetching papers…
                        </span>
                      ) : (
                        <>
                          <span className="font-medium text-foreground">
                            {displayedPapers.length}
                          </span>{" "}
                          {displayedPapers.length === 1 ? "paper" : "papers"}
                          {categoryFilter !== "all" && (
                            <> in <span className="font-medium text-foreground">{categoryFilter}</span></>
                          )}
                          {yearFilter !== "all" && (
                            <>, <span className="font-medium text-foreground">{yearFilter}</span></>
                          )}
                        </>
                      )}
                    </p>
                    {!loading && displayedPapers.length > 0 && (
                      <SortSelect value={sortBy} onChange={setSortBy} />
                    )}
                  </div>
                  <PaperList
                    papers={displayedPapers}
                    loading={loading}
                    onSaveChange={refreshSaved}
                  />
                </>
              )}
            </section>
          </TabsContent>

          {/* ── Saved Tab ───────────────────────────────────────────────────── */}
          <TabsContent value="saved" className="mt-0 py-6">
            <SavedPapersPanel papers={savedPapers} onSaveChange={refreshSaved} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
