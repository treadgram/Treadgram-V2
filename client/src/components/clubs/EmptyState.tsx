import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";
import { Link } from "wouter";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = "No clubs found",
  description = "Try adjusting your filters or be the first to add a club in this area.",
  action,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 flex size-16 items-center justify-center border border-[#222222] bg-[#141414]">
        {icon ?? <SearchX className="size-8 text-muted-foreground" />}
      </div>
      <h3 className="mb-2 font-display text-xl font-black uppercase tracking-wide text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-[15px] leading-relaxed text-[#aaaaaa]">{description}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
