import { useEffect, useMemo, useState } from "react";
import { authHelpers } from "../lib/helpers/api";

export function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return newPassword.length >= 8 && newPassword === confirm;
  }, [newPassword, confirm]);

  useEffect(() => {
    const { data: listener } = authHelpers.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
          setMsg(null);
        }

        // In some cases reset flow results in SIGNED_IN with a session
        if (event === "SIGNED_IN" && session) {
          setReady(true);
        }
      },
    );

    (async () => {
      const { data, error } = await authHelpers.getSession();
      if (!error && data?.session) setReady(true);
    })();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!canSubmit) {
      setMsg("Passwords must match and be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authHelpers.updatePassword(newPassword);
      if (error) throw error;

    
      await authHelpers.signOut();

      setMsg("Password updated successfully. You can now sign in.");
      setNewPassword("");
      setConfirm("");
    } catch (err: any) {
      setMsg(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-black/10 p-8">
        <h1 className="text-3xl tracking-tighter mb-2 text-[#1A1A1A]">
          Reset Password
        </h1>
        <p className="text-sm text-neutral-600 mb-6">
          Choose a new password for your account.
        </p>

        {!ready ? (
          <div className="text-sm text-neutral-600">
            Open the reset link from your email to continue.
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-2">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] mb-4"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />

            <label className="block text-xs tracking-widest uppercase text-neutral-600 mb-2">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 focus:outline-none focus:border-[#C88D00] mb-6"
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />

            {msg && (
              <div className="mb-5 p-3 text-sm bg-[#C88D00]/15 text-[#1A1A1A] border border-[#C88D00]/25">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full bg-[#C88D00] text-white py-3 text-sm tracking-widest uppercase hover:bg-[#B07D00] disabled:opacity-60 transition-colors"
            >
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
