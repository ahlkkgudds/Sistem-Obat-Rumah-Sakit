import React, { useState } from 'react';
import { BatchItem, DrugItem, ScreenId, UserProfile } from '../types';

interface DashboardViewProps {
  batches: BatchItem[];
  drugs: DrugItem[];
  onNavigate: (screen: ScreenId) => void;
  onOpenAddDrugModal: () => void;
  onOpenQuarantineModal: (batch?: BatchItem) => void;
  onShowToast: (message: string, icon?: string) => void;
  currentUser?: UserProfile;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  batches,
  drugs,
  onNavigate,
  onOpenAddDrugModal,
  onOpenQuarantineModal,
  onShowToast,
  currentUser,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'expired' | '30days' | '60days'>('all');
  const [selectedChartDay, setSelectedChartDay] = useState<string>('Hari ini');

  const isPimpinan = currentUser?.role === 'pimpinan_klinik';

  const expiredBatches = batches.filter((b) => b.status === 'expired');
  const criticalBatches = batches.filter((b) => b.status === 'critical');
  const warningBatches = batches.filter((b) => b.status === 'warning');

  // Filter emergency items
  const emergencyItems = batches.filter((b) => {
    if (filterMode === 'expired') return b.status === 'expired';
    if (filterMode === '30days') return b.status === 'critical';
    if (filterMode === '60days') return b.status === 'warning';
    return b.status === 'expired' || b.status === 'critical' || b.status === 'warning';
  });

