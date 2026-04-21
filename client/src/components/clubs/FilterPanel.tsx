import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CITIES, SPORTS } from "../../../../shared/constants";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface FilterState {
  search: string;
  city: string;
  sport: string;
  pricingType: string;
  beginnerFriendly: boolean;
  verified: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  city: "",
  sport: "",
  pricingType: "",
  beginnerFriendly: false,
  verified: false,
};

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  className?: string;
}

export default function FilterPanel({ filters, onChange, className }: FilterPanelProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onChange({ ...filters, search: searchInput });
    }, 350);
    return () => clearTimeout(debounceRef.current!);
  }, [searchInput]);

  const hasActiveFilters =
    filters.city || filters.sport || filters.pricingType || filters.beginnerFriendly || filters.verified || filters.search;

  const reset = () => {
    setSearchInput("");
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className={cn("bg-card rounded-xl border border-border p-5 space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <Filter className="w-4 h-4 text-primary" />
          Filters
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs gap-1 text-muted-foreground">
            <X className="w-3 h-3" /> Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search clubs..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">City</Label>
        <Select
          value={filters.city || "all"}
          onValueChange={(v) => onChange({ ...filters, city: v === "all" ? "" : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {CITIES.map((city) => (
              <SelectItem key={city.key} value={city.key}>
                {city.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sport */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sport</Label>
        <Select
          value={filters.sport || "all"}
          onValueChange={(v) => onChange({ ...filters, sport: v === "all" ? "" : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sports</SelectItem>
            {SPORTS.map((sport) => (
              <SelectItem key={sport.key} value={sport.key}>
                {sport.emoji} {sport.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pricing */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pricing</Label>
        <Select
          value={filters.pricingType || "all"}
          onValueChange={(v) => onChange({ ...filters, pricingType: v === "all" ? "" : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any pricing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any pricing</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="donation">Donation-based</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="beginner" className="text-sm font-medium cursor-pointer">
            Beginner Friendly
          </Label>
          <Switch
            id="beginner"
            checked={filters.beginnerFriendly}
            onCheckedChange={(v) => onChange({ ...filters, beginnerFriendly: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="verified" className="text-sm font-medium cursor-pointer">
            Verified Only
          </Label>
          <Switch
            id="verified"
            checked={filters.verified}
            onCheckedChange={(v) => onChange({ ...filters, verified: v })}
          />
        </div>
      </div>
    </div>
  );
}
