"use client";

import { getSavedPapers, unsavePaper, type Paper } from "@/lib/api";
import { PaperCard } from "./paper-card";
import { BookmarkX, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedPapersPanelProps {
  papers: Paper[];
  onSaveChange: () => void;
}

export function SavedPapersPanel({ papers, onSaveChange }: SavedPapersPanelProps) {
  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-5 mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No saved papers yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Click the bookmark icon on any paper card to save it here for later.
        </p>
      </div>
    );
  }

  function clearAll() {
    papers.forEach((p) => unsavePaper(p.id));
    onSaveChange();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{papers.length}</span>{" "}
          saved {papers.length === 1 ? "paper" : "papers"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-muted-foreground hover:text-destructive gap-1.5 text-xs"
        >
          <BookmarkX className="h-3.5 w-3.5" />
          Clear all
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {papers.map((paper) => (
          <PaperCard key={paper.id} {...paper} onSaveChange={onSaveChange} />
        ))}
      </div>
    </div>
  );
}
