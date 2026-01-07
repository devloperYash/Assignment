import { Sidebar } from "@/components/Sidebar";
import { useAdminUsers } from "@/hooks/use-admin";
import { CreateUserModal } from "@/components/CreateUserModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  
  // Debounce search in real app, simple state for now
  const { data: users, isLoading } = useAdminUsers({
    search: search || undefined,
    role: role !== "all" ? role : undefined
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground mt-1">Manage system users and roles.</p>
          </div>
          <CreateUserModal />
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="store_owner">Store Owner</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No users found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'admin' ? 'destructive' : 
                        user.role === 'store_owner' ? 'default' : 'secondary'
                      }>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="truncate max-w-[200px]" title={user.address || ""}>
                      {user.address || "-"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(user.createdAt!).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
