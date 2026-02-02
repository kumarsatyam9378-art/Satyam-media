import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type JoinQueueRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useJoinQueue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: JoinQueueRequest) => {
      const res = await fetch(api.queue.join.path, {
        method: api.queue.join.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to join queue");
      return api.queue.join.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.queue.myQueue.path] });
      toast({ title: "Success!", description: "You have been added to the queue." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to join queue" });
    }
  });
}

export function useMyQueue() {
  return useQuery({
    queryKey: [api.queue.myQueue.path],
    refetchInterval: 5000, // Frequent updates for customers waiting
    queryFn: async () => {
      const res = await fetch(api.queue.myQueue.path);
      if (!res.ok) throw new Error("Failed to fetch my queue");
      return api.queue.myQueue.responses[200].parse(await res.json());
    },
  });
}

export function useSalonQueue(salonId: number) {
  return useQuery({
    queryKey: [api.queue.list.path, salonId],
    enabled: !!salonId,
    refetchInterval: 5000,
    queryFn: async () => {
      const url = buildUrl(api.queue.list.path, { salonId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch queue");
      return api.queue.list.responses[200].parse(await res.json());
    },
  });
}

export function useNextCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (salonId: number) => {
      const url = buildUrl(api.queue.next.path, { salonId });
      const res = await fetch(url, {
        method: api.queue.next.method,
      });
      if (!res.ok) throw new Error("Failed to call next customer");
      return api.queue.next.responses[200].parse(await res.json());
    },
    onSuccess: (_, salonId) => {
      queryClient.invalidateQueries({ queryKey: [api.queue.list.path, salonId] });
      queryClient.invalidateQueries({ queryKey: [api.salons.getQueueStatus.path, salonId] });
      toast({ title: "Next Customer", description: "Called next customer in line." });
    },
  });
}

export function useUpdateQueueItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'completed' | 'cancelled' }) => {
      const url = buildUrl(api.queue.update.path, { id });
      const res = await fetch(url, {
        method: api.queue.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update queue item");
      return api.queue.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.queue.myQueue.path] });
      queryClient.invalidateQueries({ queryKey: [api.queue.list.path] }); // Covers owner view too broadly, but safe
      toast({ title: "Updated", description: "Queue status updated." });
    },
  });
}
