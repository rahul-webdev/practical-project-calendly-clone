import { ReactNode } from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Calendar, LayoutDashboard, CalendarDays, Users, Settings, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Schedule", url: "/dashboard/schedule", icon: CalendarDays },
  { title: "Meetings", url: "/dashboard/meetings", icon: Users },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

function SidebarNav() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const navigate = useNavigate();
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">Schedulr</span>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center mx-auto">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-primary font-semibold" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5",
                          isActive ? "text-sidebar-primary" : "text-muted-foreground"
                        )} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-3 border-t border-sidebar-border">
        <SidebarMenuButton asChild>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </SidebarMenuButton>
      </div>
    </Sidebar>
  );
}

function DashboardHeader() {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-4 gap-4">
      <SidebarTrigger>
        <Button variant="ghost" size="icon">
          <Menu className="w-5 h-5" />
        </Button>
      </SidebarTrigger>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-sm font-semibold text-secondary-foreground">JD</span>
        </div>
      </div>
    </header>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <SidebarNav />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}