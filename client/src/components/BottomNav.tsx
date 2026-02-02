import { Link, useLocation } from "wouter";
import { Home, Ticket, User, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  role: "customer" | "barber";
}

export function BottomNav({ role }: BottomNavProps) {
  const [location] = useLocation();

  const customerLinks = [
    { href: "/customer", icon: Home, label: "Home" },
    { href: "/customer/my-tokens", icon: Ticket, label: "My Tokens" },
    { href: "/customer/profile", icon: User, label: "Profile" },
  ];

  const barberLinks = [
    { href: "/barber", icon: Home, label: "Dashboard" },
    { href: "/barber/queue", icon: Scissors, label: "Queue" },
    { href: "/barber/profile", icon: User, label: "Profile" },
  ];

  const links = role === "customer" ? customerLinks : barberLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-bottom pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href} className="w-full h-full">
              <div
                className={cn(
                  "flex flex-col items-center justify-center h-full w-full cursor-pointer transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-current/10")} />
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
