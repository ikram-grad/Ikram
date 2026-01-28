import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { authHelpers } from "../lib/helpers/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = "signin" | "signup" | "forgot";
type Role = "consumer" | "restaurant" | "charity";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("signin");

  // signup-only
  const [role, setRole] = useState<Role>("consumer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // forgot
  const [forgotEmail, setForgotEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // success/info
  const [error, setError] = useState<string | null>(null); // errors only

  const redirectTo = useMemo(() => {
    return `${window.location.origin}/reset-password-bridge`;
  }, []);

  const title =
    mode === "signin"
      ? "SIGN IN"
      : mode === "signup"
        ? "SIGN UP"
        : "FORGOT PASSWORD";

  const submitLabel =
    mode === "signin"
      ? "SIGN IN"
      : mode === "signup"
        ? "CREATE ACCOUNT"
        : "SEND RESET LINK";

  const resetTransient = () => {
    setError(null);
    setMessage(null);
  };

  const handleClose = () => {
    setMode("signin");
    resetTransient();
    onClose();
  };

  const goToSignIn = () => {
    setMode("signin");
    resetTransient();
  };

  const goToSignUp = () => {
    setMode("signup");
    resetTransient();
  };

  const goToForgot = () => {
    setMode("forgot");
    setForgotEmail(email.trim()); // convenience
    resetTransient();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    resetTransient();

    try {
      if (mode === "signup") {
        const { error } = await authHelpers.signUp(
          email.trim(),
          password,
          name.trim(),
          role,
          phone.trim() || undefined,
        );
        if (error) throw error;

        setMessage("Check your email for the verification link!");
        // Close modal + refresh UI after a short moment
        setTimeout(() => {
          onSuccess();
        }, 1200);
        return;
      }

      if (mode === "signin") {
        const { error } = await authHelpers.signIn(email.trim(), password);
        if (error) throw error;

        onSuccess();
        return;
      }

      // forgot
      const mail = forgotEmail.trim();
      if (!mail) {
        setError("Please enter your email.");
        return;
      }

      const { error } = await authHelpers.forgotPassword(mail, redirectTo);
      if (error) throw error;

      // Do not leak whether email exists
      setMessage("If this email exists, you’ll receive a reset link shortly.");
      setTimeout(() => goToSignIn(), 1200);
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const showEmailPassword = mode !== "forgot";
  const showSignupFields = mode === "signup";
  const showForgotFields = mode === "forgot";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/90 backdrop-blur-sm">
      <div className="relative bg-[#E5E5E5] max-w-md w-full">
        {/* Header */}
        <div className="bg-[#1A1A1A] p-8 flex justify-between items-center">
          <h2 className="text-3xl tracking-tighter text-[#C88D00]">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-white hover:text-[#C88D00] transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Forgot Mode */}
          {showForgotFields && (
            <>
              <p className="text-sm text-neutral-700 mb-6">
                Enter your email and we’ll send you a link to reset your
                password.
              </p>

              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white/60 border border-[#1A1A1A]/10 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </>
          )}

          {/* Signup Role */}
          {showSignupFields && (
            <div className="mb-6">
              <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                I am a
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("consumer")}
                  className={`py-3 text-xs tracking-widest uppercase transition-colors ${
                    role === "consumer"
                      ? "bg-[#C88D00] text-white"
                      : "bg-white/60 text-neutral-700 hover:bg-white/80"
                  }`}
                >
                  Consumer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("restaurant")}
                  className={`py-3 text-xs tracking-widest uppercase transition-colors ${
                    role === "restaurant"
                      ? "bg-[#C88D00] text-white"
                      : "bg-white/60 text-neutral-700 hover:bg-white/80"
                  }`}
                >
                  Restaurant
                </button>
                <button
                  type="button"
                  onClick={() => setRole("charity")}
                  className={`py-3 text-xs tracking-widest uppercase transition-colors ${
                    role === "charity"
                      ? "bg-[#C88D00] text-white"
                      : "bg-white/60 text-neutral-700 hover:bg-white/80"
                  }`}
                >
                  Charity
                </button>
              </div>
            </div>
          )}

          {/* Signup Extra Fields */}
          {showSignupFields && (
            <>
              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-4 bg-white/60 border border-[#1A1A1A]/10 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Phone{" "}
                  <span className="ml-2 text-neutral-400 lowercase font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-4 bg-white/60 border border-[#1A1A1A]/10 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="Your Phone"
                />
              </div>
            </>
          )}

          {/* Signin/Signup Email + Password */}
          {showEmailPassword && (
            <>
              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white/60 border border-[#1A1A1A]/10 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white/60 border border-[#1A1A1A]/10 focus:outline-none focus:border-[#C88D00] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 text-sm bg-red-500/20 text-red-900">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 text-sm bg-[#C88D00]/20 text-[#1A1A1A]">
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full group relative overflow-hidden bg-[#C88D00] text-white py-5 text-sm tracking-widest uppercase disabled:opacity-50 transition-all duration-300 hover:shadow-xl"
          >
            <span className="relative z-10">
              {loading ? "LOADING..." : submitLabel}
            </span>
            <div className="absolute inset-0 bg-[#1A1A1A] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
          </button>

          {/* Footer actions */}
          <div className="mt-6 space-y-3 text-center">
            {mode !== "forgot" && (
              <button
                type="button"
                onClick={() =>
                  mode === "signin" ? goToSignUp() : goToSignIn()
                }
                className="text-sm text-neutral-600 hover:text-[#C88D00] transition-colors"
              >
                {mode === "signin"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            )}

            {mode === "signin" && (
              <button
                type="button"
                onClick={goToForgot}
                className="block w-full text-sm text-neutral-600 hover:text-[#C88D00] transition-colors"
              >
                Forgot password?
              </button>
            )}

            {mode === "forgot" && (
              <button
                type="button"
                onClick={goToSignIn}
                className="text-sm text-neutral-600 hover:text-[#C88D00] transition-colors"
              >
                Back to Sign in
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
