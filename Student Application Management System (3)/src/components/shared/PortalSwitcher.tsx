import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Briefcase, ChevronUp, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { User as UserType } from '../../lib/types';
import { getStaffUsers, getAgentUsers, getRoleLabel, isAdminRole } from '../../lib/mockUsers';
import { toast } from 'sonner@2.0.3';

export function PortalSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const staffUsers = getStaffUsers();
  const agentUsers = getAgentUsers();

  // Load current user
  useEffect(() => {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, [location.pathname]);

  const isOnLoginPage = location.pathname === '/login' || location.pathname === '/';
  const isStaffPortal = location.pathname.startsWith('/staff');
  const isAgentPortal = location.pathname.startsWith('/agent');

  const handleUserSelect = (user: UserType) => {
    // Store user in localStorage
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('auth_token', 'mock_token_' + Date.now());
    setCurrentUser(user);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userChanged'));
    
    toast.success(`Switched to ${user.name}`);
    
    // Navigate based on user role
    if (user.role === 'agent') {
      navigate('/agent/dashboard');
    } else {
      navigate('/staff/dashboard');
    }
    
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Expanded Options */}
      {isExpanded && (
        <Card className="shadow-xl border-2 animate-in slide-in-from-bottom-2 duration-200 max-h-[500px] w-[280px]">
          <ScrollArea className="h-full max-h-[500px]">
            <div className="p-3">
              {/* Current User Display */}
              {currentUser && !isOnLoginPage && (
                <>
                  <div className="mb-3 p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Current User</p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{currentUser.name}</p>
                        {isAdminRole(currentUser.role) && (
                          <Badge variant="secondary" className="text-xs mt-0.5">
                            {getRoleLabel(currentUser.role)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Separator className="mb-3" />
                </>
              )}

              {/* Staff Users */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">STAFF MEMBERS</p>
                </div>
                <div className="space-y-1">
                  {staffUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant={currentUser?.id === user.id ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start gap-2 h-auto py-2"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs flex-shrink-0">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm truncate">{user.name}</p>
                          {isAdminRole(user.role) && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 mt-0.5">
                              {getRoleLabel(user.role)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="my-3" />

              {/* Agent Users */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-2">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">AGENTS</p>
                </div>
                <div className="space-y-1">
                  {agentUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant={currentUser?.id === user.id ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start gap-2 h-auto py-2"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs flex-shrink-0">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm truncate">{user.name}</p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Main Toggle Button */}
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronUp className="h-6 w-6" />
        ) : currentUser ? (
          <div className="text-xs font-bold">
            {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </div>
        ) : isStaffPortal ? (
          <Users className="h-6 w-6" />
        ) : (
          <Briefcase className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}