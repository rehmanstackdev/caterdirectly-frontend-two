import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import usersService from "@/services/api/admin/users.Service";
import { ADMIN_PAGES, PageId } from "@/constants/admin-permissions";
import type { PlatformUser } from "@/types/user";
import type { UserRole } from "@/types/supabase-types";
import { Save, User, Shield, Lock, UserCog, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: PlatformUser;
  onUserUpdated: () => void;
  isSuperAdmin: boolean;
}

const userInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name required").max(50),
  lastName: z.string().trim().min(1, "Last name required").max(50),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  jobTitle: z.string().trim().max(100).optional(),
  userType: z.enum(['individual', 'business']),
});

export function EditUserDialog({ isOpen, onClose, user, onUserUpdated, isSuperAdmin }: EditUserDialogProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'roles' | 'permissions' | 'security'>('info');
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    phone: user.phone || '',
    jobTitle: user.jobTitle || '',
    userType: (user.userType || 'individual') as 'individual' | 'business',
  });
  const [selectedRoles, setSelectedRoles] = useState<Set<UserRole>>(new Set(user.roles));
  const [permissions, setPermissions] = useState<Set<PageId>>(new Set());
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Available roles that can be assigned
  // Note: Using the role names as they appear in the backend
  const availableRoles: Array<{ value: string; label: string; description: string }> = [
    { value: 'host', label: 'Event Host', description: 'Can create and manage events' },
    { value: 'vendor', label: 'Vendor', description: 'Can manage services and orders' },
    { value: 'admin', label: 'Admin', description: 'Access to admin dashboard' },
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
  ];

  // Update form data when user changes or dialog opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        userType: (user.userType === 'business' ? 'business' : 'individual') as 'individual' | 'business',
      });
      setSelectedRoles(new Set(user.roles));
      
      // Initialize permissions from user's existing permissions
      const initialPermissions = new Set<PageId>();
      
      // Map API permission names to PageId values
      // Note: 'settings' in API maps to 'config' in PageId
      const permissionToPageIdMap: { [key: string]: PageId } = {
        'dashboard': 'dashboard',
        'reports': 'reports',
        'proposals': 'proposals',
        'leads': 'leads',
        'waitlist': 'waitlist',
        'services': 'services',
        'vendors': 'vendors',
        'orders': 'orders',
        'users': 'users',
        'support': 'support',
        'finances': 'finances',
        'invoices': 'invoices',
        'settings': 'config',
        'security': 'security',
      };
      
      // Add user's existing permissions
      if (user.permissions && Array.isArray(user.permissions)) {
        user.permissions.forEach(perm => {
          const pageId = permissionToPageIdMap[perm.permission];
          if (pageId) {
            initialPermissions.add(pageId);
          }
        });
      }
      
      // Dashboard and reports are always enabled (add them if not already present)
      initialPermissions.add('dashboard' as PageId);
      initialPermissions.add('reports' as PageId);
      
      setPermissions(initialPermissions);
      setNewPassword('');
      setShowPassword(false);
    }
  }, [isOpen, user]);

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev => {
      const newRoles = new Set(prev);
      if (newRoles.has(role)) {
        // Don't allow removing last role
        if (newRoles.size === 1) {
          toast.error("User must have at least one role");
          return prev;
        }
        newRoles.delete(role);
      } else {
        newRoles.add(role);
      }
      return newRoles;
    });
  };

  const togglePermission = (pageId: PageId) => {
    setPermissions(prev => {
      const newPerms = new Set(prev);
      if (newPerms.has(pageId)) {
        newPerms.delete(pageId);
      } else {
        newPerms.add(pageId);
      }
      return newPerms;
    });
  };

  const groupedPages = ADMIN_PAGES.reduce((acc, page) => {
    if (!acc[page.category]) acc[page.category] = [];
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, Array<typeof ADMIN_PAGES[number]>>);

  const validateAndSave = async () => {
    try {
      // Validate basic info using Zod
      userInfoSchema.parse(formData);
      await saveChanges();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Show all validation errors
        const errorMessages = error.errors.map(e => {
          const field = e.path.join('.');
          return `${field}: ${e.message}`;
        }).join('\n');
        
        toast.error(errorMessages);
      } else {
        console.error('Validation error:', error);
      }
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    
    try {
      // Map roles with enabled flags
      const rolesPayload = availableRoles.map(role => ({
        role: role.value,
        enabled: selectedRoles.has(role.value as UserRole),
      }));

      // Map permissions with enabled flags
      // Dashboard and reports are always enabled
      const permissionsPayload = ADMIN_PAGES.map(page => {
        const isDashboardOrReports = page.id === 'dashboard' || page.id === 'reports';
        return {
          permission: page.id === 'config' ? 'settings' : page.id,
          enabled: isDashboardOrReports ? true : permissions.has(page.id as PageId),
        };
      });

      // Prepare payload
      const payload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        userType: formData.userType,
        roles: rolesPayload,
        permissions: permissionsPayload,
      };

      if (formData.phone?.trim()) {
        payload.phone = formData.phone.trim();
      }
      if (formData.jobTitle?.trim()) {
        payload.jobTitle = formData.jobTitle.trim();
      }
      if (newPassword && newPassword.trim().length > 0) {
        payload.newPassword = newPassword.trim();
      }

      const response = await usersService.editUser(user.id, payload);
      
      toast.success(response.message || "User updated successfully");
      onUserUpdated();
      onClose();
      setNewPassword('');
      setShowPassword(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save changes";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };


  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {fullName} ({user.email})
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-4' : 'grid-cols-2'}`}>
            <TabsTrigger value="info">
              <User className="h-4 w-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="roles">
              <UserCog className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="permissions" disabled={!selectedRoles.has('admin') || selectedRoles.has('super_admin')}>
                <Shield className="h-4 w-4 mr-2" />
                Permissions
              </TabsTrigger>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">User Type *</Label>
              <Select
                value={formData.userType}
                onValueChange={(value: 'individual' | 'business') => setFormData(prev => ({ ...prev, userType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select which roles this user should have. At least one role is required.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {availableRoles.map(role => (
                <div key={role.value} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                  <Switch
                    checked={selectedRoles.has(role.value as UserRole)}
                    onCheckedChange={() => toggleRole(role.value as UserRole)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="permissions" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select which admin pages this user can access.
              </p>
              <div className="space-y-6">
                {Object.entries(groupedPages).map(([category, pages]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {pages.map(page => {
                        const isDashboardOrReports = page.id === 'dashboard' || page.id === 'reports';
                        return (
                          <div
                            key={page.id}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                              isDashboardOrReports ? 'opacity-60' : 'hover:bg-accent'
                            }`}
                          >
                            <span className="text-sm font-medium">{page.name}</span>
                            <Switch
                              checked={isDashboardOrReports ? true : permissions.has(page.id as PageId)}
                              onCheckedChange={() => !isDashboardOrReports && togglePermission(page.id as PageId)}
                              disabled={isDashboardOrReports}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {isSuperAdmin && (
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Reset Password</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set a new password for this user. They will be able to log in with this password immediately.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password (optional)</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generatePassword}
                    className="text-xs"
                  >
                    Generate Password
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedRoles.size} role(s) • {permissions.size} page(s) enabled
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <LoadingButton 
              onClick={validateAndSave} 
              loading={saving}
              loadingText="Saving..."
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
