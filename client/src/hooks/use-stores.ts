import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertRating } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useStores(search?: string) {
  return useQuery({
    queryKey: [api.stores.list.path, search],
    queryFn: async () => {
      const url = new URL(api.stores.list.path, window.location.origin);
      if (search) url.searchParams.set("search", search);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stores");
      return api.stores.list.responses[200].parse(await res.json());
    },
  });
}

export function useStoreRatings(storeId: number) {
  return useQuery({
    queryKey: [api.ratings.listForStore.path, storeId],
    queryFn: async () => {
      const url = buildUrl(api.ratings.listForStore.path, { id: storeId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ratings");
      return api.ratings.listForStore.responses[200].parse(await res.json());
    },
    enabled: !!storeId,
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertRating) => {
      const res = await fetch(api.ratings.submit.path, {
        method: api.ratings.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.ratings.submit.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to submit rating");
      }
      return api.ratings.submit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stores.list.path] });
      toast({ title: "Rated!", description: "Your rating has been submitted." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });
}

export function useUpdateRating() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, rating }: { id: number; rating: number }) => {
      const url = buildUrl(api.ratings.update.path, { id });
      const res = await fetch(url, {
        method: api.ratings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to update rating");
      }
      return api.ratings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stores.list.path] });
      toast({ title: "Updated", description: "Your rating has been updated." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });
}
