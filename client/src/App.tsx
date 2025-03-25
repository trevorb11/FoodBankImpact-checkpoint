import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/index";
import AdminUpload from "@/pages/admin/upload";
import AdminConfigure from "@/pages/admin/configure";
import AdminDistribute from "@/pages/admin/distribute";
import AdminPreview from "@/pages/admin/preview";
import DonorImpact from "@/pages/impact/[id]";

function Router() {
  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/" component={AdminDashboard} />
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
