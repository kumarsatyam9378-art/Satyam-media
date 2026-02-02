import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSalon } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSalons(searchQuery?: string) {
  return useQuery({
    queryKey: [api.salons.search.path, searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `${api.salons.search.path}?query=${encodeURIComponent(searchQuery)}`
        : api.salons.search.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch salons");
      return api.salons.search.responses[200].parse(await res.json());
    },
  });
}

export function useSalon(id: number) {
  return useQuery({
    queryKey: [api.salons.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      const url = buildUrl(api.salons.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch salon");
      return api.salons.get.responses[200].parse(await res.json());
    },
  });
}

export function useMySalon() {
  return useQuery({
    queryKey: [api.salons.getMySalon.path],
    retry: false,
    queryFn: async () => {
      const res = await fetch(api.salons.getMySalon.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch my salon");
      return api.salons.getMySalon.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSalon() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertSalon) => {
      const res = await fetch(api.salons.create.path, {
        method: api.salons.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create salon");
      return api.salons.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.salons.getMySalon.path] });
      toast({ title: "Success", description: "Salon created successfully!" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create salon" });
    }
  });
}

export function useUpdateSalonStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number, action: 'open' | 'close' | 'break_start' | 'break_end' }) => {
      const url = buildUrl(api.salons.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.salons.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.salons.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.salons.getMySalon.path] });
      toast({ title: "Status Updated", description: "Salon status changed successfully." });
    },
  });
}

export function useSalonQueueStatus(id: number) {
  return useQuery({
    queryKey: [api.salons.getQueueStatus.path, id],
    enabled: !!id,
    refetchInterval: 10000, // Poll every 10s for updates
    queryFn: async () => {
      const url = buildUrl(api.salons.getQueueStatus.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch queue status");
      return api.salons.getQueueStatus.responses[200].parse(await res.json());
    },
  });
}
