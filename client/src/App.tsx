import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";

// Customer Pages
import CustomerHome from "@/pages/customer/Home";
import SalonDetail from "@/pages/customer/SalonDetail";
import MyTokens from "@/pages/customer/MyTokens";
import CustomerProfile from "@/pages/customer/Profile";

// Barber Pages
import BarberDashboard from "@/pages/barber/Dashboard";
import QueueManagement from "@/pages/barber/QueueManagement";
import BarberSetup from "@/pages/barber/Setup";

function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole?: string }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/");
    } else if (allowedRole && user.role !== allowedRole) {
      // Redirect to correct dashboard if trying to access wrong role pages
      setLocation(user.role === "barber" ? "/barber" : "/customer");
    }
  }, [user, allowedRole, setLocation]);

  if (!user) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Login} />
      
      {/* Customer Routes */}
      <Route path="/customer">
        <ProtectedRoute component={CustomerHome} allowedRole="customer" />
      </Route>
      <Route path="/customer/salon/:id">
        <ProtectedRoute component={SalonDetail} allowedRole="customer" />
      </Route>
      <Route path="/customer/my-tokens">
        <ProtectedRoute component={MyTokens} allowedRole="customer" />
      </Route>
      <Route path="/customer/profile">
        <ProtectedRoute component={CustomerProfile} allowedRole="customer" />
      </Route>

      {/* Barber Routes */}
      <Route path="/barber">
        <ProtectedRoute component={BarberDashboard} allowedRole="barber" />
      </Route>
      <Route path="/barber/queue">
        <ProtectedRoute component={QueueManagement} allowedRole="barber" />
      </Route>
      <Route path="/barber/setup">
        <ProtectedRoute component={BarberSetup} allowedRole="barber" />
      </Route>
      {/* <Route path="/barber/profile" component={BarberProfile} /> */}

      {/* Fallback */}
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
