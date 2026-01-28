import { useEffect, useState } from 'react';
import { Heart, Phone, Mail, Edit2, Save, Users, Award, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { charityOperations } from '../../lib/helpers/api';

interface CharityProfileProps {
  onNavigate?: (page: string) => void;
}

// Stats interface based on your existing logic
interface CharityStats {
  totalMeals: number;
  totalDonations: number;
  peopleServed: number;
  joinedDate: string;
}

export function CharityProfile({ onNavigate }: CharityProfileProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Stats State
  const [stats, setStats] = useState<CharityStats>({
    totalMeals: 0,
    totalDonations: 0,
    peopleServed: 0,
    joinedDate: '',
  });

  // Form State - Strictly typed to your Schema
  const [formData, setFormData] = useState({
    name: '', // public.users
    email: '', // public.users
    phone: '', // public.users
    registration_number: '', // public.charity_details (was ein)
    mission_statement: '', // public.charity_details
    is_verified: false, // public.charity_details
  });

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;

      try {
        setLoading(true);
        
        // 1. Fetch Charity Details (Mission, Registration Number)
        const { data: charityDetails } = await charityOperations.getCharityProfile(userProfile.id);

        // 2. Fetch Stats
        const { data: statData } = await charityOperations.getCharityStats(userProfile.id);

        // 3. Update State combining User and CharityDetails
        setFormData({
          name: userProfile.name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          registration_number: charityDetails?.registration_number || '',
          mission_statement: charityDetails?.mission_statement || '',
          is_verified: charityDetails?.is_verified || false,
        });

        setStats({
             totalMeals: statData?.mealsReceived || 0,
             totalDonations: statData?.totalDonations || 0,
             peopleServed: statData?.peopleServed || 0,
             joinedDate: new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });

      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Logic to update `users` and `charity_details` tables goes here
    console.log("Saving:", formData);
    setIsEditing(false);
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      {/* Header */}
      <div className="bg-[#1A1A1A] px-8 md:px-16 py-12 border-b border-[#C88D00]/20">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-[#C88D00]" />
              <h1 className="text-4xl md:text-5xl tracking-tighter text-white">
                CHARITY PROFILE
              </h1>
              {/* Verification Badge from DB */}
              {formData.is_verified ? (
                <span className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-green-500/50">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-neutral-700 text-neutral-400 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                  <XCircle className="w-3 h-3" /> Unverified
                </span>
              )}
            </div>
            
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className="flex items-center gap-3 px-6 py-3 bg-[#C88D00] text-black hover:bg-[#B07D00] transition-all"
            >
              {isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  <span className="tracking-widest uppercase text-sm">Save Changes</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-5 h-5" />
                  <span className="tracking-widest uppercase text-sm">Edit Profile</span>
                </>
              )}
            </button>
          </div>
          <p className="text-white/60 tracking-wide">Manage your organization information and settings</p>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-8 md:px-16 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border-l-4 border-[#C88D00]">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-[#C88D00]" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">Total Meals</span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.totalMeals}</div>
          </div>

          <div className="bg-white p-6 border-l-4 border-rose-500">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-rose-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">Donations</span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.totalDonations}</div>
          </div>

          <div className="bg-white p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">People Served</span>
            </div>
            <div className="text-3xl text-[#1A1A1A]">{stats.peopleServed}</div>
          </div>

          <div className="bg-white p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-blue-500" />
              <span className="text-xs tracking-widest uppercase text-neutral-400">Member Since</span>
            </div>
            <div className="text-lg text-[#1A1A1A]">{stats.joinedDate}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Basic Information */}
          <div className="bg-white p-8 border-l-4 border-[#C88D00]">
            <h3 className="text-2xl tracking-wider uppercase text-[#1A1A1A] mb-6">Basic Information</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Organization Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  />
                ) : (
                  <div className="text-lg text-[#1A1A1A]">{formData.name}</div>
                )}
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Registration Number / EIN
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  />
                ) : (
                  <div className="text-[#1A1A1A]">{formData.registration_number || 'N/A'}</div>
                )}
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Mission Statement
                </label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    name="mission_statement"
                    value={formData.mission_statement}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  />
                ) : (
                  <div className="text-neutral-700 leading-relaxed">
                    {formData.mission_statement || 'No mission statement provided.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-8 border-l-4 border-[#C88D00]">
            <h3 className="text-2xl tracking-wider uppercase text-[#1A1A1A] mb-6">Contact Information</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Email
                </label>
                {/* Email is usually Read-Only as it's the auth ID */}
                <div className="flex items-center gap-2 text-[#1A1A1A]">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  {formData.email}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[#1A1A1A]">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    {formData.phone || 'N/A'}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Save Button (Duplicate for bottom access) */}
        {isEditing && (
          <div className="mt-8 flex gap-4">
            <button 
              onClick={handleSave}
              className="px-12 py-4 bg-[#C88D00] text-black text-sm tracking-widest uppercase hover:bg-[#B07D00] transition-colors"
            >
              Save All Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-12 py-4 bg-neutral-200 text-neutral-700 text-sm tracking-widest uppercase hover:bg-neutral-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}