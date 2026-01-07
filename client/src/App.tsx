import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import AdminUsersPage from "@/pages/admin-users";
import StoresPage from "@/pages/stores";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ component: Component, roles }: { component: React.ComponentType, roles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (!user) return <Redirect to="/login" />;
  
  if (roles && !roles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();
  
  return (
    <Switch>
      <Route path="/login" component={AuthPage} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsersPage} roles={["admin"]} />
      </Route>
      
      <Route path="/stores">
        <ProtectedRoute component={StoresPage} />
      </Route>
      
      {/* Redirect root to dashboard or login */}
      <Route path="/">
        {isLoading ? null : (user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />)}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
