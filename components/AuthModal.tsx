import React, { useState } from 'react';
import { X, Lock, User, Key, ShieldCheck, AlertCircle, Sparkles, Globe } from 'lucide-react';
import { SystemUser, UserRole } from '../types';
import { signInWithGoogle } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: UserRole;
  systemUsers: SystemUser[];
  onLoginSuccess: (user: SystemUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  systemUsers,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const gUser = await signInWithGoogle();
      if (gUser) {
        const assignedRole: 'Admin' | 'Manager' | 'Cashier' | 'Kitchen' =
          targetRole === 'Manager' || targetRole === 'Cashier' || targetRole === 'Kitchen'
            ? targetRole
            : gUser.email?.includes('admin')
            ? 'Admin'
            : 'Cashier';

        const sysUser: SystemUser = {
          id: gUser.uid,
          username: gUser.email?.split('@')[0] || 'google_user',
          fullName: gUser.displayName || gUser.email?.split('@')[0] || 'Google User',
          role: assignedRole,
          passwordHash: '',
          allowedModules: assignedRole === 'Admin' ? ['all'] : ['pos', 'orders'],
          isActive: true,
        };
        onLoginSuccess(sysUser);
        onClose();
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google authentication failed');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim().toLowerCase();
    const foundUser = systemUsers.find(
      (u) => u.username.toLowerCase() === trimmedUsername && u.isActive
    );

    if (!foundUser) {
      setError('Invalid username or account inactive. Please check your credentials.');
      return;
    }

    if (foundUser.passwordHash !== password) {
      setError('Incorrect password. Please try again.');
      return;
    }

    // Success!
    onLoginSuccess(foundUser);
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  };

  const fillPreset = (role: UserRole) => {
    const user = systemUsers.find((u) => u.role === role);
    if (user) {
      setUsername(user.username);
      setPassword(user.passwordHash);
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#181818] border border-[#D4AF37]/30 rounded-3xl shadow-2xl overflow-hidden p-6 text-[#FDF5E6]">
        {/* Header close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#6B1D1D]/40 border border-[#D4AF37]/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#D4AF37] shadow-lg">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-[#FDF5E6]">
            Staff Authentication (Sgeba Login)
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {targetRole
              ? `Please enter credentials to switch to ${targetRole} View.`
              : 'Enter system username & password to access ERP system.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-red-200 text-xs">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#D4AF37] mb-1 flex items-center gap-1.5">
              <User size={13} /> Username (Tename)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. admin, manager1, cashier1, kitchen1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-11 bg-[#222222] text-[#FDF5E6] border border-white/10 rounded-xl px-3.5 text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#D4AF37] mb-1 flex items-center gap-1.5">
              <Key size={13} /> Password (Paswerd)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 bg-[#222222] text-[#FDF5E6] border border-white/10 rounded-xl px-3.5 pr-12 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 hover:text-[#D4AF37] font-semibold"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#6B1D1D] hover:bg-[#521515] text-[#FDF5E6] border border-[#D4AF37]/40 rounded-xl text-xs font-bold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 uppercase mt-2"
          >
            <ShieldCheck size={16} className="text-[#D4AF37]" />
            <span>Authenticate & Access (Sgeba)</span>
          </button>

          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <span className="relative px-2 bg-[#1A1A1A] text-[10px] text-gray-400 font-semibold tracking-wider uppercase">or sign in with</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
            className="w-full h-11 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-xs font-bold tracking-wide transition-all shadow flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign In with Google (Cloud Sync)'}</span>
          </button>
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2">
            <Sparkles size={12} className="text-[#D4AF37]" />
            <span>Quick Login Presets (For Testing):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => fillPreset('Admin')}
              className="p-2 bg-[#222222] hover:bg-[#2e2e2e] border border-white/10 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-[#D4AF37]">Admin</div>
              <div className="text-gray-400 font-mono">admin / admin123</div>
            </button>
            <button
              type="button"
              onClick={() => fillPreset('Manager')}
              className="p-2 bg-[#222222] hover:bg-[#2e2e2e] border border-white/10 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-[#D4AF37]">Manager</div>
              <div className="text-gray-400 font-mono">manager1 / manager123</div>
            </button>
            <button
              type="button"
              onClick={() => fillPreset('Cashier')}
              className="p-2 bg-[#222222] hover:bg-[#2e2e2e] border border-white/10 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-[#D4AF37]">Cashier</div>
              <div className="text-gray-400 font-mono">cashier1 / cashier123</div>
            </button>
            <button
              type="button"
              onClick={() => fillPreset('Kitchen')}
              className="p-2 bg-[#222222] hover:bg-[#2e2e2e] border border-white/10 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-[#D4AF37]">Kitchen</div>
              <div className="text-gray-400 font-mono">kitchen1 / kitchen123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
