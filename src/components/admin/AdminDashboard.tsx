import { Users, Package, ShoppingBag, TrendingUp, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminOperations } from '../../lib/helpers/api';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  // State for real data
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRestaurants: 0,
    activeCharities: 0,
    totalMeals: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  
  useEffect(() => {
    fetchAdminData();
  }, []);


  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const { data: statData } = await adminOperations.getDashboardStats();
      if (statData) setStats({
        ...statData,
        revenue: statData.revenue ?? 0,
      });

      // 2. Fetch Users
      const { data: userData } = await adminOperations.getRecentUsers();
      if (userData) {
        setRecentUsers(userData.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          // Map is_active boolean to 'active'/'pending' string
          status: u.is_active ? 'active' : 'pending',
          created: new Date(u.created_at).toLocaleDateString()
        })));
      }

      // 3. Fetch Orders
      const { data: orderData } = await adminOperations.getRecentOrders();
      if (orderData) {
        setRecentOrders(orderData.map((o: any) => ({
          id: o.id,
          meal: o.meal?.title || 'Unknown Meal',
          // Accessing nested restaurant name safely
          restaurant: o.restaurant?.restaurant?.name || 'Unknown Restaurant', 
          amount: o.total_amount,
          status: o.status
        })));
      }

    } catch (error) {
      console.error("Failed to load admin dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C88D00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      {/* Header */}
      <div className="bg-[#1A1A1A] px-8 md:px-16 py-12 border-b border-[#C88D00]/20">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[#C88D00]" />
            <h1 className="text-4xl md:text-5xl tracking-tighter text-white">
              ADMIN DASHBOARD
            </h1>
          </div>
          <p className="text-white/60 tracking-wide">System Overview & Management</p>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-8 md:px-16 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border-l-4 border-[#C88D00]">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-[#C88D00]" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">Total Users</span>
            </div>
            <div className="text-3xl text-[#1A1A1A] mb-1">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12% this month</span>
            </div>
          </div>

          <div className="bg-white p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">Restaurants</span>
            </div>
            <div className="text-3xl text-[#1A1A1A] mb-1">{stats.activeRestaurants}</div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+5 this week</span>
            </div>
          </div>

          <div className="bg-white p-6 border-l-4 border-rose-500">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8 text-rose-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">Total Orders</span>
            </div>
            <div className="text-3xl text-[#1A1A1A] mb-1">{stats.totalOrders.toLocaleString()}</div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+8% this week</span>
            </div>
          </div>

          <div className="bg-white p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">Revenue</span>
            </div>
            <div className="text-3xl text-[#1A1A1A] mb-1">${stats.revenue.toLocaleString()}</div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+15% this month</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => onNavigate?.('admin-users')}
            className="bg-[#1A1A1A] p-8 hover:bg-[#C88D00] transition-all duration-300 group"
          >
            <Users className="w-10 h-10 text-[#C88D00] group-hover:text-black transition-colors mb-4" />
            <h3 className="text-xl tracking-wider uppercase text-white group-hover:text-black transition-colors mb-2">
              Manage Users
            </h3>
            <p className="text-white/60 group-hover:text-black/70 text-sm">
              View, verify, and manage all user accounts
            </p>
          </button>

          <button
            onClick={() => onNavigate?.('admin-meals')}
            className="bg-[#1A1A1A] p-8 hover:bg-[#C88D00] transition-all duration-300 group"
          >
            <Package className="w-10 h-10 text-[#C88D00] group-hover:text-black transition-colors mb-4" />
            <h3 className="text-xl tracking-wider uppercase text-white group-hover:text-black transition-colors mb-2">
              Manage Meals
            </h3>
            <p className="text-white/60 group-hover:text-black/70 text-sm">
              Oversee all meal listings and inventory
            </p>
          </button>

          <button
            onClick={() => onNavigate?.('admin-orders')}
            className="bg-[#1A1A1A] p-8 hover:bg-[#C88D00] transition-all duration-300 group"
          >
            <ShoppingBag className="w-10 h-10 text-[#C88D00] group-hover:text-black transition-colors mb-4" />
            <h3 className="text-xl tracking-wider uppercase text-white group-hover:text-black transition-colors mb-2">
              Manage Orders
            </h3>
            <p className="text-white/60 group-hover:text-black/70 text-sm">
              Monitor and manage all platform orders
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white">
            <div className="bg-[#1A1A1A] px-6 py-4 border-b border-[#C88D00]/20">
              <h3 className="text-lg tracking-widest uppercase text-[#C88D00]">Recent Registrations</h3>
            </div>
            <div className="divide-y divide-neutral-200">
              {recentUsers.map((user) => (
                <div key={user.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[#1A1A1A] mb-1">{user.name}</div>
                      <div className="text-sm text-neutral-500">{user.email}</div>
                    </div>
                    {user.status === 'pending' ? (
                      <span className="flex items-center gap-1 text-xs tracking-widest uppercase text-orange-600 bg-orange-100 px-3 py-1">
                        <AlertCircle className="w-3 h-3" />
                        Pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs tracking-widest uppercase text-green-600 bg-green-100 px-3 py-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span className="tracking-widest uppercase">{user.role}</span>
                    <span>•</span>
                    <span>{user.created}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white">
            <div className="bg-[#1A1A1A] px-6 py-4 border-b border-[#C88D00]/20">
              <h3 className="text-lg tracking-widest uppercase text-[#C88D00]">Recent Orders</h3>
            </div>
            <div className="divide-y divide-neutral-200">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[#1A1A1A] mb-1">{order.meal}</div>
                      <div className="text-sm text-neutral-500">{order.restaurant}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#1A1A1A] mb-1">${order.amount}</div>
                      <span className={`text-xs tracking-widest uppercase px-3 py-1 ${
                        order.status === 'completed' ? 'text-green-600 bg-green-100' :
                        order.status === 'donated' ? 'text-rose-600 bg-rose-100' :
                        'text-orange-600 bg-orange-100'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-400 tracking-widest uppercase">{order.id}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
