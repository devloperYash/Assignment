import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertUser, type InsertStore } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.admin.stats.responses[200].parse(await res.json());
    },
  });
}

export function useAdminUsers(params?: { search?: string; role?: string }) {
  // Construct query key that includes params for auto-refetch
  const queryKey = [api.admin.getUsers.path, params];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build URL with query params
      const url = new URL(api.admin.getUsers.path, window.location.origin);
      if (params?.search) url.searchParams.set("search", params.search);
      if (params?.role) url.searchParams.set("role", params.role);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.getUsers.responses[200].parse(await res.json());
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.admin.createUser.path, {
        method: api.admin.createUser.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.admin.createUser.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to create user");
      }
      return api.admin.createUser.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.getUsers.path] });
      toast({ title: "User created", description: "The user has been successfully created." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertStore) => {
      const res = await fetch(api.stores.create.path, {
        method: api.stores.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.stores.create.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to create store");
      }
      return api.stores.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stores.list.path] });
      toast({ title: "Store created", description: "The store has been successfully added." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });
}
