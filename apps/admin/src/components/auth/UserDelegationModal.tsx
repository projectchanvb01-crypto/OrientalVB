import React, { useState } from 'react';
import { X, UserPlus, Shield, ShieldCheck, Lock, Mail, Phone, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole, UserProfile, DelegateUserDto } from '@oriental/types';

interface UserDelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onDelegate: (dto: DelegateUserDto) => void;
}

export const UserDelegationModal: React.FC<UserDelegationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDelegate,
}) => {
  const [formData, setFormData] = useState<DelegateUserDto>({
    name: '',
    email: '',
    phone: '',
    role: UserRole.ADMIN_KASIR,
    password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  // Role hierarchy determination
  const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;
  const isManager = currentUser.role === UserRole.ADMIN_MANAGER;

  const allowedRoles = isSuperAdmin
    ? [
        {
          role: UserRole.ADMIN_MANAGER,
          label: 'Admin Manager',
          desc: 'Akses supervisi operasional, delegasi staf kasir/gudang, dan ringkasan ekosistem.',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        },
        {
          role: UserRole.ADMIN_KASIR,
          label: 'Admin Kasir POS',
          desc: 'Terisolasi ketat hanya pada kasir POS Retail. Tidak bisa melihat laporan keuangan SAK.',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          role: UserRole.STAFF_GUDANG,
          label: 'Staff Gudang / Logistik',
          desc: 'Akses penerimaan barang, stok multi-satuan, dan transfer barang antar gudang.',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
          role: UserRole.OPERATOR_WASTE,
          label: 'Operator Waste Supply',
          desc: 'Akses pencatatan setoran minyak jelantah & timbangan waste komersil.',
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        },
      ]
    : isManager
    ? [
        {
          role: UserRole.ADMIN_KASIR,
          label: 'Admin Kasir POS',
          desc: 'Terisolasi ketat hanya pada kasir POS Retail. Tidak bisa melihat laporan keuangan SAK.',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          role: UserRole.STAFF_GUDANG,
          label: 'Staff Gudang / Logistik',
          desc: 'Akses penerimaan barang, stok multi-satuan, dan transfer barang antar gudang.',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
          role: UserRole.OPERATOR_WASTE,
          label: 'Operator Waste Supply',
          desc: 'Akses pencatatan setoran minyak jelantah & timbangan waste komersil.',
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        },
      ]
    : [];

  const validate = () => {
    const err: { [key: string]: string } = {};
    if (!formData.name.trim()) err.name = 'Nama lengkap staf wajib diisi';
    if (!formData.email.trim() || !formData.email.includes('@')) err.email = 'Email tidak valid';
    if (!formData.phone.trim()) err.phone = 'No. WhatsApp/HP wajib diisi';
    if (!formData.password || formData.password.length < 6)
      err.password = 'Password minimal 6 karakter';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onDelegate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center text-indigo-400 border border-indigo-400/30">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-widest text-indigo-300 font-bold">
                  Hierarki Delegasi RBAC
                </span>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                  By {currentUser.name}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Delegasikan Akun Staf Baru
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delegator Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600">
            Pendelegasi: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})
          </span>
          <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold border border-indigo-200">
            Tenant: {currentUser.tenantId || 'Oriental Ecosystem'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Nama Lengkap Staf *
              </label>
              <input
                type="text"
                placeholder="Contoh: Siti Rahma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> No. WhatsApp / HP *
              </label>
              <input
                type="text"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs font-mono"
              />
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Alamat Email Login *
              </label>
              <input
                type="email"
                placeholder="staf.kasir@oriental.co.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs font-mono"
              />
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Kata Sandi Awal *
              </label>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs font-mono"
              />
              {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-600" /> Pilih Wewenang / Peran Staf *
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {allowedRoles.map((r) => {
                const isSelected = formData.role === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => setFormData({ ...formData, role: r.role })}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${r.badgeColor}`}>
                          {r.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">({r.role})</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
                    </div>
                    <div className="pt-0.5">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notice on Role Isolation */}
          {formData.role === UserRole.ADMIN_KASIR && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Isolasi Kasir Terverifikasi:</strong> Akun Admin Kasir yang didelegasikan tidak memiliki wewenang untuk melihat Laporan Keuangan SAK, Margin Laba, ataupun mendaftarkan member baru secara manual di kasir.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Delegasikan Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