  const chartDays = [
    { day: 'Sen', fast: 78, slow: 30, fastUnits: '312 unit', slowUnits: '62 unit' },
    { day: 'Sel', fast: 90, slow: 25, fastUnits: '360 unit', slowUnits: '50 unit' },
    { day: 'Rab', fast: 84, slow: 42, fastUnits: '335 unit', slowUnits: '84 unit' },
    { day: 'Kam', fast: 98, slow: 35, fastUnits: '395 unit', slowUnits: '70 unit' },
    { day: 'Jum', fast: 72, slow: 20, fastUnits: '290 unit', slowUnits: '40 unit' },
    { day: 'Sab', fast: 60, slow: 18, fastUnits: '240 unit', slowUnits: '35 unit' },
    { day: 'Hari ini', fast: 45, slow: 15, fastUnits: '180 unit (s/d 09:40)', slowUnits: '28 unit', isToday: true },
  ];

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isPimpinan ? 'bg-tertiary text-on-tertiary' : 'bg-primary-fixed text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[28px]">
              {isPimpinan ? 'admin_panel_settings' : 'local_pharmacy'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-lg sm:text-xl text-on-surface">
                {isPimpinan
                  ? `Selamat Datang, ${currentUser?.name || 'dr. Hendra Wijaya, Sp.PK'}`
                  : `Selamat Pagi, ${currentUser?.name || 'apt. Rahmawati, S.Farm'}`}
              </h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm ${
                  isPimpinan
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                    : 'bg-secondary-container text-on-secondary-container'
                }`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${
                    isPimpinan ? 'bg-tertiary' : 'bg-secondary'
                  }`}
                ></span>
                {isPimpinan ? 'Pimpinan Klinik & Pengawas' : 'Shift Pagi Aktif'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 leading-relaxed">
              {isPimpinan
                ? `Portal pengawasan eksekutif. Pantau efisiensi buffer stock, nilai perputaran FEFO, dan otorisasi berita acara pemusnahan obat kedaluwarsa.`
                : `Sistem FEFO aktif. Periksa ${expiredBatches.length} batch obat yang telah dikunci otomatis sebelum pelayanan resep poliklinik dimulai.`}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
          <div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-xl text-on-surface-variant border border-surface-container/60 shadow-sm text-xs sm:text-sm">
            <span className="material-symbols-outlined text-[18px] text-outline mr-1.5">
              calendar_month
            </span>
            <span className="font-semibold text-on-surface">Bulan Berjalan (Okt 2024)</span>
          </div>

          {isPimpinan ? (
            <>
              <button
                onClick={() => onNavigate('laporan-pemusnahan')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-tertiary text-on-tertiary hover:bg-tertiary-container font-semibold text-xs sm:text-sm transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Otorisasi Berita Acara</span>
              </button>
              <button
                onClick={() => onShowToast('Mengunduh Laporan Audit Kepatuhan BPOM & SIK...', 'download')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Cetak Laporan Manajerial</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onShowToast('Mencetak Laporan Konsolidasi Bulanan Farmasi...', 'print')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Cetak Laporan Bulanan</span>
              </button>
              <button
                onClick={onOpenAddDrugModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs sm:text-sm transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Tambah Obat Baru</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Executive Director Oversight Bento (when logged in as Pimpinan Klinik) */}
      {isPimpinan && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-tertiary/10 via-surface-container-low to-surface-container-lowest border border-tertiary/30 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">query_stats</span>
            </div>
            <div>
              <span className="text-xs font-bold text-tertiary uppercase tracking-wider block">
                Ringkasan Eksekutif Mutu Farmasi &amp; Keuangan
              </span>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Kepatuhan Pengeluaran FEFO: <strong className="text-secondary">99.4%</strong> &bull; Total
                Nilai Persediaan Farmasi: <strong className="text-on-surface">Rp 148.920.000</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="bg-error-container text-on-error-container text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <span className="material-symbols-outlined text-[15px]">assignment_late</span>
              2 Berita Acara Menunggu Pengesahan Anda
            </span>
            <button
              onClick={() => onNavigate('laporan-pemusnahan')}
              className="text-xs text-tertiary font-bold hover:underline ml-1"
            >
              Tinjau Dokumen &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Urgent Lock Alert Banner */}
      <div className="bg-gradient-to-r from-error-container via-surface-container-lowest to-surface-container-low p-4 sm:p-5 rounded-2xl shadow-sm border border-error-container flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-md animate-bounce">
            <span className="material-symbols-outlined text-[24px]">lock_clock</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-error font-bold tracking-wide uppercase">
                Peringatan Kritis Karantina Otomatis
              </span>
              <span className="bg-error text-on-error font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                SISTEM KUNCI AKTIF
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface mt-1 leading-relaxed">
              Terdapat <strong className="text-error font-semibold">3 batch obat kedaluwarsa</strong> di{' '}
              <strong>Rak B-02</strong> &amp; <strong>Kulkas Farmasi</strong> yang telah dikunci
              otomatis dari pengeluaran e-resep. Segera buat Berita Acara Pemusnahan atau
              koordinasikan Retur PBF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => {
              setFilterMode('expired');
              const el = document.getElementById('tabel-darurat');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-error text-on-error font-semibold text-xs sm:text-sm hover:bg-error/90 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span>Lihat 3 Batch Terkunci</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total SKU Aktif */}
        <div
          onClick={() => onNavigate('manajemen-stok-obat')}
          className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </span>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Total Item Obat
              </span>
            </div>
            <span className="bg-secondary-container text-on-secondary-container text-[11px] px-2 py-0.5 rounded-full font-bold">
              +4.2% bln lalu
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-on-surface">482</span>
              <span className="text-sm text-on-surface-variant font-medium">SKU</span>
            </div>
            <p className="text-xs text-outline mt-1 flex items-center gap-1">
              <span className="font-mono text-primary font-semibold">38.450 unit</span> stok fisik aktif di gudang
            </p>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>

        {/* Card 2: Mendekati ED (<60 Hari) */}
        <div
          onClick={() => onNavigate('monitoring-kedaluwarsa')}
          className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md hover:border-tertiary/40 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-tertiary-container">
                <span className="material-symbols-outlined text-[20px]">warning_amber</span>
              </span>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Mendekati ED &lt;60 Hari
              </span>
            </div>
            <span className="bg-surface-variant text-on-surface-variant text-[11px] px-2 py-0.5 rounded-full font-bold">
              FEFO Alert
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-tertiary-container">14</span>
              <span className="text-sm text-on-surface-variant font-medium">Batch</span>
            </div>
            <p className="text-xs text-outline mt-1">
              Segera koordinasikan retur atau dorong peresepan FEFO
            </p>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-tertiary-container h-full rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        {/* Card 3: Sudah Kedaluwarsa */}
        <div
          onClick={() => onNavigate('monitoring-kedaluwarsa')}
          className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-error-container/60 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]">block</span>
              </span>
              <span className="text-xs font-bold text-error uppercase tracking-wider">
                Sudah Kedaluwarsa
              </span>
            </div>
            <span className="bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              WAJIB KUNCI
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-error">3</span>
              <span className="text-sm text-on-surface-variant font-medium">Item Batch</span>
            </div>
            <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">lock</span> Telah
              dinonaktifkan dari dispenser resep
            </p>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Card 4: Stok Kritis / Minimum */}
        <div
          onClick={() => onNavigate('manajemen-stok-obat')}
          className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[20px]">production_quantity_limits</span>
              </span>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Stok Kritis / Min
              </span>
            </div>
            <span className="bg-error-container text-on-error-container text-[11px] px-2 py-0.5 rounded-full font-bold">
              Re-order Segera
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-on-surface">9</span>
              <span className="text-sm text-on-surface-variant font-medium">Item</span>
            </div>
            <p className="text-xs text-outline mt-1">
              Di bawah safety stock (&lt;10 strip/botol), buat draft PO
            </p>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary-container h-full rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Trend Distribusi 7 Hari */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-base sm:text-lg text-on-surface">
                    Tren Distribusi &amp; Pengeluaran Obat 7 Hari Terakhir
                  </h2>
                  <span className="bg-surface-container-low text-primary text-xs font-semibold px-2 py-0.5 rounded-md">
                    Fast vs Slow Moving
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Memantau pola peresepan harian untuk akurasi persediaan buffer stock poliklinik umum &amp; gigi.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant font-medium">
                  <span className="w-3 h-3 rounded-sm bg-primary"></span> Fast Moving
                </span>
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant font-medium">
                  <span className="w-3 h-3 rounded-sm bg-outline-variant"></span> Slow Moving
                </span>
              </div>
            </div>

            {/* Interactive SVG / Bar Matrix */}
            <div className="bg-surface-container-low p-4 rounded-xl mb-4 border border-surface-container/50">
              <div className="flex items-end justify-between h-44 gap-2 pt-4 px-2">
                {chartDays.map((c) => (
                  <div
                    key={c.day}
                    onClick={() => {
                      setSelectedChartDay(c.day);
                      onShowToast(`Data ${c.day}: Fast ${c.fastUnits}, Slow ${c.slowUnits}`, 'bar_chart');
                    }}
                    className={`flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer rounded-lg p-1 transition-all ${
                      selectedChartDay === c.day ? 'bg-surface-container-lowest shadow-sm ring-1 ring-primary' : 'hover:bg-surface-container-lowest/40'
                    }`}
                  >
                    <div className="w-full max-w-[36px] flex items-end gap-1 h-32">
                      <div
                        className="bg-primary rounded-t-sm w-1/2 transition-all group-hover:brightness-110"
                        style={{ height: `${c.fast}%` }}
                        title={`Fast: ${c.fastUnits}`}
                      ></div>
                      <div
                        className="bg-outline-variant rounded-t-sm w-1/2 transition-all"
                        style={{ height: `${c.slow}%` }}
                        title={`Slow: ${c.slowUnits}`}
                      ></div>
                    </div>
                    <span
                      className={`font-mono text-[11px] ${
                        c.isToday ? 'text-primary font-bold' : 'text-on-surface-variant font-medium'
                      }`}
                    >
                      {c.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Key Monitored Drug Items List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 pt-1">
              {/* Item 1 */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary font-bold">Fast</span>
                    <span className="font-mono text-[11px] text-secondary font-semibold">&uarr; 18%</span>
                  </div>
                  <p className="font-semibold text-xs text-on-surface truncate mt-1">Paracetamol 500mg</p>
                  <p className="text-[11px] text-outline">Tablet &bull; Strip</p>
                </div>
                <div className="mt-2 text-right">
                  <span className="font-mono text-sm font-bold text-on-surface">1.240</span>
                  <span className="text-[10px] text-outline block">terserap / 7 hari</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary font-bold">Fast</span>
                    <span className="font-mono text-[11px] text-secondary font-semibold">&uarr; 12%</span>
                  </div>
                  <p className="font-semibold text-xs text-on-surface truncate mt-1">Amoxicillin 500mg</p>
                  <p className="text-[11px] text-outline">Kaplet &bull; Box</p>
                </div>
                <div className="mt-2 text-right">
                  <span className="font-mono text-sm font-bold text-on-surface">890</span>
                  <span className="text-[10px] text-outline block">terserap / 7 hari</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary font-bold">Fast</span>
                    <span className="font-mono text-[11px] text-on-surface-variant font-semibold">&rarr; Stabil</span>
                  </div>
                  <p className="font-semibold text-xs text-on-surface truncate mt-1">Cetirizine 10mg</p>
                  <p className="text-[11px] text-outline">Kapsul &bull; Strip</p>
                </div>
                <div className="mt-2 text-right">
                  <span className="font-mono text-sm font-bold text-on-surface">620</span>
                  <span className="text-[10px] text-outline block">terserap / 7 hari</span>
                </div>
              </div>

              {/* Item 4 */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant font-medium">Regular</span>
                    <span className="font-mono text-[11px] text-secondary font-semibold">&uarr; 5%</span>
                  </div>
                  <p className="font-semibold text-xs text-on-surface truncate mt-1">Metformin 500mg</p>
                  <p className="text-[11px] text-outline">Tablet Kronis</p>
                </div>
                <div className="mt-2 text-right">
                  <span className="font-mono text-sm font-bold text-on-surface">510</span>
                  <span className="text-[10px] text-outline block">terserap / 7 hari</span>
                </div>
              </div>

              {/* Item 5 */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-outline font-medium">Slow</span>
                    <span className="font-mono text-[11px] text-error font-semibold">&darr; 9%</span>
                  </div>
                  <p className="font-semibold text-xs text-on-surface truncate mt-1">Omeprazole 20mg</p>
                  <p className="text-[11px] text-outline">Kapsul Salut</p>
                </div>
                <div className="mt-2 text-right">
                  <span className="font-mono text-sm font-bold text-on-surface">195</span>
                  <span className="text-[10px] text-outline block">terserap / 7 hari</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer tip */}
          <div className="mt-4 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-surface-container text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              Stok Amoxicillin 500mg mendekati ambang batas pemesanan ulang (tersisa 3 box)
            </span>
            <button
              onClick={() => onNavigate('penerimaan-pengadaan')}
              className="text-xs text-primary font-bold hover:underline"
            >
              Kelola Buffer Stock &rarr;
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Prioritas FEFO Hari Ini */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="font-bold text-base text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">sort</span>
                  Prioritas FEFO Hari Ini
                </span>
                <span className="text-xs text-on-surface-variant">
                  Keluarkan batch terdekat untuk peresepan aktif
                </span>
              </div>
              <span
                className="material-symbols-outlined text-outline cursor-help text-[20px]"
                title="Aturan First Expired First Out sesuai Permenkes 73/2016"
              >
                info
              </span>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              {/* FEFO 1 */}
              <div className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-1 border border-surface-container/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-on-surface truncate">
                    Cefadroxil Sirup Kering 125mg
                  </span>
                  <span className="bg-surface-variant text-on-surface-variant font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sisa 19 Hari
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>
                    Batch: <code className="font-mono text-primary font-semibold">CFX-23K09</code>
                  </span>
                  <span>Rak: <strong className="text-on-surface">A-03 (Bawah)</strong></span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-surface-container/40">
                  <span className="font-mono text-xs text-error font-medium">ED: 12 Nov 2024</span>
                  <span className="text-xs text-secondary font-semibold">Stok: 8 Btl</span>
                </div>
              </div>

              {/* FEFO 2 */}
              <div className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-1 border border-surface-container/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-on-surface truncate">
                    Salbutamol Inhaler 100mcg
                  </span>
                  <span className="bg-surface-variant text-on-surface-variant font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sisa 28 Hari
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>
                    Batch: <code className="font-mono text-primary font-semibold">SLB-23L44</code>
                  </span>
                  <span>Rak: <strong className="text-on-surface">C-01 (Inhalasi)</strong></span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-surface-container/40">
                  <span className="font-mono text-xs text-error font-medium">ED: 21 Nov 2024</span>
                  <span className="text-xs text-secondary font-semibold">Stok: 5 Canister</span>
                </div>
              </div>

              {/* FEFO 3 */}
              <div className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-1 border border-surface-container/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-on-surface truncate">
                    Oralit 200ml Sachet
                  </span>
                  <span className="bg-surface-container text-on-surface font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sisa 44 Hari
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>
                    Batch: <code className="font-mono text-primary font-semibold">ORT-24A10</code>
                  </span>
                  <span>Rak: <strong className="text-on-surface">D-02 (Cairan)</strong></span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-surface-container/40">
                  <span className="font-mono text-xs text-tertiary font-medium">ED: 07 Des 2024</span>
                  <span className="text-xs text-secondary font-semibold">Stok: 34 Sachet</span>
                </div>
              </div>

              {/* FEFO 4 */}
              <div className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-1 border border-surface-container/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-on-surface truncate">
                    Ibuprofen Suspensi 100mg/5ml
                  </span>
                  <span className="bg-surface-container text-on-surface font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sisa 52 Hari
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>
                    Batch: <code className="font-mono text-primary font-semibold">IBP-24B02</code>
                  </span>
                  <span>Rak: <strong className="text-on-surface">A-04 (Sirup)</strong></span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-surface-container/40">
                  <span className="font-mono text-xs text-tertiary font-medium">ED: 15 Des 2024</span>
                  <span className="text-xs text-secondary font-semibold">Stok: 12 Btl</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2">
            <button
              onClick={() => onNavigate('pengeluaran-resep')}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">rule</span>
              <span>Buka Antrean FEFO Dispensing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table: Quick Action Daftar Pantauan Stok Darurat & Batch Kedaluwarsa */}
      <div
        className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col gap-4"
        id="tabel-darurat"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-base sm:text-lg text-on-surface">
                Daftar Pantauan Stok Darurat &amp; Batch Kedaluwarsa
              </h2>
              <span className="bg-error text-on-error text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                {emergencyItems.length} Item Perhatian
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Pemisahan obat kedaluwarsa fisik dan verifikasi stok mendekati batas retur PBF (Pedagang Besar Farmasi).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container">
              <span className="material-symbols-outlined text-[16px] text-outline mr-1.5">filter_alt</span>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status Kritis ({batches.filter((b) => b.status !== 'safe').length})</option>
                <option value="expired">Hanya Kedaluwarsa ({expiredBatches.length})</option>
                <option value="30days">&lt; 30 Hari ({criticalBatches.length})</option>
                <option value="60days">&lt; 60 Hari ({warningBatches.length})</option>
              </select>
            </div>

            <button
              onClick={() => onShowToast('Mengekspor daftar pantauan darurat ke PDF...', 'download')}
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant border border-surface-container"
              title="Ekspor Laporan"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-surface-container">
                <th className="py-3 px-3.5 rounded-l-lg">Kode &amp; Nama Obat</th>
                <th className="py-3 px-3.5">Bentuk Sediaan</th>
                <th className="py-3 px-3.5 text-right">No. Batch</th>
                <th className="py-3 px-3.5 text-right">Tanggal ED</th>
                <th className="py-3 px-3.5 text-right">Sisa Hari</th>
                <th className="py-3 px-3.5">Posisi Rak</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-right rounded-r-lg">Aksi Pengamanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60 text-xs sm:text-sm">
              {emergencyItems.map((b) => {
                const isExpired = b.status === 'expired';
                const isCritical = b.status === 'critical';
                return (
                  <tr
                    key={b.id}
                    className={`hover:bg-surface-container-low/70 transition-colors ${
                      isExpired ? 'bg-error-container/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{b.drugName}</span>
                        <span className="font-mono text-[11px] text-outline">{b.bpomReg}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-on-surface-variant text-xs">
                      {b.dosageForm}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-on-surface">
                      {b.batchNumber}
                    </td>
                    <td
                      className={`py-3 px-3.5 text-right font-mono font-bold ${
                        isExpired ? 'text-error' : isCritical ? 'text-tertiary' : 'text-on-surface'
                      }`}
                    >
                      {b.expiryDisplay}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {isExpired ? (
                        <span className="bg-error text-on-error font-mono text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                          {b.remainingText.toUpperCase()}
                        </span>
                      ) : (
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            isCritical ? 'bg-surface-variant text-on-surface-variant' : 'bg-surface-container text-on-surface'
                          }`}
                        >
                          {b.remainingText}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-xs">
                      {isExpired ? (
                        <span className="flex items-center gap-1 text-error">
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                          {b.lockLocation || b.location}
                        </span>
                      ) : (
                        <span className="text-on-surface">{b.location}</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {isExpired ? (
                        <span className="bg-error text-on-error text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[13px]">dangerous</span>
                          Kedaluwarsa
                        </span>
                      ) : isCritical ? (
                        <span className="bg-surface-variant text-on-surface-variant text-[11px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
                          &lt; 30 Hari
                        </span>
                      ) : (
                        <span className="bg-surface-container text-on-surface text-[11px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">event</span>
                          &lt; 60 Hari
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isExpired ? (
                          <>
                            <button
                              onClick={() => onOpenQuarantineModal(b)}
                              className="px-2.5 py-1 rounded-lg bg-error text-on-error text-xs font-semibold hover:bg-error/90 transition-colors shadow-sm"
                              title="Karantina ke Lemari Merah"
                            >
                              Karantina
                            </button>
                            <button
                              onClick={() =>
                                onShowToast(`Menyiapkan Berita Acara Retur PBF untuk batch ${b.batchNumber}`, 'assignment_return')
                              }
                              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors"
                              title="Retur PBF"
                            >
                              Retur PBF
                            </button>
                          </>
                        ) : isCritical ? (
                          <>
                            <button
                              onClick={() =>
                                onShowToast(`Batch ${b.batchNumber} diprioritaskan di urutan teratas dispenser!`, 'push_pin')
                              }
                              className="px-2.5 py-1 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors"
                            >
                              Prioritaskan FEFO
                            </button>
                            <button
                              onClick={() =>
                                onShowToast(`Notifikasi dikirim ke grup dokter spesialis/umum untuk batch ${b.batchNumber}`, 'send')
                              }
                              className="p-1 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface"
                              title="Kirim Notif Dokter"
                            >
                              <span className="material-symbols-outlined text-[18px]">info</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                onShowToast(`Memeriksa klausul retur PBF rekanan untuk batch ${b.batchNumber}`, 'check')
                              }
                              className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant text-xs font-semibold transition-colors"
                            >
                              Cek Batas Retur
                            </button>
                            <button
                              onClick={() =>
                                onShowToast(`Kartu batch dibuka: ${b.batchNumber}`, 'visibility')
                              }
                              className="p-1 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface"
                            >
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-on-surface-variant border-t border-surface-container">
          <span className="text-outline">
            Menampilkan {emergencyItems.length} dari {batches.length} total batch &bull; Otomasi sinkronisasi SIMRS jam 09:00 WIB
          </span>
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              disabled
              className="px-3 py-1 rounded-lg bg-surface-container text-on-surface-variant font-medium disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-mono font-bold text-on-surface">1 / 1</span>
            <button
              disabled
              className="px-3 py-1 rounded-lg bg-surface-container text-on-surface-variant font-medium disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Workflow Shortcut Panels (Bento Sub-section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
        {/* Mini 1: Cold Chain */}
        <div
          onClick={() => onShowToast('Sensor Rantai Dingin: Kalibrasi suhu harian valid (BPOM Good Distribution Practice)', 'ac_unit')}
          className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex items-start gap-4 hover:border-secondary/40 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">ac_unit</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm text-on-surface">
              Cold Chain Bio-Monitoring
            </span>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              Kulkas Vaksin: <strong>4.1°C</strong> | Chiller Serum: <strong>3.8°C</strong>. Semua
              dalam ambang toleransi BPOM.
            </p>
            <span className="font-mono text-[11px] text-secondary font-bold mt-1.5">
              Status: Normal (Log otomatis)
            </span>
          </div>
        </div>

        {/* Mini 2: Status SP & Faktur */}
        <div
          onClick={() => onNavigate('penerimaan-pengadaan')}
          className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex items-start gap-4 hover:border-primary/40 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm text-on-surface">
              Surat Pesanan (SP) Terkirim
            </span>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              2 SP Obat Reguler &amp; 1 SP Prekursor menunggu pengiriman dari PBF Kimia Farma &amp; Enseval.
            </p>
            <span className="text-xs text-primary font-bold mt-1.5 hover:underline">
              Pantau Pengiriman (3 PO) &rarr;
            </span>
          </div>
        </div>

        {/* Mini 3: Audit Stok Opname Q4 */}
        <div
          onClick={() => onNavigate('kartu-stok-audit')}
          className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex items-start gap-4 hover:border-tertiary/40 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-container text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm text-on-surface">Audit Stok Opname Q4</span>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              Jadwal Opname Fisik berikutnya: <strong>31 Oktober 2024</strong>. 482 SKU siap dihitung.
            </p>
            <span className="text-xs text-tertiary font-bold mt-1.5 hover:underline">
              Persiapan Formulir Opname &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
