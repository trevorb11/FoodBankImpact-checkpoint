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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

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
          "bg-card text-card-foreground fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r transition-transform md:translate-x-0 md:relative",
          sidebarOpen || !isMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-bold text-lg">Impact Wrapped</span>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => (
              <div key={item.id}>
                <Link 
                  href={item.path}
                >
                  <div 
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md group cursor-pointer",
                      activeTab === item.id 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => {
                      if (isMobile) setSidebarOpen(false);
                    }}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                    {(item.id === 'upload' || item.id === 'configure' || item.id === 'distribute' || item.id === 'preview') && (
                      <ChevronRight 
                        className={cn(
                          "ml-auto h-4 w-4",
                          activeTab === item.id ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="border-t p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-30 h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold hidden md:block">Food Bank Impact Wrapped</h1>
          
          {/* Breadcrumbs on mobile */}
          {isMobile && (
            <h1 className="text-lg font-medium ml-12">
              {menuItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
            </h1>
          )}
          
          <div>
            <Button variant="outline" size="sm" onClick={() => window.open('/api/documentation', '_blank')}>
              Documentation
            </Button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-card border-t py-4 px-6 text-center text-sm text-muted-foreground">
          &copy; 2023 Impact Wrapped for Food Banks. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
