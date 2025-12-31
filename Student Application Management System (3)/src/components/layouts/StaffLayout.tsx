import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, CheckSquare, Video, FileCheck, Bell, LogOut, ChevronUp, User2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { User, Role } from '../../lib/types';
import { getRoleLabel } from '../../lib/mockUsers';

const navigation = [
  { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
  { name: 'Application Queue', href: '/staff/queue', icon: ClipboardList },
  { name: 'Tasks', href: '/staff/tasks', icon: CheckSquare },
  { name: 'Interviews', href: '/staff/interviews', icon: Video },
  { name: 'COE Management', href: '/staff/coe', icon: FileCheck },
];

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  // Get current page title
  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const titleMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'queue': 'Application Queue',
      'tasks': 'Tasks',
      'interviews': 'Interviews',
      'coe': 'COE Management',
      'new': 'New Entry',
      'edit': 'Edit Entry',
      'details': 'Details',
    };

    // Get the last meaningful segment
    for (let i = pathSegments.length - 1; i >= 0; i--) {
      const segment = pathSegments[i];
      
      // Skip 'staff' segment
      if (segment === 'staff') continue;
      
      // Check if it's an ID (UUID pattern or number)
      if (segment.match(/^[a-f0-9-]{36}$|^\d+$/)) {
        // If it's an ID, use the previous segment's context
        if (i > 0) {
          const previousSegment = pathSegments[i - 1];
          if (previousSegment === 'queue') {
            return 'Application Details';
          } else if (previousSegment === 'interviews') {
            return 'Interview Details';
          } else if (previousSegment === 'coe') {
            return 'COE Details';
          }
        }
        return 'Details';
      }
      
      return titleMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    
    return 'Dashboard';
  };

  const pageTitle = getPageTitle();

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href?: string }[] = [
      { label: 'Staff Portal', href: '/staff/dashboard' }
    ];

    // Map path segments to breadcrumb labels
    const labelMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'queue': 'Application Queue',
      'tasks': 'Tasks',
      'interviews': 'Interviews',
      'coe': 'COE Management',
      'new': 'New',
      'edit': 'Edit',
      'details': 'Details',
    };

    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;

      // Skip 'staff' segment
      if (segment === 'staff') continue;

      // Check if it's an ID (UUID pattern or number)
      if (segment.match(/^[a-f0-9-]{36}$|^\d+$/)) {
        breadcrumbs.push({ label: 'Details' });
      } else {
        const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        // Don't add href for the last segment (current page)
        const isLast = i === pathSegments.length - 1;
        breadcrumbs.push({ 
          label, 
          href: isLast ? undefined : currentPath 
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // State to hold user data
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch user data from local storage and listen for changes
  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    // Load user on mount
    loadUser();

    // Listen for storage changes (when user switches in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current_user') {
        loadUser();
      }
    };

    // Listen for custom user change event (when user switches in same tab)
    const handleUserChange = () => {
      loadUser();
    };

    // Listen for focus event (when returning to tab)
    const handleFocus = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleUserChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Get user initials
  const getUserInitials = () => {
    if (!currentUser) return 'ST';
    const names = currentUser.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return currentUser.name.substring(0, 2).toUpperCase();
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/staff/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span>C</span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate">Churchill University</span>
                    <span className="truncate text-xs text-muted-foreground">Staff Portal</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.href}>
                          <item.icon />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate">{currentUser?.name || 'Sarah Reviewer'}</span>
                      <span className="truncate text-xs text-muted-foreground">{currentUser?.email || 'sarah@churchill.edu'}</span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate">{currentUser?.name || 'Sarah Reviewer'}</span>
                        <span className="truncate text-xs text-muted-foreground">{currentUser?.email || 'sarah@churchill.edu'}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User2 className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          
          {/* Page Title and Breadcrumb */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h1 className="text-lg truncate">{pageTitle}</h1>
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    1
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-3 hover:bg-muted cursor-pointer">
                    <p className="text-sm">New application assigned: CHU-2024-00001</p>
                    <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex flex-1 flex-col p-4 w-full min-w-0 max-w-full overflow-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}