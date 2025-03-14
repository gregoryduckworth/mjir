import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Workflow 
} from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: <Home size={18} />, label: "Dashboard", href: "/" },
    { icon: <Calendar size={18} />, label: "Holiday", href: "/holiday" },
    { icon: <FileText size={18} />, label: "Policies", href: "/policies" },
    { icon: <GraduationCap size={18} />, label: "Learning", href: "/learning" },
    { icon: <Workflow size={18} />, label: "Org", href: "/organization" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-lg z-10 border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center"
          >
            <span className={cn(
              "text-lg",
              location === item.href ? "text-primary" : "text-gray-500"
            )}>
              {item.icon}
            </span>
            <span className={cn(
              "text-xs mt-1",
              location === item.href ? "text-primary" : "text-gray-500"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
