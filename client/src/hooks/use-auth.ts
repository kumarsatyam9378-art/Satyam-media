import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type LoginRequest, type InsertUser } from "@shared/routes";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Simple auth state management using localStorage for this demo
// In a real app, this would be handled by HTTP-only cookies and a /me endpoint
const USER_KEY = "salon_user";

export function useAuth() {
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const user = (() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Login failed");
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      queryClient.setQueryData(["user"], data);
      toast({ title: "Welcome back!", description: `Logged in as ${data.name}` });
      
      // Redirect based on role
      if (data.role === "barber") {
        setLocation("/barber");
      } else {
        setLocation("/customer");
      }
    },
    onError: () => {
      toast({ variant: "destructive", title: "Login failed", description: "Invalid credentials" });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Registration failed");
      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      queryClient.setQueryData(["user"], data);
      toast({ title: "Account created!", description: "Welcome to QueuePro" });
      
      if (data.role === "barber") {
        setLocation("/barber/setup"); // First time setup
      } else {
        setLocation("/customer");
      }
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Could not create account" });
    }
  });

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    queryClient.setQueryData(["user"], null);
    setLocation("/");
    toast({ title: "Logged out", description: "See you soon!" });
  };

  return {
    user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout
  };
}
