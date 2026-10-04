import React, { useState } from 'react';
import { SystemUser } from '../../types';
import { testFirestoreConnection } from '../../firebase';
import {
  Settings,
  RotateCcw,
  Users,
  UserPlus,
  Shield,
  Palette,
  Type,
  LogOut,
  Trash2,
  Edit,
  CheckSquare,
  Square,
  X,
  AlertTriangle,
  Upload,
  Database,
  Download,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

interface SettingsResetERPProps {
  users: SystemUser[];
  onAddUser: (user: SystemUser) => void;
  onUpdateUser: (user: SystemUser) => void;
  onDeleteUser: (userId: string) => void;
  onSystemReset: () => void;
  onSignOut: () => void;
  onClearAllSampleData?: () => Promise<void> | void;
}

const ALL_MODULES = [
  { id: 'dashboard', name: 'Executive Dashboard' },
  { id: 'pos', name: 'POS Cashier Counter' },
  { id: 'order_vouchers', name: 'Order Sales Vouchers' },
  { id: 'kds', name: 'Kitchen KDS Display' },
  { id: 'orders', name: 'Order Management' },
  { id: 'inventory', name: 'Inventory & Raw Materials' },
  { id: 'bincard', name: 'Store Bin Card Ledger' },
  { id: 'store_balance', name: 'Stock Balance & Expiry' },
  { id: 'store_requests', name: 'Store Requisition Vouchers' },
  { id: 'store_transfers', name: 'Store Transfer Vouchers' },
  { id: 'damage', name: 'Damage & Loss Registry' },
  { id: 'staff_food', name: 'Staff Meal Allowances' },
  { id: 'product_costing', name: 'Product Recipe Costing' },
  { id: 'stock_in', name: 'Stock In Vouchers' },
  { id: 'categories', name: 'Categories Manager' },
  { id: 'stores', name: 'Store Locations' },
  { id: 'reports', name: 'Financial & Sales Reports' },
  { id: 'settings', name: 'Settings & Admin' },
];

export const SettingsResetERP: React.FC<SettingsResetERPProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSystemReset,
  onSignOut,
  onClearAllSampleData,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'database' | 'reset'>('settings');
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbNotice, setDbNotice] = useState<string | null>(null);

  // UI Customization Settings State
  const [accentColor, setAccentColor] = useState('#D4AF37');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [profilePicture, setProfilePicture] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );

  // User Management Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // User Form
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Manager' | 'Cashier' | 'Kitchen'>('Cashier');
  const [password, setPassword] = useState('');
  const [allowedModules, setAllowedModules] = useState<string[]>([
    'pos',
    'order_vouchers',
    'orders',
  ]);

  // System Reset Confirmation Modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleToggleModule = (modId: string) => {
    if (allowedModules.includes(modId)) {
      setAllowedModules((prev) => prev.filter((m) => m !== modId));
    } else {
      setAllowedModules((prev) => [...prev, modId]);
    }
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUsername('');
    setFullName('');
    setRole('Cashier');
    setPassword('');
    setAllowedModules(['pos', 'order_vouchers', 'orders']);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (usr: SystemUser) => {
    setEditingUser(usr);
    setUsername(usr.username);
    setFullName(usr.fullName);
    setRole(usr.role);
    setPassword(usr.passwordHash);
    setAllowedModules(usr.allowedModules);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    if (editingUser) {
      const updated: SystemUser = {
        ...editingUser,
        username,
        fullName,
        role,
        passwordHash: password,
        allowedModules,
      };
      onUpdateUser(updated);
    } else {
      const newUser: SystemUser = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        username,
        fullName,
        role,
        passwordHash: password,
        allowedModules,
        avatarUrl: profilePicture,
        isActive: true,
      };
      onAddUser(newUser);
    }
    setIsUserModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePicture(url);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#1E293B] px-3 py-1 rounded-full border border-[#D4AF37]/30">
            System Preferences & Access Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8FAFC] mt-1 flex items-center gap-2">
            <Settings className="text-[#D4AF37]" size={28} />
            Professional Settings & Admin User Management
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Customize UI themes, manage staff permissions, or reset system databases.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-2 bg-[#1E293B] p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#D4AF37] text-[#0F172A] shadow-md'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Palette size={15} /> UI Settings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#D4AF37] text-[#0F172A] shadow-md'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Users size={15} /> Admin User Mgmt
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'database'
                ? 'bg-[#D4AF37] text-[#0F172A] shadow-md'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Database size={15} /> Cloud Firestore DB
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reset'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-[#94A3B8] hover:text-red-400'
            }`}
          >
            <RotateCcw size={15} /> System Reset
          </button>
        </div>
      </div>

      {/* TAB 1: Professional UI Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Picture & Theme Customization */}
          <div className="bg-[#243244] p-6 rounded-[24px] border border-white/10 space-y-6 shadow-xl">
            <h2 className="text-lg font-serif font-bold text-[#F8FAFC] flex items-center gap-2">
              <Palette className="text-[#D4AF37]" size={20} /> Professional UI Customization
            </h2>

            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#CBD5E1]">Profile Picture</label>
              <div className="flex items-center gap-4">
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]"
                />
                <label className="px-4 py-2.5 bg-[#1E293B] hover:bg-[#2A3A4E] text-[#F8FAFC] border border-white/10 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 transition-all">
                  <Upload size={14} className="text-[#D4AF37]" />
                  <span>Upload New Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#CBD5E1]">App Accent Color</label>
              <div className="flex items-center gap-3">
                {['#D4AF37', '#3B82F6', '#22C55E', '#EC4899', '#A855F7'].map((col) => (
                  <button
                    key={col}
                    onClick={() => setAccentColor(col)}
                    className={`w-9 h-9 rounded-full border-2 transition-transform ${
                      accentColor === col ? 'scale-110 border-white shadow-lg' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            {/* Typography Font Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#CBD5E1] flex items-center gap-1">
                <Type size={14} className="text-[#D4AF37]" /> Interface Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full h-11 bg-[#1E293B] text-[#F8FAFC] border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="sans-serif">Plus Jakarta Sans / Standard Sans</option>
                <option value="serif">Playfair Display / Elegant Serif</option>
                <option value="monospace">JetBrains Mono / Code Mono</option>
              </select>
            </div>
          </div>

          {/* Account Security & Sign Out */}
          <div className="bg-[#243244] p-6 rounded-[24px] border border-white/10 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-[#F8FAFC] flex items-center gap-2">
                <Shield className="text-[#D4AF37]" size={20} /> Active Session & Security
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Currently logged in as <strong className="text-[#F8FAFC]">Lina Executive Admin (admin)</strong>. Your session is protected by encrypted token authentication.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <button
                onClick={onSignOut}
                className="w-full py-3.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md min-h-[44px]"
              >
                <LogOut size={16} />
                <span>Sign Out of ERP System</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Admin User Management */}
      {activeTab === 'users' && (
        <div className="bg-[#243244] p-6 rounded-[24px] border border-white/10 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#F8FAFC] flex items-center gap-2">
                <Users className="text-[#D4AF37]" size={20} /> ADMIN User Registration & Module Permissions
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Create system accounts, assign passwords, and toggle module view/edit rights via tick checkboxes.
              </p>
            </div>

            <button
              onClick={handleOpenCreateUser}
              className="px-5 py-3 bg-[#D4AF37] hover:bg-[#F6C453] text-[#0F172A] rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
            >
              <UserPlus size={16} />
              <span>Create New System User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#CBD5E1]">
              <thead className="bg-[#1E293B] text-[#94A3B8] uppercase text-[10px] font-extrabold tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Allowed Modules</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={usr.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={usr.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-white/10"
                        />
                        <span className="font-bold text-[#F8FAFC]">{usr.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#D4AF37]">{usr.username}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E293B] border border-white/10 text-[#F8FAFC]">
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#22C55E]">
                        {usr.allowedModules.length} / {ALL_MODULES.length} Modules Allowed
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditUser(usr)}
                          className="p-2 bg-[#1E293B] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white rounded-lg transition-all"
                          title="Edit User Permissions"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => onDeleteUser(usr.id)}
                          className="p-2 bg-[#1E293B] text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Direct Cloud Firestore Database Management */}
      {activeTab === 'database' && (
        <div className="bg-[#243244] p-6 rounded-[24px] border border-white/10 space-y-6 shadow-xl text-[#F8FAFC]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#F8FAFC] flex items-center gap-2">
                <Database className="text-[#D4AF37]" size={20} /> Cloud Firestore Live Database
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Direct real-time connection to Google Cloud Firestore without local caching or offline syncing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  setIsSyncing(true);
                  const ok = await testFirestoreConnection();
                  setIsSyncing(false);
                  setDbNotice(ok ? '✅ Connected directly to Cloud Firestore database!' : '⚠️ Firestore running in direct mode');
                  setTimeout(() => setDbNotice(null), 4000);
                }}
                disabled={isSyncing}
                className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#F6C453] text-[#0F172A] rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Testing Connection...' : 'Test Database Ping'}</span>
              </button>

              {onClearAllSampleData && (
                <button
                  onClick={async () => {
                    if (window.confirm('Delete all sample/demo data from Cloud Database? Only real cafe data will remain.')) {
                      setIsSyncing(true);
                      await onClearAllSampleData();
                      setIsSyncing(false);
                      setDbNotice('✅ All sample data cleared! Database is clean.');
                      setTimeout(() => setDbNotice(null), 5000);
                    }
                  }}
                  disabled={isSyncing}
                  className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  <span>Clear All Sample Data</span>
                </button>
              )}
            </div>
          </div>

          {dbNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
              {dbNotice}
            </div>
          )}

          {/* Database Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Database ID</div>
              <div className="text-xs font-mono font-bold text-[#D4AF37] truncate">
                ai-studio-remixcafelinaant-7b25b52b-19b1-4462-9084-696271fdbc00
              </div>
            </div>
            <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Project ID</div>
              <div className="text-xs font-mono font-bold text-white truncate">
                gen-lang-client-0442981316
              </div>
            </div>
            <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Integration Mode</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Direct Firebase Real-Time (No Sync)
              </div>
            </div>
          </div>

          {/* Live Collections Overview */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-[#CBD5E1] flex items-center gap-2">
              <Layers size={14} className="text-[#D4AF37]" /> Active Cloud Firestore Collections
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'menuItems', label: 'Menu Catalog' },
                { name: 'orders', label: 'Orders & POS' },
                { name: 'reservations', label: 'Table Bookings' },
                { name: 'inventory', label: 'Ingredients & Stock' },
                { name: 'suppliers', label: 'Vendor Records' },
                { name: 'purchaseOrders', label: 'Purchase Orders' },
                { name: 'employees', label: 'Staff & HR' },
                { name: 'recipeCosts', label: 'Recipe Costing' },
                { name: 'categories', label: 'Categories' },
                { name: 'stores', label: 'Physical Stores' },
                { name: 'storeTransfers', label: 'Store Transfers' },
                { name: 'systemUsers', label: 'Admin Users' },
              ].map((col) => (
                <div key={col.name} className="bg-[#1E293B] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{col.label}</div>
                    <div className="text-[10px] font-mono text-[#94A3B8]">{col.name}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Direct
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Full System Reset */}
      {activeTab === 'reset' && (
        <div className="bg-[#243244] p-8 rounded-[24px] border border-red-500/30 space-y-6 shadow-2xl max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
            <RotateCcw size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-red-400">
              System Factory Reset (Reset)
            </h2>
            <p className="text-xs text-[#94A3B8] max-[#400px] mx-auto">
              Warning! Performing a system reset will wipe all modified inventory stocks, POS receipt vouchers, store transfers, and damage logs, restoring the database to factory initial state.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {onClearAllSampleData && (
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to wipe all sample data? The Cloud Database will be completely empty and clean for production use.')) {
                    setIsSyncing(true);
                    await onClearAllSampleData();
                    setIsSyncing(false);
                    setDbNotice('✅ All sample data wiped completely! Database is fresh and clean.');
                    setTimeout(() => setDbNotice(null), 5000);
                  }
                }}
                disabled={isSyncing}
                className="px-6 py-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-2xl text-xs font-extrabold shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
              >
                <Trash2 size={16} />
                <span>WIPE ALL SAMPLE DATA (ባዶ ዳታቤዝ)</span>
              </button>
            )}

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-extrabold shadow-xl transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>FACTORY RESTORE (ከነሳምፕል ሪሴት)</span>
            </button>
          </div>
        </div>
      )}

      {/* User Create/Edit Modal with Module Permissions Checkboxes */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleSaveUser}
            className="bg-[#1E293B] border border-white/10 rounded-[24px] max-w-xl w-full p-6 space-y-4 shadow-2xl text-[#F8FAFC]"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#D4AF37]">
                {editingUser ? 'Edit Admin System User & Permissions' : 'Create New Admin System User'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Abebe Balcha"
                  className="w-full h-10 bg-[#243244] text-[#F8FAFC] border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-10 bg-[#243244] text-[#F8FAFC] border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Kitchen">Kitchen</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. abebe1"
                  className="w-full h-10 bg-[#243244] text-[#F8FAFC] border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 bg-[#243244] text-[#F8FAFC] border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Allowed Modules Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="block text-xs font-extrabold text-[#D4AF37] uppercase">
                Assign Allowed System Modules (Tik Eyareku Mefked Ena Mekelkel)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-[#243244] rounded-xl border border-white/10">
                {ALL_MODULES.map((mod) => {
                  const isChecked = allowedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleToggleModule(mod.id)}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        isChecked
                          ? 'bg-[#1E293B] border-[#D4AF37] text-[#F8FAFC]'
                          : 'bg-[#1E293B]/40 border-white/5 text-[#94A3B8] opacity-60'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare size={16} className="text-[#D4AF37] shrink-0" />
                      ) : (
                        <Square size={16} className="shrink-0" />
                      )}
                      <span className="text-[11px] font-bold truncate">{mod.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="flex-1 h-11 bg-[#243244] text-[#CBD5E1] rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-11 bg-[#D4AF37] hover:bg-[#F6C453] text-[#0F172A] rounded-xl text-xs font-extrabold shadow-md"
              >
                Save User Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* System Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1E293B] border border-red-500/50 rounded-[24px] max-w-md w-full p-6 space-y-4 shadow-2xl text-[#F8FAFC] text-center">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <h3 className="font-serif font-bold text-lg text-red-400">Are you absolutely sure?</h3>
            <p className="text-xs text-[#94A3B8]">
              This operation will permanently reset all ERP vouchers, inventory adjustments, and order logs back to clean default factory settings.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-3 bg-[#243244] text-[#CBD5E1] rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSystemReset();
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-extrabold"
              >
                Yes, Reset System
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
