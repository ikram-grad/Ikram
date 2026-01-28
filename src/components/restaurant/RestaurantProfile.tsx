import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Save,
  Loader2,
  FileText,
  BadgeCheck,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { restaurantOperations } from "../../lib/helpers/api";

interface RestaurantProfileProps {
  onNavigate?: (page: string) => void;
}

export function RestaurantProfile({ onNavigate }: RestaurantProfileProps) {
  const { userProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State of form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    business_license: "",
    average_rating: 0,
    is_verified: false,
  });

  // * Fetch Data
  useEffect(() => {
    fetchProfileData();
  }, [userProfile]);

  const fetchProfileData = async () => {
    if (!userProfile) return;
    setLoading(true);

    try {
      const { data: profile } = await restaurantOperations.getRestaurantProfile(
        userProfile.id
      );

      if (profile) {
        const details = profile.restaurant_details || {};

        console.log("Details:", details);

        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",

          // Correct access
          address: details.address || "",
          business_license: details.business_license || "",
          average_rating: details.average_rating ?? 0,
          is_verified: details.is_verified ?? false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Save
  const handleSave = async () => {
    if (!userProfile) return;
    setSaving(true);
    try {
      const { error } = await restaurantOperations.updateRestaurantProfile(
        userProfile.id,
        formData
      );
      if (error) throw error;
      setIsEditing(false);
      alert("Saved!");
    } catch (err) {
      alert("Error saving");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#C88D00]"/>
            <p className="text-neutral-400 animate-pulse tracking-widest text-sm">LOADING PROFILE</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      {/* Header */}
      <div className="bg-[#1A1A1A] px-8 md:px-16 py-12 border-b border-[#C88D00]/20">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-[#C88D00]" />
              <h1 className="text-4xl md:text-5xl tracking-tighter text-white">
                RESTAURANT PROFILE
              </h1>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
              className="flex items-center gap-3 px-6 py-3 bg-[#C88D00] text-black hover:bg-[#B07D00] transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="tracking-widest uppercase text-sm">Saving...</span>
                </>
              ) : isEditing ? (
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
          <p className="text-white/60 tracking-wide">Manage your restaurant information and settings</p>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-8 md:px-16 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 border-l-4 border-green-500">
            <div className="text-xs tracking-widest uppercase text-neutral-400 mb-2">Rating</div>
            <div className="text-3xl text-[#1A1A1A]">
              {formData.average_rating > 0 ? `${formData.average_rating} ★` : 'No rating yet'}
            </div>
          </div>

          <div className="bg-white p-6 border-l-4 border-blue-500">
            <div className="text-xs tracking-widest uppercase text-neutral-400 mb-2">Verification Status</div>
            <div className="flex items-center gap-2">
              {formData.is_verified ? (
                <>
                  <BadgeCheck className="w-6 h-6 text-green-500" />
                  <span className="text-lg text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  <span className="text-lg text-amber-600">Pending Verification</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white p-8 border-l-4 border-[#C88D00]">
              <h3 className="text-xl tracking-wider uppercase text-[#1A1A1A] mb-6">Basic Information</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                    Restaurant Name
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
                    <div className="text-lg text-[#1A1A1A]">{formData.name || 'Not set'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-8 border-l-4 border-[#C88D00]">
              <h3 className="text-xl tracking-wider uppercase text-[#1A1A1A] mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-[#1A1A1A]">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      {formData.email || 'Not set'}
                    </div>
                  )}
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
                      {formData.phone || 'Not set'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white p-8 border-l-4 border-[#C88D00]">
              <h3 className="text-xl tracking-wider uppercase text-[#1A1A1A] mb-6">Location</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                    />
                  ) : (
                    <div className="flex items-start gap-2 p-4 bg-neutral-50 border border-neutral-200">
                      <MapPin className="w-5 h-5 text-[#C88D00] flex-shrink-0 mt-1" />
                      <div className="text-neutral-700">
                        {formData.address || 'Not set'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business License */}
            <div className="bg-white p-8 border-l-4 border-[#C88D00]">
              <h3 className="text-xl tracking-wider uppercase text-[#1A1A1A] mb-6">Business License</h3>

              <div>
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  License Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="business_license"
                    value={formData.business_license}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] transition-colors"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[#1A1A1A]">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    {formData.business_license || 'Not set'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Verification Status */}
            <div className="bg-white p-8 border-l-4 border-[#C88D00]">
              <h3 className="text-lg tracking-wider uppercase text-[#1A1A1A] mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C88D00]" />
                Verification
              </h3>
              
              <div className="text-center py-6">
                {formData.is_verified ? (
                  <div className="space-y-3">
                    <BadgeCheck className="w-16 h-16 text-green-500 mx-auto" />
                    <p className="text-green-600 tracking-wide">Verified Restaurant</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
                    <p className="text-amber-600 tracking-wide">Verification Pending</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button at Bottom (when editing) */}
        {isEditing && (
          <div className="mt-8 flex gap-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-12 py-4 bg-[#C88D00] text-black text-sm tracking-widest uppercase hover:bg-[#B07D00] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={saving}
              className="px-12 py-4 bg-neutral-200 text-neutral-700 text-sm tracking-widest uppercase hover:bg-neutral-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
