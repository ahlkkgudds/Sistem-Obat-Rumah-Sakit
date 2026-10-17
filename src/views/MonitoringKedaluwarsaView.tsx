import React, { useState, useMemo } from 'react';
import { BatchItem, BatchStatus } from '../types';

interface MonitoringKedaluwarsaViewProps {
  batches: BatchItem[];
  onOpenQuarantineModal: (batch?: BatchItem) => void;
  onOpenExportModal: () => void;
  onShowToast: (message: string, icon?: string) => void;
  onLockBatch: (batchId: string) => void;
}

export const MonitoringKedaluwarsaView: React.FC<MonitoringKedaluwarsaViewProps> = ({
  batches,
  onOpenQuarantineModal,
  onOpenExportModal,
  onShowToast,
  onLockBatch,
}) => {
  const [activeStatus, setActiveStatus] = useState<BatchStatus>('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [sortBy, setSortBy] = useState('fefo_asc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Counts
  const expiredCount = batches.filter((b) => b.status === 'expired').length;
  const criticalCount = batches.filter((b) => b.status === 'critical').length;
  const warningCount = batches.filter((b) => b.status === 'warning').length;
  const safeCount = batches.filter((b) => b.status === 'safe').length;

  // Filter & Sort
  const filteredBatches = useMemo(() => {
    let result = batches.filter((b) => {
      const matchStatus = activeStatus === 'all' || b.status === activeStatus;
      const matchSearch =
        !search.trim() ||
        b.drugName.toLowerCase().includes(search.toLowerCase()) ||
        b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.bpomReg.toLowerCase().includes(search.toLowerCase()) ||
        b.location.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || b.category === category;
      const matchLocation = location === 'all' || b.location.toLowerCase().includes(location.toLowerCase());

      return matchStatus && matchSearch && matchCategory && matchLocation;
    });

    result.sort((a, b) => {
      if (sortBy === 'fefo_asc') return a.remainingDays - b.remainingDays;
      if (sortBy === 'fefo_desc') return b.remainingDays - a.remainingDays;
      if (sortBy === 'val_desc') return b.potentialLoss - a.potentialLoss;
      if (sortBy === 'stock_desc') return b.stock - a.stock;
      return 0;
    });

    return result;
  }, [batches, activeStatus, search, category, location, sortBy]);

  // Selection toggles
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredBatches.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setLocation('all');
    setSortBy('fefo_asc');
    setActiveStatus('all');
    setSelectedIds([]);
    onShowToast('Semua parameter filter telah direset', 'refresh');
  };

  const handleBulkAction = (action: 'quarantine' | 'retur' | 'clear') => {
    if (action === 'quarantine') {
      const selected = batches.filter((b) => selectedIds.includes(b.id));
      onOpenQuarantineModal(selected[0]);
    } else if (action === 'retur') {
      onShowToast(`${selectedIds.length} batch disiapkan ke draf pengajuan retur rekanan PBF.`, 'reply');
      setSelectedIds([]);
    } else {
      setSelectedIds([]);
    }
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Banner / Title Header */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-5 sm:p-6 shadow-sm border border-surface-container/60 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative z-10 flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>SISTEM PENGAWASAN MUTU &amp; KEPATUHAN FARMASI BPOM</span>
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-on-surface tracking-tight">
            Pusat Pemantauan Kedaluwarsa Obat &amp; Sistem FEFO
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Manajemen pengawasan batch obat berdasar tanggal kedaluwarsa untuk menjamin keselamatan
            pasien, rotasi First-Expired First-Out (FEFO), dan efisiensi farmasi.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs sm:text-sm transition-all shadow-sm border border-surface-container/60"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Ekspor Laporan ED (Excel/PDF)</span>
          </button>
          <button
            onClick={() => onOpenQuarantineModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-on-error font-semibold text-xs sm:text-sm transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">assignment_late</span>
            <span>Buat Berita Acara Karantina</span>
          </button>
        </div>

        {/* Soft Decorative Glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-48 -bottom-12 w-48 h-48 bg-error/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Summary KPI Tabs (5 Status Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" id="statusFilterTabs">
        {/* Tab 1: All */}
        <button
          onClick={() => setActiveStatus('all')}
          className={`text-left p-4 rounded-2xl bg-surface-container-lowest transition-all shadow-sm flex flex-col justify-between hover:bg-surface-container-low group relative overflow-hidden border ${
            activeStatus === 'all'
              ? 'ring-2 ring-primary bg-surface-container-low border-primary/40'
              : 'border-surface-container/60'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Semua Batch
            </span>
            <span className="p-1 rounded-lg bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface tracking-tight">1.240</span>
            <p className="text-[11px] text-outline mt-0.5">Total Batch Aktif</p>
          </div>
          {activeStatus === 'all' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>}
        </button>

        {/* Tab 2: Expired */}
        <button
          onClick={() => setActiveStatus('expired')}
          className={`text-left p-4 rounded-2xl bg-surface-container-lowest transition-all shadow-sm flex flex-col justify-between hover:bg-surface-container-low group relative overflow-hidden border ${
            activeStatus === 'expired'
              ? 'ring-2 ring-error bg-error-container/20 border-error'
              : 'border-surface-container/60'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-error font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-error animate-ping"></span>
              Sudah Kedaluwarsa
            </span>
            <span className="p-1 rounded-lg bg-error-container text-on-error-container">
              <span className="material-symbols-outlined text-[18px]">dangerous</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-error tracking-tight">
              {expiredCount} Batch
            </span>
            <p className="text-[11px] text-error font-semibold mt-0.5">Tindakan Segera (Karantina)</p>
          </div>
          {activeStatus === 'expired' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-error"></div>}
        </button>

        {/* Tab 3: Critical <30 Days */}
        <button
          onClick={() => setActiveStatus('critical')}
          className={`text-left p-4 rounded-2xl bg-surface-container-lowest transition-all shadow-sm flex flex-col justify-between hover:bg-surface-container-low group relative overflow-hidden border ${
            activeStatus === 'critical'
              ? 'ring-2 ring-tertiary bg-surface-container-high/40 border-tertiary'
              : 'border-surface-container/60'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Kritis (&lt; 30 Hari)
            </span>
            <span className="p-1 rounded-lg bg-surface-container-high text-tertiary">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface tracking-tight">
              {criticalCount} Batch
            </span>
            <p className="text-[11px] text-tertiary font-semibold mt-0.5">Dispensir Cepat / Prioritas Retur</p>
          </div>
          {activeStatus === 'critical' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-tertiary"></div>}
        </button>

        {/* Tab 4: Warning 31-90 Days */}
        <button
          onClick={() => setActiveStatus('warning')}
          className={`text-left p-4 rounded-2xl bg-surface-container-lowest transition-all shadow-sm flex flex-col justify-between hover:bg-surface-container-low group relative overflow-hidden border ${
            activeStatus === 'warning'
              ? 'ring-2 ring-primary-fixed-variant bg-surface-container-low border-primary-fixed-variant'
              : 'border-surface-container/60'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Perhatian (31–90 Hari)
            </span>
            <span className="p-1 rounded-lg bg-surface-container text-primary-fixed-variant">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface tracking-tight">
              {warningCount} Batch
            </span>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Monitor Pengeluaran FEFO</p>
          </div>
          {activeStatus === 'warning' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-fixed-variant"></div>
          )}
        </button>

        {/* Tab 5: Safe >90 Days */}
        <button
          onClick={() => setActiveStatus('safe')}
          className={`text-left p-4 rounded-2xl bg-surface-container-lowest transition-all shadow-sm flex flex-col justify-between hover:bg-surface-container-low group relative overflow-hidden border ${
            activeStatus === 'safe'
              ? 'ring-2 ring-secondary bg-secondary-container/20 border-secondary'
              : 'border-surface-container/60'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">
              Aman (&gt; 90 Hari)
            </span>
            <span className="p-1 rounded-lg bg-surface-container-low text-secondary">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-secondary tracking-tight">1.202</span>
            <p className="text-[11px] text-outline mt-0.5">Stok Optimal Terkendali</p>
          </div>
          {activeStatus === 'safe' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary"></div>}
        </button>
      </div>

      {/* Main Grid: Tables & Contextual Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Area: Filters & Table (9 cols on XL) */}
        <div className="xl:col-span-9 flex flex-col gap-4">
          {/* Filter Toolbar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama obat, no batch, distributor..."
                className="w-full h-10 pl-9 pr-3 bg-surface-container-low rounded-xl text-on-surface text-xs sm:text-sm focus:outline-none focus:bg-surface-container transition-all border border-transparent focus:border-primary/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <div className="relative min-w-[130px] flex-1 sm:flex-none">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold appearance-none pr-8 focus:outline-none cursor-pointer border border-surface-container/60"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Antibiotik">Antibiotik</option>
                  <option value="Analgesik">Analgesik</option>
                  <option value="Sirup">Sirup / Drop</option>
                  <option value="Injeksi">Injeksi</option>
                  <option value="Vaksin">Vaksin &amp; Biologis</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Location Filter */}
              <div className="relative min-w-[140px] flex-1 sm:flex-none">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold appearance-none pr-8 focus:outline-none cursor-pointer border border-surface-container/60"
                >
                  <option value="all">Semua Lokasi</option>
                  <option value="Gudang Utama">Gudang Utama</option>
                  <option value="Apotek Rawat Jalan">Apotek Rawat Jalan</option>
                  <option value="Kulkas Vaksin">Kulkas Vaksin (Chiller)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Sorting Filter */}
              <div className="relative min-w-[150px] flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold appearance-none pr-8 focus:outline-none cursor-pointer border border-surface-container/60"
                >
                  <option value="fefo_asc">Sort: Paling Cepat ED (FEFO)</option>
                  <option value="fefo_desc">Sort: Paling Lama ED</option>
                  <option value="val_desc">Sort: Kerugian Tertinggi (Rp)</option>
                  <option value="stock_desc">Sort: Stok Terbanyak</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
                  sort
                </span>
              </div>

              {/* Reset Filter */}
              <button
                onClick={resetFilters}
                className="p-2 h-10 w-10 flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface transition-colors border border-surface-container/60"
                title="Reset Filter"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
          </div>

          {/* Action Floating Bar when Selected */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-inverse-surface text-inverse-on-surface p-3 px-4 rounded-2xl shadow-xl transition-all border border-surface-container/20 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary-fixed text-[22px]">
                  checklist
                </span>
                <span className="text-xs sm:text-sm font-semibold">
                  {selectedIds.length} Batch terpilih
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('quarantine')}
                  className="px-3 py-1.5 rounded-lg bg-error text-on-error text-xs font-semibold hover:bg-error/90 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Pindahkan ke Karantina
                </button>
                <button
                  onClick={() => handleBulkAction('retur')}
                  className="px-3 py-1.5 rounded-lg bg-tertiary-container text-on-tertiary-container text-xs font-semibold hover:opacity-95 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">replay</span>
                  Buat Formulir Retur PBF
                </button>
                <button
                  onClick={() => handleBulkAction('clear')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container/20 text-inverse-on-surface text-xs font-semibold hover:bg-surface-container/30 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Data Table Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container/60 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[950px]">
                <thead>
                  <tr className="bg-surface-container-low border-b-2 border-surface-container">
                    <th className="p-3 pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length > 0 && selectedIds.length === filteredBatches.length
                        }
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                      />
                    </th>
                    <th className="p-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Obat &amp; Sediaan
                    </th>
                    <th className="p-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Nomor Batch &amp; Registrasi BPOM
                    </th>
                    <th className="p-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Tanggal ED &amp; Sisa Hari
                    </th>
                    <th className="p-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">
                      Stok Fisik
                    </th>
                    <th className="p-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">
                      Nilai Potensi (Rp)
                    </th>
                    <th className="p-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Rekomendasi Sistem
                    </th>
                    <th className="p-3 pr-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-center">
                      Aksi Cepat
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-xs sm:text-sm">
                  {filteredBatches.map((b) => {
                    const isSelected = selectedIds.includes(b.id);
                    const isExpired = b.status === 'expired';
                    const isCritical = b.status === 'critical';
                    const isWarning = b.status === 'warning';

                    // Progress bar calculation
                    let progressWidth = '100%';
                    let progressBarColor = 'bg-error';
                    if (isExpired) {
                      progressWidth = '100%';
                      progressBarColor = 'bg-error';
                    } else if (isCritical) {
                      progressWidth = `${Math.min(100, Math.max(15, (b.remainingDays / 30) * 100))}%`;
                      progressBarColor = 'bg-tertiary';
                    } else if (isWarning) {
                      progressWidth = `${Math.min(100, Math.max(20, (b.remainingDays / 90) * 100))}%`;
                      progressBarColor = 'bg-primary-fixed-variant';
                    } else {
                      progressWidth = '92%';
                      progressBarColor = 'bg-secondary';
                    }

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-surface-container-low/60 transition-colors ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="p-3 pl-4 align-middle">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(b.id)}
                            className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                          />
                        </td>
                        <td className="p-3 align-middle">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs sm:text-sm text-on-surface">
                              {b.drugName}
                            </span>
                            <span className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isExpired
                                    ? 'bg-outline'
                                    : isCritical
                                    ? 'bg-tertiary'
                                    : isWarning
                                    ? 'bg-primary'
                                    : 'bg-secondary'
                                }`}
                              ></span>
                              {b.dosageForm}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 align-middle">
                          <div className="flex flex-col">
                            <span
                              className={`font-mono font-bold text-xs ${
                                isExpired ? 'text-error' : isCritical ? 'text-tertiary' : 'text-on-surface'
                              }`}
                            >
                              {b.batchNumber}
                            </span>
                            <span className="text-[11px] font-mono text-outline">{b.bpomReg}</span>
                          </div>
                        </td>
                        <td className="p-3 align-middle">
                          <div className="flex flex-col gap-1 min-w-[130px]">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  isExpired ? 'text-error' : isCritical ? 'text-tertiary' : isWarning ? 'text-on-surface' : 'text-secondary'
                                }`}
                              >
                                {b.expiryDisplay}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isExpired
                                    ? 'bg-error-container text-on-error-container'
                                    : isCritical
                                    ? 'bg-tertiary-container/20 text-tertiary animate-pulse'
                                    : isWarning
                                    ? 'bg-surface-container text-on-surface-variant'
                                    : 'bg-secondary-container/30 text-secondary'
                                }`}
                              >
                                {b.remainingText}
                              </span>
                            </div>
                            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`${progressBarColor} h-full rounded-full transition-all`}
                                style={{ width: progressWidth }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-middle text-right">
                          <span className="font-mono font-bold text-xs sm:text-sm text-on-surface">
                            {b.stock}
                          </span>
                          <span className="text-[11px] text-on-surface-variant block">{b.unit}</span>
                        </td>
                        <td className="p-3 align-middle text-right">
                          <span
                            className={`font-mono font-semibold text-xs sm:text-sm ${
                              isExpired ? 'text-error' : 'text-on-surface'
                            }`}
                          >
                            {formatRupiah(b.potentialLoss)}
                          </span>
                          <span className="text-[11px] font-mono text-outline block">
                            @ {formatRupiah(b.unitPrice)}
                          </span>
                        </td>
                        <td className="p-3 align-middle">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isExpired
                                ? 'bg-error/10 text-error'
                                : b.recommendationType === 'retur'
                                ? 'bg-tertiary-container/15 text-tertiary'
                                : b.recommendationType === 'priority'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : b.recommendationType === 'rotate'
                                ? 'bg-surface-container text-on-surface-variant'
                                : 'bg-secondary-container/40 text-secondary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isExpired
                                ? 'lock'
                                : b.recommendationType === 'retur'
                                ? 'replay'
                                : b.recommendationType === 'priority'
                                ? 'flash_on'
                                : b.recommendationType === 'rotate'
                                ? 'sync_alt'
                                : 'check_circle'}
                            </span>
                            <span>{b.recommendation}</span>
                          </div>
                        </td>
                        <td className="p-3 pr-4 align-middle text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isExpired && (
                              <button
                                onClick={() => onOpenQuarantineModal(b)}
                                className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors"
                                title="Proses Karantina Fisik"
                              >
                                <span className="material-symbols-outlined text-[18px]">lock</span>
                              </button>
                            )}
                            {b.recommendationType === 'retur' && (
                              <button
                                onClick={() =>
                                  onShowToast(`Formulir Retur PBF untuk ${b.drugName} (${b.batchNumber}) disiapkan.`, 'assignment_return')
                                }
                                className="p-1.5 rounded-lg text-tertiary hover:bg-tertiary-container/20 transition-colors"
                                title="Form Retur Rekanan PBF"
                              >
                                <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                              </button>
                            )}
                            {b.recommendationType === 'priority' && (
                              <button
                                onClick={() =>
                                  onShowToast(`Batch ${b.batchNumber} dikunci pada posisi teratas dispenser FEFO!`, 'push_pin')
                                }
                                className="p-1.5 rounded-lg text-secondary hover:bg-secondary-container transition-colors"
                                title="Kunci Teratas Antrean Resep"
                              >
                                <span className="material-symbols-outlined text-[18px]">push_pin</span>
                              </button>
                            )}
                            {b.recommendationType === 'rotate' && (
                              <button
                                onClick={() =>
                                  onShowToast(`Tiket mutasi internal dibuka untuk rotasi sediaan ${b.drugName} ke IGD`, 'swap_horiz')
                                }
                                className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors"
                                title="Mutasi Stok Antar Unit"
                              >
                                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                              </button>
                            )}
                            <button
                              onClick={() =>
                                onShowToast(`Membuka riwayat kartu batch & audit opname: ${b.batchNumber}`, 'visibility')
                              }
                              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                              title="Lihat Kartu Batch"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBatches.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl text-outline mb-2 block">
                          search_off
                        </span>
                        Tidak ada data batch obat yang cocok dengan filter yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-container">
              <span className="text-xs text-on-surface-variant">
                Menampilkan <strong className="text-on-surface">{filteredBatches.length}</strong>{' '}
                dari 1.240 data batch aktif
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-surface-container text-outline hover:text-on-surface text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <button className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm">
                  1
                </button>
                <button className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs transition-colors">
                  2
                </button>
                <button className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs transition-colors">
                  3
                </button>
                <span className="px-1 text-xs text-outline">&hellip;</span>
                <button className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs transition-colors">
                  24
                </button>
                <button className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs transition-colors">
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: SOP & Compliance Drawer (3 cols on XL) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Clinical Protocol Card */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">policy</span>
              <h2 className="font-bold text-sm sm:text-base text-on-surface">
                Protokol FEFO &amp; Retur BPOM
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Standar Operasional Prosedur penanganan obat ED di Instalasi Farmasi Klinik Jambu Mawar.
            </p>

            {/* Stepper Visual SOP */}
            <div className="mt-1 flex flex-col gap-3 relative">
              {/* Step 1 */}
              <div className="flex gap-3 items-start relative">
                <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm">
                  1
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-on-surface">
                    Identifikasi ED &lt; 90 Hari
                  </span>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Beri label stiker kuning pada kemasan sekunder obat di rak pelayanan apotek.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 items-start relative">
                <div className="w-7 h-7 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-on-surface">
                    Batas Retur PBF (H-60 Hari)
                  </span>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Ajukan form retur ke distributor resmi (Kimia Farma / Enseval / Mensa) sebelum H-30.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 items-start relative">
                <div className="w-7 h-7 rounded-full bg-error text-on-error flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-on-surface">
                    Isolasi Lemari Karantina
                  </span>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Obat ED wajib dipindahkan ke lemari terkunci bertanda khusus merah "OBAT KEDALUWARSA".
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3 items-start relative">
                <div className="w-7 h-7 rounded-full bg-inverse-surface text-inverse-on-surface flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm">
                  4
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-on-surface">
                    Berita Acara &amp; Pemusnahan
                  </span>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Pemusnahan disaksikan Dinkes Kota &amp; BPOM setempat sesuai Permenkes 73/2016.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact PBF Widget */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col gap-3">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Distributor Farmasi Rekanan
            </span>
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container/60">
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-on-surface">PT. Kimia Farma Trading</span>
                  <span className="text-outline text-[10px]">Retur maks: H-60 hari ED</span>
                </div>
                <a
                  href="tel:02138477"
                  className="font-mono text-xs text-primary font-bold hover:underline"
                >
                  021-38477
                </a>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container/60">
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-on-surface">PT. Enseval Putera Megatrading</span>
                  <span className="text-outline text-[10px]">Retur maks: H-90 hari ED</span>
                </div>
                <a
                  href="tel:02146090"
                  className="font-mono text-xs text-primary font-bold hover:underline"
                >
                  021-46090
                </a>
              </div>
            </div>
          </div>

          {/* Visual Pharmacy Inspection Photo Card */}
          <div className="rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col">
            <div
              className="h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLE8oy29YDGmrDlbFh6htdI_CFcCPAt2_6ZXOTOgoJ0KSMQHxkovmuprzX_lWq7Ygokhqh4jurBzHQV3a2JsaZ_xAIMqGgwOXpEJOqIcUgleAt5_ij1oYn1DNpqRZetAnOmzq2Raek4bydwCYseCSZAlZLnqyk9B2d2uUmQzr0cf5wSINbQxs7cVf-XJMKlz-AIGzbBO8vsazFcAPjkMSPSDXPtxhICMOOdPNramTwMsyeyDc6OYwLtw')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs text-inverse-on-surface font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
                    fact_check
                  </span>
                  Audit Terakhir: Hari Ini, 08:30 WIB
                </span>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between bg-surface-container-lowest">
              <span className="text-xs text-on-surface-variant font-medium">
                SOP Rak 01&ndash;12 Terverifikasi
              </span>
              <span className="text-xs text-secondary font-bold">100% Cocok</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
