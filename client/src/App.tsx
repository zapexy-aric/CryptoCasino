import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Mines from "@/pages/mines";
import NotFound from "@/pages/not-found";
import { LoginPage } from "./pages/login";
import { SignupPage } from "./pages/signup";
import { AdminDashboard } from "./pages/admin";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />

      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/mines" component={Mines} />
          {user?.isAdmin && <Route path="/admin" component={AdminDashboard} />}
        </>
      ) : (
        <Redirect to="/landing" />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
