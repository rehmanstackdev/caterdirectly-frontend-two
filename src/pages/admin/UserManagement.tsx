import { useEffect, useMemo, useState } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBackendUsers } from "@/hooks/admin/use-backend-users";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { Pencil, UserPlus, CheckCircle2, XCircle, MessageCircle } from "lucide-react";
import type { PlatformUser } from "@/types/user";
import type { BackendUser } from "@/services/users.service";
import type { UserRole } from "@/types/supabase-types";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import chatService from "@/services/api/chat.service";
import { useToast } from "@/hooks/use-toast";
import { getRoleDisplayName } from "@/utils/role-utils";

function UserManagement() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<PlatformUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    document.title = "User Management | Admin";
  }, []);

  const { data, isLoading, error, refetch } = useBackendUsers(currentPage, itemsPerPage);
  const { isSuperAdmin } = useAdminPermissions();
  const navigate = useNavigate();
  const { toast } = useToast();

  const users = data?.users || [];
  const pagination = data?.pagination;

  // Update pagination state when data changes
  useEffect(() => {
    if (pagination) {
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || Math.ceil((pagination.totalItems || 0) / itemsPerPage));
    }
  }, [pagination, itemsPerPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debounced]);

  const rows = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    // Filter users based on search
    const filtered = users.filter(user => {
      if (!debounced) return true;
      const searchLower = debounced.toLowerCase();
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      return fullName.includes(searchLower) || user.email.toLowerCase().includes(searchLower);
    });

    return filtered;
  }, [users, debounced]);

  const handleUserAdded = () => {
    refetch();
  };

  const openEditDialog = (user: BackendUser) => {
    // Convert BackendUser to PlatformUser format
    const platformUser: PlatformUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || null,
      jobTitle: user.jobTitle || null,
      userType: user.userType || null,
      profileImage: user.imageUrl || null,
      roles: user.roles.map(r => r.role as UserRole),
      permissions: user.permissions || [],
      joinedAt: user.createdAt || null,
      lastActive: user.updatedAt || null,
    };
    setSelectedUserForEdit(platformUser);
    setEditUserDialogOpen(true);
  };

  const handleStartChat = async (userId: string) => {
    try {
      const response = await chatService.startChat(userId);
      if (response && response.data) {
        // Navigate to messaging page and select the room
        navigate('/admin/messaging');
        toast({
          title: "Chat opened",
          description: "Redirected to messaging page",
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  return (
    <Dashboard userRole="admin" activeTab="users">
      <main className="space-y-6">
        <header className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">View all platform users and their roles.</p>
            </div>
            <Button onClick={() => setAddUserDialogOpen(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
          <div className="max-w-md">
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search users"
            />
          </div>
        </header>

        {error && (
          <p className="text-destructive">Failed to load users: {String(error.message ?? error)}</p>
        )}

        <section aria-busy={isLoading} className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>                
                <TableHead>User Type</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                  
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">No users found.</TableCell>
                </TableRow>
              )}
              {rows.map((u) => {
                const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
                // Derive userType from vendor property or roles
                const userType = u.userType ? getRoleDisplayName(u.userType) : "—";
                return (
                  <TableRow key={u.id}>
                    <TableCell>{fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                 
                    <TableCell>{userType}</TableCell>
                    <TableCell>
                      {u.isVerified ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2">
                      {u.roles?.map((role: any) => (
                        <Badge key={role.id} variant="secondary">{getRoleDisplayName(role.role)}</Badge>
                      )) || <Badge variant="outline">No role</Badge>}
                    </TableCell>
                    <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>{u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartChat(u.id)}
                          className="flex items-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(u)}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> users
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <>
                    {/* Skeleton for pagination buttons */}
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">Go to first page</span>
                      &laquo;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages: (number | string)[] = [];

                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          pages.push(1);

                          if (currentPage > 3) {
                            pages.push('...');
                          }

                          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                            if (!pages.includes(i)) {
                              pages.push(i);
                            }
                          }

                          if (currentPage < totalPages - 2) {
                            pages.push('...');
                          }

                          if (!pages.includes(totalPages)) {
                            pages.push(totalPages);
                          }
                        }

                        return pages.map((page, index) =>
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page as number)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          )
                        );
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= totalPages}
                      className="h-8 px-3"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage >= totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">Go to last page</span>
                      &raquo;
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      
      <AddUserDialog
        isOpen={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
        onUserAdded={handleUserAdded}
      />
      
      {selectedUserForEdit && (
        <EditUserDialog
          isOpen={editUserDialogOpen}
          onClose={() => {
            setEditUserDialogOpen(false);
            setSelectedUserForEdit(null);
          }}
          user={selectedUserForEdit}
          onUserUpdated={refetch}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </Dashboard>
  );
}

export default UserManagement;
