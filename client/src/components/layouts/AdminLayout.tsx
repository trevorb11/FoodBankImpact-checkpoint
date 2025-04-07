import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutGrid, 
  Upload, 
  Settings, 
  Share2, 
  Eye, 
  Menu, 
  X, 
  LogOut,
  ChevronRight,
  Loader2,
  Heart,
  User,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type AdminLayoutProps = {
  children: React.ReactNode;
  activeTab?: 'dashboard' | 'upload' | 'configure' | 'distribute' | 'preview';
};

const AdminLayout = ({ children, activeTab = 'dashboard' }: AdminLayoutProps) => {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, logout, loading, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/auth/login');
    }
  }, [loading, isAuthenticated, setLocation]);
  
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutGrid className="h-5 w-5" />, path: '/admin', id: 'dashboard' },
    { name: 'Upload Data', icon: <Upload className="h-5 w-5" />, path: '/admin/upload', id: 'upload' },
    { name: 'Configure', icon: <Settings className="h-5 w-5" />, path: '/admin/configure', id: 'configure' },
    { name: 'Distribute', icon: <Share2 className="h-5 w-5" />, path: '/admin/distribute', id: 'distribute' },
    { name: 'Preview', icon: <Eye className="h-5 w-5" />, path: '/admin/preview', id: 'preview' },
  ];
  
  const handleLogout = async () => {
    await logout();
    setLocation('/auth/login');
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Prevent rendering the layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-card text-card-foreground fixed inset-y-0 left-0 z-40 flex w-72 flex-col shadow-lg transition-transform md:translate-x-0 md:relative",
          sidebarOpen || !isMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="border-b px-6 py-8 flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div className="h-32 w-64 mb-1">
              <img 
                src="/images/impact-wrapped-logo.png" 
                alt="Impact Wrapped Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Visualize Your Food Bank's Impact</p>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-4 mb-4">
            <div className="flex items-center gap-3 px-3 py-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.username ? user.username.substring(0, 2).toUpperCase() : 'FB'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username || 'Food Bank Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
          
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground mx-2 mb-2">MANAGEMENT</h3>
          </div>
          <nav className="space-y-1 px-2 mb-6">
            {menuItems.map((item) => (
              <TooltipProvider key={item.id} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Link href={item.path}>
                        <div 
                          className={cn(
                            "flex items-center px-3 py-2.5 text-sm font-medium rounded-md group cursor-pointer",
                            activeTab === item.id 
                              ? "bg-primary/10 text-primary" 
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          onClick={() => {
                            if (isMobile) setSidebarOpen(false);
                          }}
                        >
                          <div className={cn(
                            "p-1.5 rounded-md mr-3",
                            activeTab === item.id ? "bg-primary/20" : "bg-muted-foreground/10"
                          )}>
                            {item.icon}
                          </div>
                          <span>{item.name}</span>
                          {(item.id === 'upload' || item.id === 'configure' || item.id === 'distribute' || item.id === 'preview') && (
                            <ArrowRight 
                              className={cn(
                                "ml-auto h-4 w-4",
                                activeTab === item.id ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          )}
                        </div>
                      </Link>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {item.id === 'dashboard' && "View your impact overview"}
                    {item.id === 'upload' && "Upload your donor data"}
                    {item.id === 'configure' && "Customize your food bank settings"}
                    {item.id === 'distribute' && "Share impact with your donors"}
                    {item.id === 'preview' && "Preview the donor experience"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="bg-card sticky top-0 z-30 h-16 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold hidden md:flex items-center">
              <span className="text-primary mr-2">{menuItems.find(item => item.id === activeTab)?.name || 'Dashboard'}</span>
              <span className="text-muted-foreground font-normal text-sm">/ Food Bank Impact</span>
            </h1>
          
            {/* Breadcrumbs on mobile */}
            {isMobile && (
              <h1 className="text-lg font-medium ml-12">
                {menuItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
              </h1>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.open('/api/documentation', '_blank')}>
              <span className="hidden sm:inline">Documentation</span>
              <span className="sm:hidden">Docs</span>
            </Button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-muted/30">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-card border-t py-4 px-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>by Impact Wrapped &copy; {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
