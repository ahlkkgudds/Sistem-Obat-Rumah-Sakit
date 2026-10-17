import React from 'react';
import { ScreenId } from '../types';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  expiredCount: number;
  roomTemp: number;
  chillerTemp: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  mobileOpen,
  onCloseMobile,
  expiredCount,
  roomTemp,
  chillerTemp,
}) => {
  const navItems: { id: ScreenId; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard / Ikhtisar', icon: 'dashboard' },
    { id: 'manajemen-stok-obat', label: 'Manajemen Stok & Rak', icon: 'medication' },
    {
      id: 'monitoring-kedaluwarsa',
      label: 'Monitoring Kedaluwarsa',
      icon: 'event_busy',
      badge: expiredCount,
    },
    { id: 'penerimaan-pengadaan', label: 'Penerimaan & Pengadaan', icon: 'local_shipping' },
    { id: 'pengeluaran-resep', label: 'Pengeluaran & Resep', icon: 'receipt_long' },
    { id: 'kartu-stok-audit', label: 'Kartu Stok & Audit Opname', icon: 'fact_check' },
    { id: 'laporan-pemusnahan', label: 'Laporan & Berita Acara', icon: 'description' },
    { id: 'pengaturan-sistem', label: 'Pengaturan Sistem', icon: 'settings' },
  ];

  const handleNavClick = (id: ScreenId) => {
    onSelectScreen(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col">
        {/* Clinic Branding Header */}
        <div className="h-16 px-4 flex items-center justify-between gap-3 bg-surface-container-low border-b border-surface-container/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              alt="Logo Klinik Pratama Jambu Mawar"
              className="h-8 w-auto object-contain flex-shrink-0"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WegnONWDeFyQjapLd4STUM-SSCGrzs84HvT17CBvVDHiI5BVRk3_yyjRcS8nama2FFeecSxFHszycrGAmxs9kb0BpfolO4TTjCd2KGS2aKkiUHLp1791LjowtR9JSxfjIUcetIbsw0v50O4KvFwe7v2HOKNqmTpamD6ep50he2Ye5e5S1CwFFa3zu0PPRI9orLeyGAwPQtlYMCsj5mN0ljT3M3wX0_XJqBLlosjTn2GerYQvsETsi7QK36"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-primary truncate leading-tight">
                Klinik Jambu Mawar
              </span>
              <span className="text-[11px] text-on-surface-variant truncate">
                Instalasi Farmasi &amp; Apotek
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
            aria-label="Tutup navigasi"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation Category Label */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold text-outline uppercase tracking-wider px-1">
            Navigasi Utama
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left text-sm font-medium ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'text-on-primary-container' : 'text-outline group-hover:text-primary'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Warehouse Temperature Sensor Card */}
      <div className="p-3.5 bg-surface-container-low mx-3 mb-4 rounded-xl flex flex-col gap-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-surface-container/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-primary">thermostat</span>
            Sensor Suhu Gudang
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
        </div>

        <div className="flex items-center justify-between bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-surface-container/40">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant">Ruang Apotek</span>
            <span className="text-[11px] text-secondary font-semibold">Status Aman</span>
          </div>
          <span className="font-mono text-xs font-bold text-on-surface">{roomTemp}°C</span>
        </div>

        <div className="flex items-center justify-between bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-surface-container/40">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant">Chiller Vaksin</span>
            <span className="text-[11px] text-secondary font-semibold">Status Aman</span>
          </div>
          <span className="font-mono text-xs font-bold text-on-surface">{chillerTemp}°C</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 border-r border-surface-container">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-surface-container-lowest shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
