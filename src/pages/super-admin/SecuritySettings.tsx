import React, { useState } from "react";
import { Shield, UserCog, Lock, KeyRound, History, FileWarning, Bell, Users, SaveAll, Filter } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Mock role data
const roles = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full system access with all permissions",
    userCount: 5,
    lastUpdated: "2025-04-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Admin",
    description: "Administrative access with limited permissions",
    userCount: 12,
    lastUpdated: "2025-04-18T14:15:00Z",
  },
  {
    id: "3",
    name: "Vendor Manager",
    description: "Manage vendor accounts and approvals",
    userCount: 8,
    lastUpdated: "2025-04-10T09:45:00Z",
  },
  {
    id: "4",
    name: "Finance Manager",
    description: "Manage financial transactions and reports",
    userCount: 6,
    lastUpdated: "2025-04-20T16:20:00Z",
  },
  {
    id: "5",
    name: "Support Agent",
    description: "Handle customer support tickets",
    userCount: 15,
    lastUpdated: "2025-04-22T11:10:00Z",
  }
];

// Mock audit log data
const auditLogs = [
  {
    id: "log-12485",
    action: "User Login",
    user: "admin@example.com",
    ip: "192.168.1.105",
    timestamp: "2025-04-30T09:15:23Z",
    status: "success"
  },
  {
    id: "log-12484",
    action: "User Created",
    user: "admin@example.com",
    targetUser: "vendor@example.com",
    ip: "192.168.1.105",
    timestamp: "2025-04-30T09:10:45Z",
    status: "success"
  },
  {
    id: "log-12483",
    action: "Permission Updated",
    user: "admin@example.com",
    details: "Modified Vendor Manager role",
    ip: "192.168.1.105",
    timestamp: "2025-04-30T08:55:12Z",
    status: "success"
  },
  {
    id: "log-12482",
    action: "Failed Login",
    user: "unknown@example.com",
    ip: "203.45.67.89",
    timestamp: "2025-04-30T08:42:18Z",
    status: "failed"
  },
  {
    id: "log-12481",
    action: "Settings Changed",
    user: "admin@example.com",
    details: "Updated security settings",
    ip: "192.168.1.105",
    timestamp: "2025-04-29T17:30:05Z",
    status: "success"
  }
];

