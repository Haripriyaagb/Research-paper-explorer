"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search papers by title, author, or keyword..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 pr-4 h-12 text-base bg-card border-border/50 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
      />
    </div>
  );
}
