import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, Search, UserPlus, RefreshCw, CheckCircle2, Crown, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ROLES = [
  { value: "user", label: "User", color: "bg-gray-500/20 text-gray-400", icon: "👤" },
  { value: "admin", label: "Admin", color: "bg-red-500/20 text-red-400", icon: "🛡️" },
];

const ROLE_DESCRIPTIONS = {
  user: "Standard access — can use the app normally.",
  admin: "Full access — can manage users, view all data, and access the Command Center.",
};

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast({ title: "Role updated successfully" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), inviteRole);
      toast({ title: `Invite sent to ${inviteEmail}`, description: `Role: ${inviteRole}` });
      setInviteEmail("");
    } catch (err) {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const filtered = users.filter(u =>
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            USER ACCESS MANAGEMENT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm mb-4">
            Promote users to admin, manage access levels, and invite new team members.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {ROLES.map(r => (
              <div key={r.value} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <span>{r.icon}</span>
                  <span className={`font-semibold text-sm px-2 py-0.5 rounded ${r.color}`}>{r.label}</span>
                </div>
                <p className="text-gray-500 text-xs">{ROLE_DESCRIPTIONS[r.value]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite User */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Email address..."
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleInvite()}
              className="bg-[#0B0B0C] border-gray-700 text-white flex-1"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111317] border-gray-700">
                {ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value} className="text-white">
                    {r.icon} {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {inviting ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              All Users ({users.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-gray-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-[#0B0B0C] border-gray-700 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{u.full_name || "—"}</p>
                      <p className="text-gray-500 text-xs truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <Badge className={
                      u.role === "admin"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-gray-500/20 text-gray-400 border-gray-700"
                    }>
                      {u.role === "admin" ? "🛡️ Admin" : "👤 User"}
                    </Badge>
                    <Select
                      value={u.role || "user"}
                      onValueChange={val => updateRoleMutation.mutate({ id: u.id, role: val })}
                    >
                      <SelectTrigger className="bg-[#111317] border-gray-700 text-white text-xs w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111317] border-gray-700">
                        {ROLES.map(r => (
                          <SelectItem key={r.value} value={r.value} className="text-white text-xs">
                            {r.icon} {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}