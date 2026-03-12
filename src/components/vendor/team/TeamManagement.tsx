
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Trash2, UserCheck, UserX, Eye, EyeOff, Shield, ShieldCheck, ShieldAlert, Loader2, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import StatusConfirmDialog from './StatusConfirmDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { VendorTeamService, type TeamMember } from '@/services/api/vendor/vendorTeam.service';

const inviteFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  role: z.enum(['staff', 'manager', 'admin'], { required_error: 'Please select a role' }),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

const editFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().optional().refine((val) => !val || val.length >= 6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['staff', 'manager', 'admin'], { required_error: 'Please select a role' }),
});

type EditFormData = z.infer<typeof editFormSchema>;

const TeamManagement: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState<{ memberId: string; memberName: string; currentStatus: string } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ memberId: string; memberName: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'staff',
    },
  });
  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'staff',
    },
  });

  const fetchTeamMembers = async () => {
    try {
      const response = await VendorTeamService.getTeamMembers();
      setTeamMembers(response?.data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleInviteMember = async (values: InviteFormData) => {
    setInviteLoading(true);
    try {
      const response = await VendorTeamService.inviteTeamMember({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      toast.success("Invitation Sent", { description: response?.message || `You invited ${values.firstName} ${values.lastName} as a ${values.role} team member` });
      inviteForm.reset();
      setShowPassword(false);
      setIsInviteOpen(false);
      await fetchTeamMembers();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to send invitation. Please try again.';
      toast.error("Error", { description: message });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setDeleteLoading(true);
    try {
      await VendorTeamService.removeMember(memberId);
      toast.success("Member Removed", { description: "Team member has been removed from your account" });
      await fetchTeamMembers();
      setDeleteConfirm(null);
    } catch {
      toast.error("Error", { description: "Failed to remove team member." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleMemberStatus = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setStatusLoading(true);
    try {
      const response = await VendorTeamService.updateMemberStatus(memberId, newStatus as 'active' | 'inactive');
      toast.success(newStatus === 'active' ? "Member Activated" : "Member Deactivated", { description: response?.message || `Team member status changed to ${newStatus}` });
      await fetchTeamMembers();
      setStatusConfirm(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to update member status.";
      toast.error("Error", { description: message });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleEditMember = async (values: EditFormData) => {
    if (!editMemberId) return;
    setEditLoading(true);
    try {
      const payload: Record<string, string> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role,
      };
      if (values.password) {
        payload.password = values.password;
      }
      const response = await VendorTeamService.updateMember(editMemberId, payload);
      toast.success("Member Updated", { description: response?.message || "Team member updated successfully" });
      await fetchTeamMembers();
      setEditMemberId(null);
      setShowEditPassword(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to update team member.";
      toast.error("Error", { description: message });
    } finally {
      setEditLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50 gap-1">
            <ShieldAlert className="h-3 w-3" />
            Admin
          </Badge>
        );
      case 'manager':
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 gap-1">
            <ShieldCheck className="h-3 w-3" />
            Manager
          </Badge>
        );
      case 'staff':
        return (
          <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 gap-1">
            <Shield className="h-3 w-3" />
            Staff
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-50">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Members List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team and their access to your vendor account
            </p>
          </div>
          <Dialog open={isInviteOpen} onOpenChange={(open) => { setIsInviteOpen(open); if (!open) { inviteForm.reset(); setShowPassword(false); } }}>
            <DialogTrigger asChild>
              <Button className="bg-[#F07712] hover:bg-[#E06600]">
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Invite Team Member</DialogTitle>
              </DialogHeader>
              <Form {...inviteForm}>
                <form onSubmit={inviteForm.handleSubmit(handleInviteMember)} className="space-y-4 pt-2">
                  {/* Full Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={inviteForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={inviteForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <FormField
                    control={inviteForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={inviteForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Min 6 characters"
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role */}
                  <FormField
                    control={inviteForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="staff">Staff - Can view orders and update status</SelectItem>
                            <SelectItem value="manager">Manager - Can manage services and orders</SelectItem>
                            <SelectItem value="admin">Admin - Full access to account</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-[#F07712] hover:bg-[#E06600]"
                      disabled={inviteLoading}
                    >
                      {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                      {inviteLoading ? 'Inviting...' : 'Invite Team Member'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F07712]"></div>
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#F07712]/10 flex items-center justify-center text-[#F07712] font-semibold text-sm">
                      {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="font-medium">{member.user.firstName} {member.user.lastName}</h4>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRoleBadge(member.teamRole)}
                    {getStatusBadge(member.status)}
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          editForm.reset({
                            firstName: member.user.firstName || '',
                            lastName: member.user.lastName || '',
                            email: member.user.email || '',
                            password: '',
                            role: member.teamRole as 'staff' | 'manager' | 'admin',
                          });
                          setShowEditPassword(false);
                          setEditMemberId(member.id);
                        }}
                        title="Edit member"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusConfirm({ memberId: member.id, memberName: `${member.user.firstName} ${member.user.lastName}`, currentStatus: member.status })}
                        title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {member.status === 'active' ? <UserX className="h-4 w-4 text-gray-500" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm({ memberId: member.id, memberName: `${member.user.firstName} ${member.user.lastName}` })}
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-muted-foreground font-medium">No team members yet</p>
              <p className="text-sm text-muted-foreground mt-1">Invite team members to help manage your vendor account</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activate/Deactivate Confirmation Dialog */}
      {statusConfirm && (
        <StatusConfirmDialog
          memberName={statusConfirm.memberName}
          currentStatus={statusConfirm.currentStatus}
          loading={statusLoading}
          open={!!statusConfirm}
          onOpenChange={(open) => !open && setStatusConfirm(null)}
          onConfirm={() => handleToggleMemberStatus(statusConfirm.memberId, statusConfirm.currentStatus)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <DeleteConfirmDialog
          memberName={deleteConfirm.memberName}
          loading={deleteLoading}
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          onConfirm={() => handleRemoveMember(deleteConfirm.memberId)}
        />
      )}

      {/* Edit Member Dialog */}
      <Dialog open={!!editMemberId} onOpenChange={(open) => { if (!open) { setEditMemberId(null); setShowEditPassword(false); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Team Member</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditMember)} className="space-y-4 pt-2">
              {/* Full Name */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password (optional) */}
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password <span className="text-muted-foreground text-xs">(leave empty to keep current)</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showEditPassword ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff - Can view orders and update status</SelectItem>
                        <SelectItem value="manager">Manager - Can manage services and orders</SelectItem>
                        <SelectItem value="admin">Admin - Full access to account</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#F07712] hover:bg-[#E06600]"
                  disabled={editLoading}
                >
                  {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setEditMemberId(null); setShowEditPassword(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Role Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of what each role can access in the vendor panel
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg border-green-200 bg-green-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Staff</h4>
              </div>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Dashboard</li>
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Orders</li>
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Messages</li>
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Calendar</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50/50">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Manager</h4>
              </div>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-blue-500">&#10003;</span> All Staff permissions</li>
                <li className="flex items-center gap-2"><span className="text-blue-500">&#10003;</span> My Services</li>
                <li className="flex items-center gap-2"><span className="text-blue-500">&#10003;</span> Analytics</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg border-red-200 bg-red-50/50">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-800">Admin</h4>
              </div>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-red-500">&#10003;</span> All Manager permissions</li>
                <li className="flex items-center gap-2"><span className="text-red-500">&#10003;</span> Team Management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
