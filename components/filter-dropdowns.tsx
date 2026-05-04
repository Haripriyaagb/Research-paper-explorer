"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterDropdownsProps {
  yearFilter: string;
  categoryFilter: string;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
  years: number[];
  categories: string[];
}

export function FilterDropdowns({
  yearFilter,
  categoryFilter,
  onYearChange,
  onCategoryChange,
  onClearFilters,
  years,
  categories,
}: FilterDropdownsProps) {
  const hasActiveFilters = yearFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={yearFilter} onValueChange={onYearChange}>
        <SelectTrigger className="w-[130px] bg-card border-border/50 h-9 text-sm">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[190px] bg-card border-border/50 h-9 text-sm">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 px-2.5 text-muted-foreground hover:text-foreground gap-1 text-xs"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
