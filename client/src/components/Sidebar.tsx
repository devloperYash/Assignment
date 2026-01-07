import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Store,
  Users,
  Star,
  LogOut,
  UserCircle,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "store_owner"],
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Stores",
      href: "/stores",
      icon: Store,
      roles: ["admin", "user"], // Stores list is home for user
    },
    {
      name: "My Ratings",
      href: "/my-ratings",
      icon: Star,
      roles: ["user"],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user.role));

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" onClick={toggle} className="bg-background/80 backdrop-blur-md shadow-lg">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center px-6 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                R
              </div>
              <span className="font-display font-bold text-xl tracking-tight">RateIt</span>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="p-6 pb-2">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground")} />
                    {link.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/50 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => logout.mutate()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
