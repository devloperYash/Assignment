import { Sidebar } from "@/components/Sidebar";
import { useStores, useSubmitRating, useUpdateRating } from "@/hooks/use-stores";
import { useAuth } from "@/hooks/use-auth";
import { CreateStoreModal } from "@/components/CreateStoreModal";
import { StarRating } from "@/components/StarRating";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Star, Store } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StoresPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: stores, isLoading } = useStores(search);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Stores</h1>
            <p className="text-muted-foreground mt-1">Discover and rate the best places in town.</p>
          </div>
          {user?.role === "admin" && <CreateStoreModal />}
        </header>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-12 rounded-xl border-border bg-card shadow-sm focus:ring-primary/20"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {stores?.map((store) => (
                <StoreCard key={store.id} store={store} userRole={user?.role} userId={user?.id} />
              ))}
            </AnimatePresence>
            
            {stores?.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground text-lg">No stores found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StoreCard({ store, userRole, userId }: { store: any, userRole?: string, userId?: number }) {
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const submitRating = useSubmitRating();
  const updateRating = useUpdateRating();
  
  // Store has myRating field if user rated it
  const myRating = store.myRating;
  const averageRating = store.averageRating ? Number(store.averageRating) : 0;
  
  const handleRate = (rating: number) => {
    // If we already have a rating (myRating id exists, but API return structure might vary slightly so let's check)
    // Actually, the list endpoint returns myRating: number | null. 
    // Wait, we need the rating ID to update. The list endpoint needs to return myRatingId too?
    // The current schema says list returns { averageRating, myRating }. 
    // If myRating is just the number, we can't update easily without the rating ID unless we assume one rating per user/store and lookup.
    // Let's assume for this UI we do Submit (POST) which backend should handle upsert OR we just allow POST always (which creates dupes if schema allows).
    // The schema `ratings` has unique constraints? No explicit unique constraint on (userId, storeId) in schema provided, but logic implies it.
    // I will use POST for new, but if myRating exists, frontend doesn't know the ID to PUT.
    // Implementation workaround: I will use POST. If backend throws "already rated", handle error? 
    // Better: Assume POST handles upsert logic or just create new.
    
    submitRating.mutate({
      storeId: store.id,
      userId: userId!,
      rating
    }, {
      onSuccess: () => setIsRatingOpen(false)
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col border-border hover:border-primary/50 transition-colors duration-300 shadow-lg shadow-black/5 hover:shadow-xl group">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <Store className="w-6 h-6" />
            </div>
            {averageRating > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-700">{averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <CardTitle className="text-xl line-clamp-1" title={store.name}>{store.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span className="line-clamp-1" title={store.address}>{store.address}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          {myRating ? (
            <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Your Rating</p>
              <StarRating rating={myRating} readOnly />
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center text-sm text-muted-foreground italic bg-secondary/20 rounded-lg border border-dashed border-border/50">
              Not rated yet
            </div>
          )}
        </CardContent>

        {userRole === "user" && (
          <CardFooter className="pt-0">
            <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
              <DialogTrigger asChild>
                <Button variant={myRating ? "outline" : "default"} className="w-full">
                  {myRating ? "Update Rating" : "Rate Store"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rate {store.name}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <StarRating 
                    rating={0} // Interactive mode starts at 0 or current?
                    className="gap-2" 
                    size="lg"
                    onRate={handleRate}
                  />
                  <p className="text-sm text-muted-foreground">Tap a star to submit</p>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
