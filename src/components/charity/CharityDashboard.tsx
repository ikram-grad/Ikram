import { Heart, TrendingUp, Package, Users, Calendar, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { charityOperations } from "../../lib/helpers/api";
import { supabase } from "../../lib/supabase";

interface CharityDashboardProps {
  onNavigate?: (page: string) => void;
}

export function CharityDashboard({ onNavigate }: CharityDashboardProps) {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    mealsReceived: 0,
    peopleServed: 0,
    valueReceived: 0,
  });
  const [donations, setDonations] = useState<any[]>([]);
  const [mission, setMission] = useState<string | null>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editMissionText, setEditMissionText] = useState("");

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadDashboard = async () => {
      if (!userProfile) return;

      // * 1. Fetch Stats
      const { data: statData } = await charityOperations.getCharityStats(
        userProfile.id
      );
      if (statData) setStats(statData);

      // * 2. Fetch mission
      const { data: profile } = await charityOperations.getCharityProfile(
        userProfile.id
      );
      if (profile?.mission_statement) {
        setMission(profile.mission_statement);
        setEditMissionText(profile.mission_statement); // * Sync edit text
      } 

      // * 3. Fetch donations list
      const { data: orders } = await charityOperations.getDonations(
        userProfile.id
      );

      if (orders) {
        // ! Map database shape to UI shape
        const formattedDonations = orders.map((order) => ({
          id: order.id,
          meal: order.meal?.title,
          restaurant: order.meal?.restaurant?.name,
          address: order.meal?.restaurant?.restaurant_details?.address, // Needed for pickups
          pickup_window: order.meal?.pickup_window, // Needed for pickups
          donor: order.donor?.name || "Anonymous",
          quantity: order.quantity || 1,
          value: order.total_amount,
          date: new Date(order.created_at).toLocaleDateString(), // Format as needed
          status: order.status,
        }));
        setDonations(formattedDonations);
      }
      setLoading(false);
    };

    loadDashboard();
  }, [userProfile]);


  // * Handler: Save Mission
  const handleSaveMission = async () => {
    if (!userProfile) return;

    // CALL API
    const { error } = await charityOperations.updateMission(userProfile.id, editMissionText);

    if (!error) {
      setMission(editMissionText); // Update displayed text
      setIsEditing(false); // Exit edit mode
    } else {
      console.error("Failed to update mission: ", error);
      alert("Failed to update mission. Please try again.");
    }
  };

  // Handler: Cancel Edit
  const handleCancelEdit = () => {
    setEditMissionText(mission?.toString() || ''); // Revert text
    setIsEditing(false);
  };

  if (!donations) return;
  const upcomingPickups = donations.filter(d => d.status === 'ready');



  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      {/* Header */}
      <div className="bg-[#1A1A1A] px-8 md:px-16 py-12 border-b border-[#C88D00]/20">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-rose-500" />
            <h1 className="text-xl md:text-5xl tracking-tighter text-white">
              CHARITY DASHBOARD
            </h1>
          </div>
          <p className="text-white/60 tracking-wide">
            Track donations and impact
          </p>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-8 md:px-16 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border-l-4 border-rose-500">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-rose-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Donations
              </span>
            </div>
            <div className="text-2xl text-[#1A1A1A] mb-1">
              {stats.totalDonations}
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+18% this month</span>
            </div>
          </div>

          <div className="bg-white p-6 border-l-4 border-[#C88D00]">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-[#C88D00]" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Meals
              </span>
            </div>
            <div className="text-2xl text-[#1A1A1A] mb-1">
              {stats.mealsReceived}
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+25% this month</span>
            </div>
          </div>

          <div className="bg-white p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                People Served
              </span>
            </div>
            <div className="text-2xl text-[#1A1A1A] mb-1">
              {stats.peopleServed}
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12% this month</span>
            </div>
          </div>

          <div className="bg-white p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">
                Total Value
              </span>
            </div>
            <div className="text-3xl text-[#1A1A1A] mb-1">
              ${stats.valueReceived.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+20% this month</span>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-8 mb-12 text-white shadow-xl">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl tracking-wider uppercase">Our Mission</h3>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editMissionText}
                onChange={(e) => setEditMissionText(e.target.value)}
                className="w-full h-32 p-4 text-gray-900 bg-black/95 rounded-sm text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#C88D00]"
                placeholder="Enter your charity's mission statement..."
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveMission}
                  className="flex items-center gap-2 px-6 py-2 bg-white text-rose-600 font-bold uppercase tracking-widest text-sm hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Save Mission
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-6 py-2 bg-rose-700 text-white font-bold uppercase tracking-widest text-sm hover:bg-rose-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-lg leading-relaxed text-white/90 min-h-[4rem]">
                {mission || "No mission statement set yet. Click below to add one!"}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 px-8 py-3 bg-white text-rose-600 text-sm tracking-widest uppercase hover:bg-neutral-100 transition-colors shadow-lg"
              >
                Update Mission
              </button>
            </>
          )}
        </div>
        {/* --- END EDITABLE MISSION --- */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Upcoming Pickups */}
          <div className="lg:col-span-1 bg-white">
            <div className="bg-[#1A1A1A] px-6 py-4 border-b border-[#C88D00]/20">
              <h3 className="text-lg tracking-widest uppercase text-[#C88D00] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Pickups
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {upcomingPickups.map((pickup, index) => (
                <div
                  key={index}
                  className="p-4 bg-rose-50 border-l-4 border-rose-500"
                >
                  <div className="text-[#1A1A1A] mb-1">{pickup.restaurant}</div>
                  <div className="text-sm text-neutral-600 mb-2">
                    {pickup.address}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-rose-600">{pickup.time}</span>
                    <span className="text-neutral-500">
                      {pickup.meals} meals
                    </span>
                  </div>
                </div>
              ))}
              {upcomingPickups.length === 0 && (
                <div className="text-center py-8 text-neutral-400">
                  No pickups scheduled for today
                </div>
              )}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="lg:col-span-2 bg-white">
            <div className="bg-[#1A1A1A] px-6 py-4 border-b border-[#C88D00]/20">
              <h3 className="text-lg tracking-widest uppercase text-[#C88D00]">
                Recent Donations
              </h3>
            </div>
            <div className="divide-y divide-neutral-200">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="p-6 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-[#1A1A1A] mb-1">{donation.meal}</div>
                      <div className="text-sm text-neutral-500 mb-2">
                        {donation.restaurant}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Donated by {donation.donor}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl text-[#1A1A1A] mb-1">
                        ${donation.value}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {donation.quantity} meals
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      {donation.date}
                    </span>
                    {donation.status === "ready" ? (
                      <button className="px-4 py-2 bg-[#C88D00] text-black text-xs tracking-widest uppercase hover:bg-[#B07D00] transition-colors">
                        Mark as Collected
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-green-100 text-green-700 text-xs tracking-widest uppercase">
                        Collected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1A1A1A] p-8 text-white">
            <Package className="w-10 h-10 text-[#C88D00] mb-4" />
            <div className="text-3xl mb-2">{stats.mealsReceived}</div>
            <div className="text-white/60 tracking-wide">Meals Rescued</div>
          </div>

          <div className="bg-[#1A1A1A] p-8 text-white">
            <Users className="w-10 h-10 text-[#C88D00] mb-4" />
            <div className="text-3xl mb-2">{stats.peopleServed}</div>
            <div className="text-white/60 tracking-wide">People Fed</div>
          </div>

          <div className="bg-[#1A1A1A] p-8 text-white">
            <TrendingUp className="w-10 h-10 text-[#C88D00] mb-4" />
            <div className="text-3xl mb-2">
              ${stats.valueReceived.toLocaleString()}
            </div>
            <div className="text-white/60 tracking-wide">Value Received</div>
          </div>
        </div>
      </div>
    </div>
  );
}
