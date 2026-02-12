import React, { useState } from "react";
import { 
  User, UserPlus, UserX, UserCheck, Filter, Search, MoreHorizontal, 
  CheckCircle, XCircle, Mail, Eye, Edit, Trash2, Download 
} from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "host" | "admin";
  status: "active" | "inactive" | "pending" | "suspended";
  joinedDate: string;
  lastActive: string;
}

function UserManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  
  // Mock user data
  const users: UserData[] = [
    {
      id: "1",
      name: "Jane Cooper",
      email: "jane.cooper@example.com",
      role: "customer",
      status: "active",
      joinedDate: "2023-01-15",
      lastActive: "2023-05-29"
    },
    {
      id: "2",
      name: "Elite Catering Services",
      email: "info@elitecatering.com",
      role: "vendor",
      status: "active",
      joinedDate: "2022-11-20",
      lastActive: "2023-05-28"
    },
    {
      id: "3",
      name: "Michael Johnson",
      email: "mjohnson@example.com",
      role: "host",
      status: "active",
      joinedDate: "2022-08-05",
      lastActive: "2023-05-27"
    },
    {
      id: "4",
      name: "Amanda Rodriguez",
      email: "arod@example.com",
      role: "admin",
      status: "active",
      joinedDate: "2021-12-10",
      lastActive: "2023-05-29"
    },
    {
      id: "5",
      name: "Luxury Venues LLC",
      email: "bookings@luxuryvenues.com",
      role: "vendor",
      status: "suspended",
      joinedDate: "2022-04-18",
      lastActive: "2023-04-15"
    },
    {
      id: "6",
      name: "Robert Chen",
      email: "rchen@example.com",
      role: "customer",
      status: "inactive",
      joinedDate: "2023-02-22",
      lastActive: "2023-03-01"
    },
    {
      id: "7",
      name: "Professional Event Staffing",
      email: "jobs@eventstaff.com",
      role: "vendor",
      status: "pending",
      joinedDate: "2023-05-20",
      lastActive: "2023-05-20"
    },
    {
      id: "8",
      name: "Sarah Williams",
      email: "swilliams@example.com",
      role: "host",
      status: "active",
      joinedDate: "2022-09-15",
      lastActive: "2023-05-26"
    },
  ];

  // Filter users based on active tab and search query
  const filteredUsers = users.filter(user => {
    // Filter by tab
    if (activeTab !== "all" && user.role !== activeTab && 
        !(activeTab === "suspended" && user.status === "suspended")) {
      return false;
    }

    // Filter by search
    if (searchQuery && 
        !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleUserAction = (action: string, user: UserData) => {
    console.log(`Action: ${action}, User: ${user.name}`);
    // Implement actual user actions here
  };

  const viewUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
  };

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Suspended</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "customer":
        return <Badge variant="outline" className="border-blue-200 text-blue-800">Customer</Badge>;
      case "vendor":
        return <Badge variant="outline" className="border-purple-200 text-purple-800">Vendor</Badge>;
      case "host":
        return <Badge variant="outline" className="border-green-200 text-green-800">Host</Badge>;
      case "admin":
        return <Badge variant="outline" className="border-red-200 text-red-800">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <Dashboard userRole="super-admin" activeTab="users">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full max-w-xl">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="customer">Customers</TabsTrigger>
              <TabsTrigger value="vendor">Vendors</TabsTrigger>
              <TabsTrigger value="host">Hosts</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-9 w-full sm:w-[260px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div>{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                    <TableCell>{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => viewUserDetails(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUserAction("view", user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction("edit", user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction("email", user)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "suspended" ? (
                              <DropdownMenuItem onClick={() => handleUserAction("activate", user)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserAction("suspend", user)} className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleUserAction("delete", user)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* User Details Sheet */}
      <Sheet open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg">
          {selectedUser && (
            <>
              <SheetHeader className="pb-6">
                <SheetTitle>User Details</SheetTitle>
                <SheetDescription>
                  Detailed information about the selected user.
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                      {getUserStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded p-4">
                    <div className="text-sm text-gray-500">Joined Date</div>
                    <div>{new Date(selectedUser.joinedDate).toLocaleDateString()}</div>
                  </div>
                  <div className="border rounded p-4">
                    <div className="text-sm text-gray-500">Last Active</div>
                    <div>{new Date(selectedUser.lastActive).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Quick Actions</h3>
                  <div className="flex gap-2">
                    <Button>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </Button>
                    <Button variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact User
                    </Button>
                    {selectedUser.status === "suspended" ? (
                      <Button variant="outline" className="text-green-600" onClick={() => handleUserAction("activate", selectedUser)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Activate User
                      </Button>
                    ) : (
                      <Button variant="outline" className="text-red-600" onClick={() => handleUserAction("suspend", selectedUser)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Suspend User
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">User Activity</h3>
                  <div className="text-center p-8 bg-gray-50 rounded-md">
                    <p className="text-gray-500">Detailed user activity will be displayed here</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Dashboard>
  );
};

export default UserManagement;
