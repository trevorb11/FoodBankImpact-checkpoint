import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/index";
import AdminDashboard from "@/pages/admin/index";
import AdminUpload from "@/pages/admin/upload-new"; // Using the new improved upload page
import AdminConfigure from "@/pages/admin/configure";
import AdminDistribute from "@/pages/admin/distribute";
import AdminPreview from "@/pages/admin/preview";
import DonorImpact from "@/pages/impact/[id]";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";

function Router() {
  return (
    <Switch>
      {/* Landing page */}
      <Route path="/" component={LandingPage} />
      
      {/* Auth routes */}
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      
      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/upload" component={AdminUpload} />
      <Route path="/admin/configure" component={AdminConfigure} />
      <Route path="/admin/distribute" component={AdminDistribute} />
      <Route path="/admin/preview" component={AdminPreview} />
      
      {/* Donor impact experience */}
      <Route path="/impact/:id" component={DonorImpact} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
