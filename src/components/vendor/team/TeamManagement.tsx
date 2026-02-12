
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Trash2, UserCheck, UserX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useVendorTeam } from '@/hooks/vendor/use-vendor-team';

type TeamRole = 'admin' | 'manager' | 'staff';

interface InviteData {
  email: string;
  name: string;
  role: TeamRole;
}

const TeamManagement: React.FC = () => {
  const { toast } = useToast();
  const { teamMembers, loading, inviteMember, removeMember, toggleMemberStatus } = useVendorTeam();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData>({
    email: '',
    name: '',
    role: 'staff'
  });

  const handleInviteMember = async () => {
    if (!inviteData.email || !inviteData.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const success = await inviteMember(inviteData);
    if (success) {
      setInviteData({ email: '', name: '', role: 'staff' });
      setIsInviteOpen(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
  };

  const handleToggleMemberStatus = async (memberId: string, currentStatus: string) => {
    await toggleMemberStatus(memberId, currentStatus);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRoleChange = (value: string) => {
    setInviteData({...inviteData, role: value as TeamRole});
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your team and their access to your vendor account
            </p>
          </div>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="memberName">Full Name</Label>
                  <Input
                    id="memberName"
                    value={inviteData.name}
                    onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="memberEmail">Email Address</Label>
                  <Input
                    id="memberEmail"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="memberRole">Role</Label>
                  <Select value={inviteData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff - Can view orders and update status</SelectItem>
                      <SelectItem value="manager">Manager - Can manage services and orders</SelectItem>
                      <SelectItem value="admin">Admin - Full access to account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleInviteMember} className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                  <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                    <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleMemberStatus(member.id, member.status)}
                      >
                        {member.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No team members yet</p>
              <p className="text-sm text-muted-foreground">Invite team members to help manage your vendor account</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Staff</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• View orders and bookings</li>
                  <li>• Update order status</li>
                  <li>• Communicate with clients</li>
                  <li>• View calendar and availability</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Manager</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• All Staff permissions</li>
                  <li>• Manage services and pricing</li>
                  <li>• Create and send proposals</li>
                  <li>• Manage calendar availability</li>
                  <li>• View financial reports</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Admin</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• All Manager permissions</li>
                  <li>• Manage team members</li>
                  <li>• Update account settings</li>
                  <li>• Manage banking information</li>
                  <li>• Full account access</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
