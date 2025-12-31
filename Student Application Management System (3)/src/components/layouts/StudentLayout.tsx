import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

export default function StudentLayout() {
  const location = useLocation();

  // Get current page title
  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const titleMap: Record<string, string> = {
      'track': 'Track Application',
      'status': 'Application Status',
    };

    // Get the last meaningful segment
    for (let i = pathSegments.length - 1; i >= 0; i--) {
      const segment = pathSegments[i];
      
      // Skip 'student' segment
      if (segment === 'student') continue;
      
      // Check if it's an ID (reference number)
      if (segment.match(/^CHU-\d{4}-\d{5}$/)) {
        return 'Application Details';
      }
      
      return titleMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    
    return 'Track Application';
  };

  const pageTitle = getPageTitle();

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href?: string }[] = [
      { label: 'Application Tracking', href: '/student/track' }
    ];

    // Map path segments to breadcrumb labels
    const labelMap: Record<string, string> = {
      'student': 'Student Portal',
      'track': 'Track Application',
      'status': 'Application Status',
    };

    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;

      // Skip 'student' segment
      if (segment === 'student') continue;

      // Check if it's an ID (UUID pattern or reference number)
      if (segment.match(/^[a-f0-9-]{36}$|^CHU-\d{4}-\d{5}$/)) {
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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Simple header for student portal */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground">C</span>
              </div>
              <div className="hidden md:block">
                <h2 className="text-sm">Churchill University</h2>
                <p className="text-xs text-muted-foreground">Application Tracking</p>
              </div>
            </div>
          </div>
          
          {/* Page Title and Breadcrumb */}
          <div className="flex flex-col gap-1 items-end">
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
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}