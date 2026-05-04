"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink, Users, Calendar, TrendingUp, Bookmark, BookmarkCheck, BookOpen } from "lucide-react";
import { savePaper, unsavePaper, isPaperSaved, type Paper } from "@/lib/api";

interface PaperCardProps extends Paper {
  onSaveChange?: () => void;
}

export function PaperCard({ onSaveChange, ...paper }: PaperCardProps) {
  const { title, authors, summary, year, category, url, citationCount } = paper;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isPaperSaved(paper.id));
  }, [paper.id]);

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      unsavePaper(paper.id);
      setSaved(false);
    } else {
      savePaper(paper);
      setSaved(true);
    }
    onSaveChange?.();
  }

  const citationLabel =
    citationCount && citationCount > 0
      ? citationCount >= 1000
        ? `${(citationCount / 1000).toFixed(1)}k`
        : citationCount.toString()
      : null;

  return (
    <Dialog>
      <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 bg-card flex flex-col relative overflow-hidden">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="pb-3 pr-12">
          {/* Bookmark button */}
          <button
            onClick={toggleSave}
            className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
            title={saved ? "Remove from saved" : "Save paper"}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-start gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs shrink-0">
              {category}
            </Badge>
            {citationLabel && (
              <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground gap-1">
                <TrendingUp className="h-3 w-3" />
                {citationLabel} citations
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-base leading-snug text-card-foreground group-hover:text-primary transition-colors line-clamp-2 mt-1">
            {title}
          </h3>
        </CardHeader>

        <CardContent className="pb-4 flex-1">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {summary}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-[180px]">
                {authors.length > 0
                  ? authors.slice(0, 3).join(", ") + (authors.length > 3 ? ` +${authors.length - 3}` : "")
                  : "Unknown authors"}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {year}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-0 gap-2">
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="px-0 text-primary hover:text-primary/80 hover:bg-transparent text-sm h-auto py-0 gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              View details
            </Button>
          </DialogTrigger>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Read paper
            </a>
          )}
        </CardFooter>
      </Card>

      {/* Detail Modal */}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary">{category}</Badge>
            <Badge variant="outline" className="text-muted-foreground">{year}</Badge>
            {citationLabel && (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                <TrendingUp className="h-3 w-3" />
                {citationLabel} citations
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-semibold leading-snug pr-4">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Authors */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Authors</p>
            <div className="flex flex-wrap gap-2">
              {authors.length > 0 ? authors.map((author, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-sm bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full">
                  {author}
                </span>
              )) : (
                <span className="text-sm text-muted-foreground">Unknown authors</span>
              )}
            </div>
          </div>

          {/* Abstract */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Abstract</p>
            <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border/50">
            <Button
              variant={saved ? "secondary" : "default"}
              size="sm"
              onClick={toggleSave}
              className="gap-2"
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Saved" : "Save paper"}
            </Button>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open full paper
                </Button>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
