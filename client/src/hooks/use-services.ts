import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertService } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useServices(salonId: number) {
  return useQuery({
    queryKey: [api.services.list.path, salonId],
    enabled: !!salonId,
    queryFn: async () => {
      const url = buildUrl(api.services.list.path, { salonId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch services");
      return api.services.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ salonId, ...data }: InsertService & { salonId: number }) => {
      const url = buildUrl(api.services.create.path, { salonId });
      const res = await fetch(url, {
        method: api.services.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create service");
      return api.services.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [api.services.list.path, vars.salonId] });
      toast({ title: "Service Added", description: "New service created successfully." });
    },
  });
}
