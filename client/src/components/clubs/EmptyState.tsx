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
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        {icon ?? <SearchX className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">{description}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
