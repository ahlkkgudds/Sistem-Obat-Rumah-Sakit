import React, { useState, useEffect, useRef } from 'react';
import { BatchItem } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  batches: BatchItem[];
  onSelectBatchItem?: (batch: BatchItem) => void;
  onNavigateToScreen: (screen: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  batches,
  onNavigateToScreen,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('24 Okt 2024, 09:41 WIB');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      const formatted = new Intl.DateTimeFormat('id-ID', options).format(now);
      setCurrentTime(`${formatted} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to focus search
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const urgentBatches = batches.filter((b) => b.status === 'expired' || b.status === 'critical');

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 flex items-center justify-between px-4 lg:px-6 border-b border-surface-container/60">
      {/* Left: Mobile hamburger & search input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Buka menu samping"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kode obat, nama generik, atau nomor batch... (Tekan /)"
            className="w-full h-10 pl-10 pr-9 bg-surface-container-low rounded-xl text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Real-time info, notification, APJ profile */}
      <div className="flex items-center gap-2 sm:gap-4 ml-2">
        {/* Real-time Badge */}
        <div className="hidden xl:flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface-variant border border-surface-container/50">
          <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
          <span className="font-mono text-xs font-medium">Real-time: {currentTime}</span>
        </div>

        {/* Expiry Alert Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Peringatan Kedaluwarsa"
            className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-error text-on-error text-[10px] font-bold">
              {urgentBatches.length || 12}
            </span>
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-container">
                <div className="flex items-center gap-1.5 text-error font-semibold text-xs sm:text-sm">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>Peringatan Batch Kritis &amp; ED</span>
                </div>
                <span className="bg-error/10 text-error text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {urgentBatches.length} Perlu Tindakan
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {urgentBatches.slice(0, 5).map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigateToScreen('monitoring-kedaluwarsa');
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors text-left flex items-start gap-2.5 ${
                      batch.status === 'expired'
                        ? 'bg-error-container/30 hover:bg-error-container/50 border border-error-container'
                        : 'bg-surface-container-low hover:bg-surface-container border border-surface-container'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${
                        batch.status === 'expired' ? 'text-error' : 'text-tertiary'
                      }`}
                    >
                      {batch.status === 'expired' ? 'dangerous' : 'hourglass_bottom'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-on-surface truncate">
                          {batch.drugName}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            batch.status === 'expired'
                              ? 'bg-error text-on-error'
                              : 'bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {batch.remainingText}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-on-surface-variant">
                        <span className="font-mono text-outline">{batch.batchNumber}</span>
                        <span className="font-semibold text-primary">{batch.recommendation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-surface-container flex justify-between items-center">
                <span className="text-[11px] text-outline">SOP Karantina Fisik H-0</span>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigateToScreen('monitoring-kedaluwarsa');
                  }}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Buka Monitoring FEFO &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* APJ Pharmacist Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-1.5 bg-surface-container-low py-1 pr-2.5 sm:pr-3.5 rounded-full hover:bg-surface-container transition-all border border-surface-container/60"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-on-surface leading-tight">
                apt. Rahmawati, S.Farm
              </span>
              <span className="text-[10px] text-on-surface-variant leading-none">
                Apoteker Penanggung Jawab
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline hidden sm:inline">
              expand_more
            </span>
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-surface-container">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                  AR
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-on-surface truncate">
                    apt. Rahmawati, S.Farm
                  </span>
                  <span className="text-[11px] text-primary font-semibold">
                    APJ Utama Instalasi Farmasi
                  </span>
                </div>
              </div>

              <div className="py-2.5 flex flex-col gap-1.5 text-xs text-on-surface-variant">
                <div className="flex justify-between">
                  <span className="text-outline">Nomor STRA:</span>
                  <span className="font-mono font-medium text-on-surface">19890412/STRA/16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Nomor SIPA:</span>
                  <span className="font-mono font-medium text-on-surface">19920814/SIPA/21</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Masa Berlaku SIPA:</span>
                  <span className="text-secondary font-medium">14 Februari 2027</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Shift Saat Ini:</span>
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Pagi (07:00 - 15:00)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-container flex flex-col gap-1">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    onNavigateToScreen('pengaturan-sistem');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-surface-container text-on-surface font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline">settings</span>
                  Pengaturan Profil &amp; Klinik
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
