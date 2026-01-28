import { TrendingDown, DollarSign, Leaf, Award, Heart, Utensils } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { userStats } from '../lib/helpers/api';
import { LoadingContainer } from './ui/loading';

export function ImpactProfile() {
  const { user, refreshProfile } = useAuth();
  const [mealsCount, setMealsCount] = useState(0);
  const [mealsDonated, setMealsDonated] = useState(0);
  const [moneySaved, setMoneySaved] = useState(0);
  const [co2Reduced, setCo2Reduced] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Removed unused state usingMockData if not implementing mock fallback logic directly here
  // const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    
    // Refresh profile first to get latest auth state if needed
    if (refreshProfile) await refreshProfile();
    
    if (user) {
      const { data } = await userStats.getImpactStats(user.id);
      if (data) {
        animateCounter(setMealsCount, data.meals_saved);
        animateCounter(setMealsDonated, data.meals_donated || 0);
        // Animate money and CO2 or just set them (using set for float values to avoid complex float animation logic)
        setMoneySaved(data.money_saved);
        setCo2Reduced(data.co2_reduced);
        setLoyaltyPoints(data.loyalty_points);
      }
    }
    setLoading(false);
  };

  const animateCounter = (setter: (val: number) => void, target: number) => {
    let current = 0;
    // If target is 0, just set it
    if (target === 0) {
        setter(0);
        return;
    }
    
    const increment = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(current);
      }
    }, 30);
  };

  const achievements = [
    {
      id: 1,
      title: "First Rescue",
      description: "Your journey begins",
      icon: Heart,
      unlocked: mealsCount >= 1
    },
    {
      id: 2,
      title: "Eco Warrior",
      description: "10 meals rescued",
      icon: Leaf,
      unlocked: mealsCount >= 10
    },
    {
      id: 3,
      title: "Impact Maker",
      description: "50 meals rescued",
      icon: Award,
      unlocked: mealsCount >= 50
    },
    {
      id: 4,
      title: "Gourmet Rescuer",
      description: "100 meals rescued",
      icon: Utensils,
      unlocked: mealsCount >= 100
    }
  ];

  if (loading) {
      return LoadingContainer();
  }

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      {/* Header */}
      <div className="bg-[#1A1A1A] py-32 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-[10vw] md:text-[7rem] leading-[0.9] tracking-tighter text-white mb-6">
            MY <span className="text-[#C88D00]">IMPACT</span>
          </h1>
          <p className="text-xl text-neutral-400">
            Your personal contribution to a sustainable future
          </p>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-[1400px] mx-auto py-16 px-8 md:px-16">
        
        {/* Primary Stat - Meals Rescued */}
        <div className="bg-white/60 backdrop-blur-sm border border-[#1A1A1A]/10 p-16 mb-8 text-center">
          <div className="text-sm tracking-[0.3em] uppercase text-neutral-600 mb-8">
            Total Meals Rescued
          </div>
          <div className="text-[12rem] md:text-[16rem] leading-none tracking-tighter mb-8 font-['Oswald']">
            {mealsCount.toString().padStart(3, '0')}
          </div>
          <div className="w-32 h-1 bg-[#C88D00] mx-auto mb-8" />
          <p className="text-lg text-neutral-700">
            Every meal rescued is a step towards zero waste
          </p>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Money Saved */}
          <div className="bg-white/60 backdrop-blur-sm border border-[#1A1A1A]/10 p-12">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-sm tracking-[0.3em] uppercase text-neutral-600 mb-4">
                  Money Saved
                </div>
                <div className="text-[5rem] leading-none tracking-tighter">
                  ${Math.round(moneySaved)}
                </div>
              </div>
              <div className="w-20 h-20 bg-[#1A1A1A] flex items-center justify-center">
                <DollarSign className="w-12 h-12 text-[#C88D00]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="h-px bg-[#1A1A1A]/10 mb-6" />
            <p className="text-sm text-neutral-600 leading-relaxed">
              Premium dining at a fraction of the cost
            </p>
          </div>

          {/* CO2 Reduced */}
          <div className="bg-white/60 backdrop-blur-sm border border-[#1A1A1A]/10 p-12">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-sm tracking-[0.3em] uppercase text-neutral-600 mb-4">
                  CO₂ Reduced
                </div>
                <div className="text-[5rem] leading-none tracking-tighter">
                  {Math.round(co2Reduced)}
                  <span className="text-3xl text-neutral-600 ml-2">KG</span>
                </div>
              </div>
              <div className="w-20 h-20 bg-[#1A1A1A] flex items-center justify-center">
                <Leaf className="w-12 h-12 text-[#C88D00]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="h-px bg-[#1A1A1A]/10 mb-6" />
            <p className="text-sm text-neutral-600 leading-relaxed">
              Equivalent to planting {Math.max(1, Math.round(co2Reduced / 25))} trees this year
            </p>
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="bg-[#C88D00] p-12 mb-8 text-center">
          <div className="text-sm tracking-[0.3em] uppercase text-[#1A1A1A]/80 mb-4">
            Loyalty Points Balance
          </div>
          <div className="text-[6rem] leading-none tracking-tighter text-[#1A1A1A]">
            {loyaltyPoints}
          </div>
          <p className="text-sm text-[#1A1A1A]/80 mt-4">
            Earn points with every rescue and donation
          </p>
        </div>

        {/* Achievements */}
        <div className="bg-white/60 backdrop-blur-sm border border-[#1A1A1A]/10 p-12">
          <h2 className="text-3xl tracking-tighter mb-8">ACHIEVEMENTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-8 border-2 transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-[#C88D00] border-[#C88D00] text-white' 
                    : 'bg-neutral-100 border-neutral-300 text-neutral-400'
                }`}
              >
                <div className="flex justify-center mb-6">
                  <div className={`w-16 h-16 flex items-center justify-center ${
                    achievement.unlocked ? 'bg-[#1A1A1A]' : 'bg-neutral-300'
                  }`}>
                    <achievement.icon 
                      className={`w-10 h-10 ${
                        achievement.unlocked ? 'text-[#C88D00]' : 'text-neutral-500'
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <h3 className={`text-xl tracking-tight mb-2 text-center ${
                  achievement.unlocked ? 'text-white' : 'text-neutral-600'
                }`}>
                  {achievement.title}
                </h3>
                <p className={`text-xs text-center tracking-wide ${
                  achievement.unlocked ? 'text-white/80' : 'text-neutral-500'
                }`}>
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-[#1A1A1A] p-16 text-center">
          <h2 className="text-5xl tracking-tighter text-white mb-4">
            KEEP GOING
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            You're making a real difference. Every meal counts.
          </p>
          <a
            href="#/browse"
            className="inline-block px-12 py-5 bg-[#C88D00] text-white text-sm tracking-widest uppercase hover:bg-[#B07D00] transition-colors"
          >
            Browse Available Meals
          </a>
        </div>
      </div>
    </div>
  );
}