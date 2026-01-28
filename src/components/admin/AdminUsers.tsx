import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  Loader2,
  RefreshCw,
  X,
  Save,
} from "lucide-react";
import { adminOperations } from "../../lib/helpers/api";
import { User, UserRole } from "../../lib/helpers/types";

interface AdminUsersProps {
  onNavigate?: (page: string) => void;
}

export function AdminUsers({ onNavigate }: AdminUsersProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<"all" | UserRole>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- Edit State ---
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "consumer" as UserRole,
  });

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    consumers: 0,
    restaurants: 0,
    charities: 0,
    admins: 0,
    active: 0,
    inactive: 0,
  });

  // --- 1. Fetch Data ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminOperations.getAllUsers();
      if (error) throw error;

      if (data) {
        setUsers(data as User[]);
        calculateStats(data as User[]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- 2. Calculate Stats Helper ---
  const calculateStats = (data: User[]) => {
    const newStats = {
      total: data.length,
      consumers: data.filter((u) => u.role === "consumer").length,
      restaurants: data.filter((u) => u.role === "restaurant").length,
      charities: data.filter((u) => u.role === "charity").length,
      admins: data.filter((u) => u.role === "admin").length,
      active: data.filter((u) => u.is_active).length,
      inactive: data.filter((u) => !u.is_active).length,
    };
    setStats(newStats);
  };

  // --- 3. Handlers ---

  // Open Edit Modal
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    });
  };

  // Save Edit
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setProcessingId(editingUser.id);

    try {
      const { data, error } = await adminOperations.updateUserProfile(
        editingUser.id,
        editForm
      );

      if (error) throw error;

      // Optimistic Update
      const updatedList = users.map((u) =>
        u.id === editingUser.id ? { ...u, ...editForm } : u
      );
      
      setUsers(updatedList);
      calculateStats(updatedList);
      setEditingUser(null); // Close modal
      alert("User updated successfully!");

    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update user.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (
      !confirm(
        `Are you sure you want to ${
          user.is_active ? "deactivate" : "activate"
        } this user?`
      )
    )
      return;

    setProcessingId(user.id);
    try {
      const { error } = await adminOperations.toggleUserStatus(
        user.id,
        user.is_active
      );
      if (error) throw error;

      const updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      );
      setUsers(updatedUsers);
      calculateStats(updatedUsers);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "Are you sure? This action cannot be undone and will delete all associated data."
      )
    )
      return;

    setProcessingId(userId);
    try {
      const { error } = await adminOperations.deleteUser(userId);
      if (error) throw error;

      const updatedUsers = users.filter((u) => u.id !== userId);
      setUsers(updatedUsers);
      calculateStats(updatedUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setProcessingId(null);
    }
  };

  // --- 4. Filtering Logic ---
  const filteredUsers = users.filter((user) => {
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.phone?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "consumer":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "restaurant":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "charity":
        return "bg-rose-100 text-rose-600 border-rose-200";
      case "admin":
        return "bg-neutral-800 text-white border-neutral-600";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C88D00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E5E5] relative">
      {/* --- EDIT USER MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border-l-4 border-[#C88D00] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1A1A1A]">Edit User</h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#C88D00] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#C88D00] transition-colors"
                />
                <p className="text-xs text-orange-600 mt-1">Note: Changing email here does not change login credentials.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#C88D00] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Role</label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value as UserRole})}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#C88D00] transition-colors"
                  >
                    <option value="consumer">Consumer</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="charity">Charity</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-neutral-50 rounded-b-2xl flex gap-3 justify-end">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-6 py-2.5 text-sm font-bold tracking-wide text-neutral-600 hover:text-black transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleUpdateUser}
                disabled={!!processingId}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#C88D00] text-white text-sm font-bold tracking-wide rounded-lg hover:bg-[#B07D00] transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {processingId ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1A1A1A] px-8 md:px-16 py-12 border-b border-[#C88D00]/20">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-[#C88D00]" />
              <h1 className="text-4xl md:text-5xl tracking-tighter text-white">
                USER MANAGEMENT
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchUsers}
                className="p-3 bg-white/10 text-white hover:bg-white/20 transition-colors rounded-lg"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center gap-3 px-6 py-3 bg-[#C88D00] text-black hover:bg-[#B07D00] transition-all"
              >
                <UserPlus className="w-5 h-5" />
                <span className="tracking-widest uppercase text-sm">
                  Add User
                </span>
              </button>
            </div>
          </div>
          <p className="text-white/60 tracking-wide">
            Manage all users across the platform
          </p>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-8 md:px-16 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
          {/* ... (Stats Cards remain unchanged from your code) ... */}
           <div className="bg-white p-6 border-l-4 border-[#C88D00] shadow-sm">
            <div className="text-xs tracking-widest uppercase text-neutral-400 mb-2">Total Users</div>
            <div className="text-3xl text-[#1A1A1A]">{stats.total}</div>
          </div>
          <div className="bg-white p-6 border-l-4 border-blue-500 shadow-sm">
            <div className="text-xs tracking-widest uppercase text-neutral-400 mb-2">Consumers</div>
            <div className="text-3xl text-[#1A1A1A]">{stats.consumers}</div>
          </div>
          <div className="bg-white p-6 border-l-4 border-purple-500 shadow-sm">
            <div className="text-xs tracking-widest uppercase text-neutral-400 mb-2">Restaurants</div>
            <div className="text-3xl text-[#1A1A1A]">{stats.restaurants}</div>
          </div>
          <div className="bg-white p-6 border-l-4 border-rose-500 shadow-sm">
            <div className="text-xs tracking-widest uppercase text-neutral-400 mb-2">Charities</div>
            <div className="text-3xl text-[#1A1A1A]">{stats.charities}</div>
          </div>
          <div className="bg-white p-6 border-l-4 border-neutral-800 shadow-sm">
            <div className="text-xs tracking-widest uppercase text-neutral-400 mb-2">Admins</div>
            <div className="text-3xl text-[#1A1A1A]">{stats.admins}</div>
          </div>
          <div className="bg-white p-6 border-l-4 border-green-500 shadow-sm">
            <div className="text-xs tracking-widest uppercase text-neutral-400 mb-2">Active</div>
            <div className="text-3xl text-[#1A1A1A]">{stats.active}</div>
          </div>
          <div className="bg-white p-6 border-l-4 border-red-500 shadow-sm">
            <div className="text-xs tracking-widest uppercase text-neutral-400 mb-2">Inactive</div>
            <div className="text-3xl text-[#1A1A1A]">{stats.inactive}</div>
          </div>
        </div>

        {/* Add User Form (Placeholder) */}
        {showAddUser && (
          <div className="bg-white p-8 mb-12 border-l-4 border-[#C88D00] shadow-lg animate-in slide-in-from-top-4">
             {/* ... (Your existing placeholder add user code) ... */}
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl tracking-wider uppercase text-[#1A1A1A]">New User</h3>
              <span className="text-xs text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                Note: Creating a user here requires backend Admin SDK.
              </span>
            </div>
            <div className="flex gap-4 mt-6">
              <button className="px-8 py-3 bg-[#C88D00] text-black text-sm tracking-widest uppercase opacity-50 cursor-not-allowed">Create User</button>
              <button onClick={() => setShowAddUser(false)} className="px-8 py-3 bg-neutral-200 text-neutral-700 text-sm tracking-widest uppercase">Cancel</button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-6 mb-8 border-l-4 border-[#C88D00] shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-12 pr-10 py-3 bg-neutral-100 border border-neutral-300 rounded focus:outline-none focus:border-[#C88D00] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors min-w-[200px]"
              >
                <option value="all">All Roles</option>
                <option value="consumer">Consumers</option>
                <option value="restaurant">Restaurants</option>
                <option value="charity">Charities</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl tracking-wider uppercase text-[#1A1A1A]">
              Users ({filteredUsers.length})
            </h3>
          </div>

          {filteredUsers.length === 0 && (
            <div className="bg-white p-12 text-center border-l-4 border-neutral-300">
              <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl text-neutral-500 tracking-wider uppercase mb-2">
                No Users Found
              </h3>
              <p className="text-neutral-400">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`bg-white border-l-4 hover:shadow-lg transition-all ${
                user.is_active
                  ? "border-[#C88D00]"
                  : "border-red-400 bg-red-50/50"
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-xl text-[#1A1A1A] font-medium">
                            {user.name}
                          </h4>
                          <span
                            className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase border rounded-full ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase border rounded-full ${
                              user.is_active
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-sm text-neutral-600 mt-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#C88D00]" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[#C88D00]" />
                            <span>{user.phone || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#C88D00]" />
                            <span>
                              Joined{" "}
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-6 border-neutral-100">
                    <button
                      onClick={() => handleEditClick(user)}
                      disabled={processingId === user.id}
                      className="p-3 bg-neutral-100 hover:bg-[#C88D00] hover:text-white transition-colors rounded-lg group"
                      title="Edit user"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={processingId === user.id}
                      className={`p-3 transition-colors rounded-lg ${
                        user.is_active
                          ? "bg-neutral-100 hover:bg-orange-500 hover:text-white text-orange-600"
                          : "bg-neutral-100 hover:bg-green-500 hover:text-white text-green-600"
                      }`}
                      title={
                        user.is_active ? "Deactivate user" : "Activate user"
                      }
                    >
                      {processingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : user.is_active ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>

                    {user.role !== "admin" ? (
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={processingId === user.id}
                        className="p-3 bg-neutral-100 hover:bg-red-500 hover:text-white text-red-500 transition-colors rounded-lg"
                        title="Delete user"
                      >
                        {processingId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <button
                        className="p-3 bg-neutral-100 text-neutral-300 cursor-not-allowed rounded-lg"
                        title="Cannot delete admin"
                        disabled
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}