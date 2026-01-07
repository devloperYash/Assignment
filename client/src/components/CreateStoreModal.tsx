import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStoreSchema } from "@shared/schema";
import { useCreateStore } from "@/hooks/use-admin";
import { type InsertStore } from "@shared/routes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Store as StoreIcon } from "lucide-react";
import { useState } from "react";

export function CreateStoreModal() {
  const [open, setOpen] = useState(false);
  const createStore = useCreateStore();

  const form = useForm<InsertStore>({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const onSubmit = (data: InsertStore) => {
    createStore.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Add Store
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StoreIcon className="w-5 h-5 text-primary" />
            Create New Store
          </DialogTitle>
          <DialogDescription>
            Add a new store to the platform for users to rate.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Super Burgers..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="456 Market St, City..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createStore.isPending} className="w-full sm:w-auto">
                {createStore.isPending ? "Creating..." : "Create Store"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
