import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const verifyPin = useMutation(api.menu.verifyPin);

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    setError('');

    try {
      const isCorrect = await verifyPin({ pin });
      if (isCorrect) {
        localStorage.setItem("adminAuthenticated", "true");
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError('Incorrect PIN. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin('');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-creamy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-red/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-brand-red/5 blur-3xl" />
      </div>

      <div className={`w-full max-w-[400px] bg-white rounded-3xl shadow-xl border border-surface-variant p-8 relative ${shake ? 'animate-shake' : ''}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-brand-red rounded-b-full" />

        <div className="text-center mb-8 pt-2">
          <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-brand-red">restaurant_menu</span>
          </div>
          <h1 className="font-headline-md text-2xl uppercase text-on-background tracking-wide">Admin Panel</h1>
          <p className="text-secondary text-sm mt-1 font-body-md">Enter your PIN to manage the menu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                className="w-full text-center text-2xl tracking-[0.3em] p-4 border-2 border-surface-variant rounded-xl bg-surface-bright focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all text-on-background font-headline-md"
                autoFocus
                maxLength={10}
                disabled={loading}
              />
            </div>
            {error && (
              <div className="flex items-center justify-center gap-1.5 text-error text-sm mt-3 font-label-bold bg-error-container py-2.5 px-4 rounded-lg">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full bg-brand-red text-white font-label-bold py-4 rounded-xl hover:bg-brand-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide flex items-center justify-center gap-2 shadow-sm shadow-brand-red/20 active:scale-[0.98]"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <a href="/" className="text-secondary text-sm hover:text-brand-red transition-colors font-label-bold inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Return to Menu
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
