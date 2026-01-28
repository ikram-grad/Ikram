import { useEffect, useState } from 'react';
import { X, Check, Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { ImageWithFallback } from './fallback/ImageWithFallback';
import { CharityData, CharityDetails, Meal, User } from '../lib/helpers/types';
import { charityOperations, orderOperations } from '../lib/helpers/api';

interface OrderFlowModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


export function OrderFlowModal({ meal, isOpen, onClose, onSuccess }: OrderFlowModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'choice' | 'charity-select' | 'processing' | 'success'>('choice');
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [charities, setCharities] = useState<CharityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !meal) return null;

  const handleOrder = async () => {
    // In demo mode, just show success
    if (!user) {
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2500);
      }, 1500);
      return;
    }

    if (!user) return;
    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      // RPC only takes meal_id, user comes from auth.uid()
      const { data ,error: orderError } = await orderOperations.completePurchase(meal.id);
      if (orderError) throw orderError;

      console.log(data);
      
      setStep('success');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to complete order');
      setStep('choice');
    } finally {
      setLoading(false);
    }
  };

  const handleDonateClick = async () => {
    setLoading(true);
    
    // In demo mode, use mock charities
    if (!user) {
      setLoading(false);
      setStep('charity-select');
      return;
    }

    const { data, error } = await charityOperations.getVerifiedCharities();
    setLoading(false);
    
    if (error) {
      setError('Failed to load charities');
      return;
    }
    
    setCharities(data || []);
    setStep('charity-select');
  };

  const handleDonate = async () => {
    if (!selectedCharity) return;
    
    // In demo mode, just show success
    if (!user) {
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2500);
      }, 1500);
      return;
    }

    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      const { error: donateError } = await orderOperations.donateMeal(meal.id, selectedCharity);
      if (donateError) throw donateError;
      
      setStep('success');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to donate meal');
      setStep('charity-select');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('choice');
    setSelectedCharity(null);
    setError(null);
    onClose();
  };

  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/90 backdrop-blur-sm">
      <div className="relative bg-[#E5E5E5] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#1A1A1A] p-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl tracking-tighter text-[#C88D00]">
            {step === 'choice' && 'THE CHOICE'}
            {step === 'charity-select' && 'SELECT CHARITY'}
            {step === 'processing' && 'PROCESSING...'}
            {step === 'success' && 'SUCCESS!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-[#C88D00] transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Meal Preview */}
          <div className="bg-white/60 p-6 mb-6">
            <div className="flex gap-4">
              <div className="w-24 h-24 flex-shrink-0">
                <ImageWithFallback
                  src={meal.image_url}
                  alt={meal.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl tracking-tight mb-2">{meal.title}</h3>
                <p className="text-sm text-neutral-600 mb-2">{meal.restaurant?.name}</p>
                <div className="text-2xl tracking-tight">
                  <span className="text-neutral-500 line-through text-sm mr-2">
                    ${meal.original_price}
                  </span>
                  ${meal.discount_price}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 text-red-900 text-sm">
              {error}
            </div>
          )}

          {/* Choice Step */}
          {step === 'choice' && (
            <div className="space-y-4">
              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full group relative overflow-hidden bg-[#1A1A1A] text-white py-8 px-8 transition-all duration-300 hover:shadow-xl disabled:opacity-50"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-3xl tracking-tighter mb-1">ORDER NOW</div>
                    <div className="text-sm tracking-widest uppercase opacity-80">
                      Reserve for yourself
                    </div>
                  </div>
                  <ShoppingBag className="w-12 h-12" />
                </div>
                <div className="absolute inset-0 bg-[#C88D00] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
              </button>

              <button
                onClick={handleDonateClick}
                disabled={loading}
                className="w-full group relative overflow-hidden bg-[#C88D00] text-white py-8 px-8 transition-all duration-300 hover:shadow-xl disabled:opacity-50"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-3xl tracking-tighter mb-1">DONATE THIS</div>
                    <div className="text-sm tracking-widest uppercase opacity-90">
                      Gift to those in need
                    </div>
                  </div>
                  <Heart className="w-12 h-12" />
                </div>
                <div className="absolute inset-0 bg-[#1A1A1A] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
              </button>

              <p className="text-center text-xs text-neutral-600">
                Both options rescue this meal from waste and create positive impact
              </p>
            </div>
          )}

          {/* Charity Select Step */}
          {step === 'charity-select' && (
            <div>
              <p className="text-sm text-neutral-700 mb-6">
                Select a verified charity to receive this meal
              </p>
              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {charities.map((charity) => (
                  <button
                    key={charity.user_id}
                    onClick={() => setSelectedCharity(charity.user_id)}
                    className={`w-full text-left p-4 border-2 transition-all ${
                      selectedCharity === charity.user_id
                        ? 'border-[#C88D00] bg-[#C88D00]/10'
                        : 'border-[#1A1A1A]/10 bg-white/60 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="tracking-tight mb-1">{charity.user.name || "Unamed"}</h4>
                        <p className="text-xs text-neutral-600">{charity.mission_statement}</p>
                      </div>
                      {charity.is_verified && (
                        <div className="flex items-center gap-1 text-xs text-[#C88D00] whitespace-nowrap ml-2">
                          <Check className="w-4 h-4" />
                          Verified
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleDonate}
                disabled={!selectedCharity || loading}
                className="w-full group relative overflow-hidden bg-[#C88D00] text-white py-5 text-sm tracking-widest uppercase disabled:opacity-50 transition-all duration-300"
              >
                <span className="relative z-10">CONFIRM DONATION</span>
                <div className="absolute inset-0 bg-[#1A1A1A] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
              </button>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 border-4 border-[#C88D00] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-lg text-neutral-700">Processing your request...</p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-[#C88D00] rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl tracking-tighter mb-4">ORDER CONFIRMED!</h3>
              <p className="text-neutral-700 mb-6">
                Check your orders page for pickup details and QR code
              </p>
              <div className="inline-block px-6 py-3 bg-[#C88D00]/20 text-sm">
                +10 Loyalty Points Earned
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}