import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navClass =
  "font-display text-[14px] font-bold uppercase tracking-[0.14em] text-foreground/90 hover:text-primary transition-colors md:text-[15px] md:tracking-[0.16em]";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  const centerLinks = [
    { href: "/events", label: "Events" },
    { href: "/explore", label: "Clubs" },
    { href: "/fit-purse", label: "Fit Purse" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1a1a1a] bg-[#0a0a0a]">
      <div className="container">
        <div className="flex h-[4.5rem] items-center justify-between gap-3 sm:gap-5 md:h-[5.25rem] md:gap-6">
          <Link href="/" className="group flex shrink-0 items-center py-1">
            <img
              src="/treadgram-logo.png"
              alt="Treadgram"
              width={280}
              height={56}
              className="h-10 w-auto max-w-[min(260px,52vw)] object-contain object-left transition-[filter] group-hover:brightness-110 sm:h-11 md:h-12 md:max-w-[min(300px,36vw)] lg:h-14"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-12 md:flex lg:gap-16">
            {centerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(navClass, location === link.href && "text-primary")}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" size="default" asChild className="hidden h-11 px-5 text-[13px] sm:inline-flex">
                  <Link href="/submit">
                    <Plus className="size-4" />
                    Add club
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-11 gap-2 px-2 font-display text-[13px] font-bold uppercase tracking-[0.12em] md:px-3"
                    >
                      <Avatar className="size-10 rounded-none">
                        <AvatarFallback className="rounded-none bg-secondary text-sm font-bold text-primary">
                          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-[9rem] truncate sm:inline">
                        {user?.name?.split(" ")[0] ?? "Account"}
                      </span>
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-none border-border bg-card">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold">{user?.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild className="rounded-none focus:bg-secondary">
                      <Link href="/my-clubs" className="flex items-center gap-2">
                        <User className="size-4" /> My clubs
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="rounded-none focus:bg-secondary">
                        <Link href="/admin" className="flex items-center gap-2">
                          <Shield className="size-4" /> Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-none text-destructive focus:text-destructive flex items-center gap-2"
                    >
                      <LogOut className="size-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <a
                  href={getLoginUrl()}
                  className="hidden py-2 font-display text-[13px] font-bold uppercase tracking-[0.14em] text-foreground hover:text-primary sm:inline-block md:text-[14px]"
                >
                  Login
                </a>
                <Button className="hidden h-11 min-w-[5.5rem] px-6 text-[13px] sm:inline-flex" asChild>
                  <Link href="/signup">Join</Link>
                </Button>
                <Button className="h-11 min-w-[5rem] px-5 text-[13px] sm:hidden" asChild>
                  <Link href="/signup">Join</Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              className="size-11 shrink-0 rounded-none md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#1a1a1a] py-4 md:hidden">
            <div className="flex flex-col gap-0">
              {centerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-1 py-4 font-display text-[15px] font-bold uppercase tracking-[0.14em]",
                    location === link.href ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <a
                  href={getLoginUrl()}
                  className="px-1 py-4 font-display text-[15px] font-bold uppercase tracking-[0.14em] text-foreground/80"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </a>
              )}
              {isAuthenticated && (
                <>
                  <Link
                    href="/my-clubs"
                    onClick={() => setMobileOpen(false)}
                    className="px-1 py-4 font-display text-[15px] font-bold uppercase tracking-[0.14em] text-foreground/80"
                  >
                    My clubs
                  </Link>
                  <Link
                    href="/submit"
                    onClick={() => setMobileOpen(false)}
                    className="px-1 py-4 font-display text-[15px] font-bold uppercase tracking-[0.14em] text-foreground/80"
                  >
                    Add club
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="px-1 py-4 font-display text-[15px] font-bold uppercase tracking-[0.14em] text-foreground/80"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
