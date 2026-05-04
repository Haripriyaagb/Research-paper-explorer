"use client";

import { PaperCard } from "./paper-card";
import { FileSearch } from "lucide-react";
import { type Paper } from "@/lib/api";

interface PaperListProps {
  papers: Paper[];
  loading?: boolean;
  onSaveChange?: () => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 animate-pulse flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="h-5 bg-muted rounded-full w-24" />
        <div className="h-5 bg-muted rounded-full w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-4/5" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
        <div className="h-3 bg-muted rounded w-3/4" />
      </div>
      <div className="flex gap-4 mt-auto">
        <div className="h-3 bg-muted rounded w-28" />
        <div className="h-3 bg-muted rounded w-12" />
      </div>
    </div>
  );
}

export function PaperList({ papers, loading, onSaveChange }: PaperListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-5 mb-4">
          <FileSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No papers found</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Try adjusting your search terms or clearing some filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {papers.map((paper) => (
        <PaperCard key={paper.id} {...paper} onSaveChange={onSaveChange} />
      ))}
    </div>
  );
}
