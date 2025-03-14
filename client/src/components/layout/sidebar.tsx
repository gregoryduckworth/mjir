import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Workflow, 
  LogOut 
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarItem = ({ icon, label, href, isActive }: SidebarItemProps) => {
  return (
    <li className={cn(
      "border-l-4 border-transparent",
      isActive && "border-l-4 border-primary bg-primary/5"
    )}>
      <Link 
        href={href}
        className={cn(
          "flex items-center px-6 py-3 hover:text-primary hover:bg-gray-50",
          isActive ? "text-primary" : "text-gray-600"
        )}
      >
        <span className="w-5">{icon}</span>
        <span className="ml-3">{label}</span>
      </Link>
    </li>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { icon: <Home size={18} />, label: "Dashboard", href: "/" },
    { icon: <Calendar size={18} />, label: "Holiday Requests", href: "/holiday" },
    { icon: <FileText size={18} />, label: "Company Policies", href: "/policies" },
    { icon: <GraduationCap size={18} />, label: "Learning & Development", href: "/learning" },
    { icon: <Workflow size={18} />, label: "Organization", href: "/organization" },
  ];

  return (
    <aside className="fixed top-0 left-0 w-[280px] h-full bg-white shadow-md z-10 hidden md:block">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="font-bold">HR</span>
          </div>
          <h1 className="text-xl font-semibold">HR Portal</h1>
        </div>
      </div>
      
      <div className="py-4">
        {user && (
          <Link href={`/profile/${user.id}`} className="block">
            <div className="px-6 py-3 mb-4 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.position}</p>
                  <span className="text-xs text-primary">View profile</span>
                </div>
              </div>
            </div>
          </Link>
        )}
        
        <nav>
          <ul>
            {navItems.map((item) => (
              <SidebarItem 
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={location === item.href}
              />
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-4 text-gray-600 hover:text-primary"
        >
          <LogOut size={18} className="w-5" />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  );
}
