import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_USERS } from '../data/mockData';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onShowToast }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('petugas_farmasi');
  const [username, setUsername] = useState('rahmawati');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'petugas_farmasi') {
      setUsername('rahmawati');
      setPassword('farmasi123');
    } else {
      setUsername('hendra.direktur');
      setPassword('pimpinan123');
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = DEFAULT_USERS[selectedRole];
    onLogin(user);
    onShowToast(`Selamat datang kembali, ${user.name}!`, 'verified');
  };

  const handleQuickLogin = (role: UserRole) => {
    const user = DEFAULT_USERS[role];
    onLogin(user);
    onShowToast(`Masuk sebagai ${user.roleLabel}: ${user.name}`, 'verified');
  };

  const farmasiUser = DEFAULT_USERS['petugas_farmasi'];
  const pimpinanUser = DEFAULT_USERS['pimpinan_klinik'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-container-low to-surface-container-high/30 flex flex-col justify-between py-6 px-4 sm:px-6 antialiased">
      {/* Top Clinic Brand */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <img
            alt="Logo Klinik Pratama Jambu Mawar"
            className="h-10 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1WegnONWDeFyQjapLd4STUM-SSCGrzs84HvT17CBvVDHiI5BVRk3_yyjRcS8nama2FFeecSxFHszycrGAmxs9kb0BpfolO4TTjCd2KGS2aKkiUHLp1791LjowtR9JSxfjIUcetIbsw0v50O4KvFwe7v2HOKNqmTpamD6ep50he2Ye5e5S1CwFFa3zu0PPRI9orLeyGAwPQtlYMCsj5mN0ljT3M3wX0_XJqBLlosjTn2GerYQvsETsi7QK36"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg text-primary leading-tight">
              Klinik Jambu Mawar
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              Instalasi Farmasi &amp; Apotek Terakreditasi
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-surface-container shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="text-[11px] font-semibold text-on-surface">SIMRS Server Online (v2.4)</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-4xl mx-auto w-full my-auto py-4">
        <div className="bg-surface-container-lowest rounded-3xl shadow-xl border border-surface-container/70 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary via-primary-container to-tertiary p-6 sm:p-8 text-on-primary text-center sm:text-left relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-on-primary/15 text-on-primary text-[11px] font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                Portal Akses Kredensial Farmasi
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Pusat Masuk Pengguna Sistem
              </h1>
              <p className="text-xs sm:text-sm text-on-primary/90 mt-1 leading-relaxed">
                Silakan pilih jenis peran pengguna Anda (Petugas Farmasi atau Pimpinan Klinik) untuk
                melanjutkan pelayanan dan pengawasan mutu obat.
              </p>
            </div>

            {/* Soft glow background */}
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col gap-6">
            {/* 2 User Role Cards for Instant Access */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">group</span>
                  Pilih Salah Satu Pengguna Tersedia (2 Role Pengguna):
                </span>
                <span className="text-[11px] text-outline hidden sm:inline">
                  Klik kartu untuk memilih atau tombol masuk cepat
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Card 1: Petugas Farmasi */}
                <div
                  onClick={() => handleSelectRole('petugas_farmasi')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                    selectedRole === 'petugas_farmasi'
                      ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                      : 'border-surface-container bg-surface-container-low/40 hover:bg-surface-container-low hover:border-surface-container-high'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
                        {farmasiUser.avatarInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm sm:text-base text-on-surface truncate">
                            {farmasiUser.name}
                          </span>
                        </div>
                        <span className="text-xs text-primary font-bold">{farmasiUser.title}</span>
                        <span className="text-[11px] font-mono text-outline mt-0.5">
                          {farmasiUser.credentialNumber.split('|')[1]?.trim() || farmasiUser.credentialNumber}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedRole === 'petugas_farmasi'
                          ? 'border-primary bg-primary text-on-primary'
                          : 'border-outline'
                      }`}
                    >
                      {selectedRole === 'petugas_farmasi' && (
                        <span className="w-2 h-2 rounded-full bg-on-primary"></span>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-surface-container pt-3 text-xs">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Peran / Wewenang:</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[10px]">
                        Petugas Farmasi (Operasional)
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      Akses operasional penuh: Monitoring FEFO, penerimaan PBF, dispensing resep,
                      karantina fisik, dan mutasi kartu stok.
                    </p>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin('petugas_farmasi');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Masuk Sebagai Petugas Farmasi</span>
                    </button>
                  </div>
                </div>

                {/* User Card 2: Pimpinan Klinik */}
                <div
                  onClick={() => handleSelectRole('pimpinan_klinik')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                    selectedRole === 'pimpinan_klinik'
                      ? 'border-tertiary bg-tertiary/5 shadow-md ring-2 ring-tertiary/20'
                      : 'border-surface-container bg-surface-container-low/40 hover:bg-surface-container-low hover:border-surface-container-high'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
                        {pimpinanUser.avatarInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm sm:text-base text-on-surface truncate">
                            {pimpinanUser.name}
                          </span>
                        </div>
                        <span className="text-xs text-tertiary font-bold">{pimpinanUser.title}</span>
                        <span className="text-[11px] font-mono text-outline mt-0.5">
                          {pimpinanUser.credentialNumber.split('|')[0]?.trim()}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedRole === 'pimpinan_klinik'
                          ? 'border-tertiary bg-tertiary text-on-tertiary'
                          : 'border-outline'
                      }`}
                    >
                      {selectedRole === 'pimpinan_klinik' && (
                        <span className="w-2 h-2 rounded-full bg-on-tertiary"></span>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-surface-container pt-3 text-xs">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Peran / Wewenang:</span>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                        Pimpinan Klinik (Eksekutif)
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      Akses manajerial &amp; legalitas: Otorisasi pemusnahan obat, evaluasi rugi ED,
                      audit SIPNAP, dan ringkasan keuangan pengadaan.
                    </p>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin('pimpinan_klinik');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-tertiary text-on-tertiary hover:bg-tertiary-container font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Masuk Sebagai Pimpinan Klinik</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-surface-container w-full"></div>
              <span className="bg-surface-container-lowest px-3 text-xs text-outline font-medium uppercase">
                Atau Masuk Menggunakan Akun Terpilih
              </span>
            </div>

            {/* Manual Form Confirmation */}
            <form onSubmit={handleManualLogin} className="flex flex-col gap-4 max-w-lg mx-auto w-full">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Nama Pengguna / ID Karyawan</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                    account_circle
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-surface-container-low rounded-xl text-on-surface text-xs sm:text-sm font-medium border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-on-surface">Kata Sandi Keamanan</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-10 bg-surface-container-low rounded-xl text-on-surface text-xs sm:text-sm font-mono border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-primary focus:ring-primary accent-primary"
                  />
                  <span className="text-on-surface-variant font-medium">Ingat saya di perangkat ini</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onShowToast('Hubungi Administrator SIMRS untuk reset kredensial.', 'info');
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Lupa kata sandi?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>Masuk ke Dashboard ({DEFAULT_USERS[selectedRole].roleLabel})</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Regulatory Trust Strip */}
      <div className="max-w-4xl mx-auto w-full pt-4 text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-outline border-t border-surface-container/60">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          Kepatuhan Farmasi Terakreditasi Standar Permenkes No. 73/2016 &amp; BPOM
        </span>
        <span className="font-mono text-[11px]">
          &copy; 2024 Instalasi Farmasi Klinik Pratama Jambu Mawar
        </span>
      </div>
    </div>
  );
};