function SecuritySettings() {
  const [passwordMinLength, setPasswordMinLength] = useState("12");
  const [passwordRequireUpper, setPasswordRequireUpper] = useState(true);
  const [passwordRequireLower, setPasswordRequireLower] = useState(true);
  const [passwordRequireNumbers, setPasswordRequireNumbers] = useState(true);
  const [passwordRequireSpecial, setPasswordRequireSpecial] = useState(true);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState("90");
  const [mfaRequired, setMfaRequired] = useState("optional");
  
  const [selectedRole, setSelectedRole] = useState("1");
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Function to handle password policy save
  const handleSavePasswordPolicy = () => {
    alert("Password policy settings saved!");
  };
  
  // Function to toggle specific permissions
  const handleTogglePermission = (permissionId: string) => {
    console.log(`Toggled permission: ${permissionId}`);
    // In a real app, this would update the permission state
  };
  
  return (
    <Dashboard userRole="super-admin" activeTab="security">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Security & Permissions</h1>
        </div>
        
        <Tabs defaultValue="access_control">
          <TabsList className="mb-4">
            <TabsTrigger value="access_control">Access Control</TabsTrigger>
            <TabsTrigger value="password_policy">Password Policy</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="audit_logs">Audit Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="access_control" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Roles</CardTitle>
                  <CardDescription>Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border-t">
                    {roles.map((role) => (
                      <div 
                        key={role.id} 
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedRole === role.id ? 'bg-gray-50' : ''}`}
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-gray-500">{role.userCount} users</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4">
                    <Button className="w-full">
                      Create New Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Role Permissions</CardTitle>
                  <CardDescription>Configure permissions for the selected role</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRole && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="roleName">Role Name</Label>
                        <Input 
                          id="roleName" 
                          defaultValue={roles.find(r => r.id === selectedRole)?.name} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="roleDescription">Description</Label>
                        <Input 
                          id="roleDescription" 
                          defaultValue={roles.find(r => r.id === selectedRole)?.description} 
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-base font-medium">Permission Groups</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">User Management</Label>
                              <Switch id="user-management-all" />
                            </div>
                            
                            <div className="ml-6 space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="view-users" checked={true} onCheckedChange={() => handleTogglePermission('view-users')} />
                                <Label htmlFor="view-users">View Users</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="create-users" checked={true} onCheckedChange={() => handleTogglePermission('create-users')} />
                                <Label htmlFor="create-users">Create Users</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="edit-users" checked={true} onCheckedChange={() => handleTogglePermission('edit-users')} />
                                <Label htmlFor="edit-users">Edit Users</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="delete-users" checked={selectedRole === "1"} onCheckedChange={() => handleTogglePermission('delete-users')} />
                                <Label htmlFor="delete-users">Delete Users</Label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Content Management</Label>
                              <Switch id="content-management-all" checked={selectedRole === "1"} />
                            </div>
                            
                            <div className="ml-6 space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="view-content" checked={true} />
                                <Label htmlFor="view-content">View Content</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="create-content" checked={selectedRole === "1" || selectedRole === "2"} />
                                <Label htmlFor="create-content">Create Content</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="publish-content" checked={selectedRole === "1"} />
                                <Label htmlFor="publish-content">Publish Content</Label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">System Configuration</Label>
                              <Switch id="system-config-all" checked={selectedRole === "1"} />
                            </div>
                            
                            <div className="ml-6 space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="view-settings" checked={selectedRole === "1" || selectedRole === "2"} />
                                <Label htmlFor="view-settings">View Settings</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="edit-settings" checked={selectedRole === "1"} />
                                <Label htmlFor="edit-settings">Edit Settings</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="manage-integrations" checked={selectedRole === "1"} />
                                <Label htmlFor="manage-integrations">Manage Integrations</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">
                          Cancel
                        </Button>
                        <Button className="bg-[#F07712] hover:bg-[#F07712]/90">
                          <SaveAll className="mr-2 h-4 w-4" />
                          Save Role
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="password_policy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Password Policy</CardTitle>
                <CardDescription>Configure security settings for user passwords</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Select value={passwordMinLength} onValueChange={setPasswordMinLength}>
                      <SelectTrigger id="passwordMinLength">
                        <SelectValue placeholder="Select minimum length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                        <SelectItem value="16">16 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiryDays">Password Expiry</Label>
                    <Select value={passwordExpiryDays} onValueChange={setPasswordExpiryDays}>
                      <SelectTrigger id="passwordExpiryDays">
                        <SelectValue placeholder="Select expiry policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Never expire</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Password Complexity Requirements</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="requireUpper" 
                        checked={passwordRequireUpper} 
                        onCheckedChange={(checked) => setPasswordRequireUpper(!!checked)} 
                      />
                      <Label htmlFor="requireUpper">Require uppercase letters</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="requireLower" 
                        checked={passwordRequireLower} 
                        onCheckedChange={(checked) => setPasswordRequireLower(!!checked)} 
                      />
                      <Label htmlFor="requireLower">Require lowercase letters</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="requireNumbers" 
                        checked={passwordRequireNumbers} 
                        onCheckedChange={(checked) => setPasswordRequireNumbers(!!checked)} 
                      />
                      <Label htmlFor="requireNumbers">Require numbers</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="requireSpecial" 
                        checked={passwordRequireSpecial} 
                        onCheckedChange={(checked) => setPasswordRequireSpecial(!!checked)} 
                      />
                      <Label htmlFor="requireSpecial">Require special characters</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Account Lockout Policy</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Maximum Failed Login Attempts</Label>
                      <Select defaultValue="5">
                        <SelectTrigger id="maxLoginAttempts">
                          <SelectValue placeholder="Select maximum attempts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 attempts</SelectItem>
                          <SelectItem value="5">5 attempts</SelectItem>
                          <SelectItem value="10">10 attempts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lockoutDuration">Account Lockout Duration</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="lockoutDuration">
                          <SelectValue placeholder="Select lockout duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="1440">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    Reset to Defaults
                  </Button>
                  <Button className="bg-[#F07712] hover:bg-[#F07712]/90" onClick={handleSavePasswordPolicy}>
                    Save Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="authentication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authentication Settings</CardTitle>
                <CardDescription>Configure multi-factor authentication and session policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Multi-Factor Authentication</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mfaRequired">MFA Requirement</Label>
                    <Select value={mfaRequired} onValueChange={setMfaRequired}>
                      <SelectTrigger id="mfaRequired">
                        <SelectValue placeholder="Select MFA requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="optional">Optional for all users</SelectItem>
                        <SelectItem value="admin-required">Required for admin users</SelectItem>
                        <SelectItem value="all-required">Required for all users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mfaMethods">Available MFA Methods</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="method-app" checked={true} />
                        <Label htmlFor="method-app">Authenticator App</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="method-sms" checked={true} />
                        <Label htmlFor="method-sms">SMS</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="method-email" checked={true} />
                        <Label htmlFor="method-email">Email</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Session Policy</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout</Label>
                      <Select defaultValue="60">
                        <SelectTrigger id="sessionTimeout">
                          <SelectValue placeholder="Select session timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                          <SelectItem value="480">8 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxSessions">Maximum Concurrent Sessions</Label>
                      <Select defaultValue="3">
                        <SelectTrigger id="maxSessions">
                          <SelectValue placeholder="Select maximum sessions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 session</SelectItem>
                          <SelectItem value="2">2 sessions</SelectItem>
                          <SelectItem value="3">3 sessions</SelectItem>
                          <SelectItem value="5">5 sessions</SelectItem>
                          <SelectItem value="10">10 sessions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="enforceSignOut" checked={true} />
                      <Label htmlFor="enforceSignOut">
                        Enforce sign-out on password change
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="rememberDevice" checked={true} />
                      <Label htmlFor="rememberDevice">
                        Allow "Remember this device" option
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    Reset to Defaults
                  </Button>
                  <Button className="bg-[#F07712] hover:bg-[#F07712]/90">
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audit_logs" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Security Audit Logs</CardTitle>
                  <CardDescription>Review system security events and user actions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    Export Logs
                  </Button>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(log.timestamp)}</TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                        <TableCell>
                          <Badge className={log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.targetUser ? `Target: ${log.targetUser}` : ''}
                          {log.details || ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
};

export default SecuritySettings;
