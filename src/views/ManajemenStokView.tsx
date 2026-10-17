import React, { useState, useMemo } from 'react';
import { DrugCategory, DrugItem, ScreenId } from '../types';

interface ManajemenStokViewProps {
  drugs: DrugItem[];
  onOpenAddDrugModal: () => void;
  onShowToast: (message: string, icon?: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onUpdateDrugStock?: (drugId: string, newStock: number) => void;
}

export const ManajemenStokView: React.FC<ManajemenStokViewProps> = ({
  drugs,
  onOpenAddDrugModal,
  onShowToast,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [adjustModalDrug, setAdjustModalDrug] = useState<DrugItem | null>(null);
  const [adjustedQty, setAdjustedQty] = useState<number>(0);

  // Filtered drugs
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      const matchSearch =
        !search.trim() ||
        drug.name.toLowerCase().includes(search.toLowerCase()) ||
        drug.code.toLowerCase().includes(search.toLowerCase()) ||
        drug.barcode.includes(search) ||
        drug.dosage.toLowerCase().includes(search.toLowerCase());

      const matchCategory = !categoryFilter || drug.category === categoryFilter;

      const matchLocation =
        !locationFilter ||
        drug.shelfLocation.toLowerCase().includes(locationFilter.toLowerCase()) ||
        (locationFilter === 'chiller' && drug.shelfLocation.toLowerCase().includes('kulkas')) ||
        (locationFilter === 'narkotika' && drug.shelfLocation.toLowerCase().includes('lemari'));

      const matchStatus =
        !statusFilter ||
        (statusFilter === 'tersedia' && drug.status === 'Tersedia') ||
        (statusFilter === 'kritis' && drug.status === 'Stok Kritis') ||
        (statusFilter === 'habis' && drug.status === 'Habis');

      return matchSearch && matchCategory && matchLocation && matchStatus;
    });
  }, [drugs, search, categoryFilter, locationFilter, statusFilter]);

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setLocationFilter('');
    setStatusFilter('');
    onShowToast('Semua parameter filter telah dibersihkan', 'filter_alt_off');
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Command & Title Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            <span>KATALOG FARMASI &amp; SISTEM RAK PRESISI</span>
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-on-surface tracking-tight">
            Manajemen Stok Obat &amp; Katalog Farmasi
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 leading-relaxed">
            Pencatatan real-time ketersediaan sediaan obat generik, paten, alkes, dan posisi
            penyimpanan rak terverifikasi.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start xl:self-auto">
          <button
            onClick={() => onShowToast('Mengunduh master formulir kartu stok (.pdf)...', 'download')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface text-xs sm:text-sm font-semibold shadow-sm hover:bg-surface-container transition-all border border-surface-container"
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">download</span>
            <span>Unduh Format Kartu Stok</span>
          </button>
          <button
            onClick={() =>
              onShowToast('Membuka wizard impor berkas spreadsheet stok obat...', 'file_upload')
            }
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface text-xs sm:text-sm font-semibold shadow-sm hover:bg-surface-container transition-all border border-surface-container"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_upload</span>
            <span>Import Data Stok (Excel)</span>
          </button>
          <button
            onClick={onOpenAddDrugModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-md hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Tambah Master Obat</span>
          </button>
        </div>
      </div>

      {/* Metric / Category Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Bebas & Terbatas */}
        <div
          onClick={() => setCategoryFilter('Bebas')}
          className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-secondary/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary"></div>
              <span className="text-[11px] font-bold text-on-surface-variant ml-1">
                BEBAS &amp; TERBATAS
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container text-on-surface-variant">
              Reguler
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface leading-none mb-1">
              142 <span className="text-xs font-normal text-on-surface-variant">item</span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center justify-between mt-1">
              <span>Stok Siap Layani Resep</span>
              <span className="text-secondary font-bold">98% Terpenuhi</span>
            </p>
          </div>
          <div className="w-full bg-surface-container-high h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

        {/* Card 2: Obat Keras / Ethical */}
        <div
          onClick={() => setCategoryFilter('Keras')}
          className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-error/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-error text-on-error flex items-center justify-center font-bold text-[9px] leading-none">
                K
              </div>
              <span className="text-[11px] font-bold text-on-surface-variant">
                OBAT KERAS (ETHICAL)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-error-container text-on-error-container">
              Perlu Resep
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface leading-none mb-1">
              210 <span className="text-xs font-normal text-on-surface-variant">item</span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center justify-between mt-1">
              <span>Antibiotik &amp; Kronis Rutin</span>
              <span className="text-error font-bold">4 Menipis</span>
            </p>
          </div>
          <div className="w-full bg-surface-container-high h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        {/* Card 3: Psikotropika & Prekursor */}
        <div
          onClick={() => setCategoryFilter('Psikotropika')}
          className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-tertiary/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary">lock</span>
              <span className="text-[11px] font-bold text-tertiary">PSIKOTROPIKA &amp; PREKURSOR</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
              Gembok Ganda
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface leading-none mb-1">
              18 <span className="text-xs font-normal text-on-surface-variant">sediaan</span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center justify-between mt-1">
              <span>Pengawasan SIPNAP Valid</span>
              <span className="text-tertiary font-bold">Audit H-3</span>
            </p>
          </div>
          <div className="w-full bg-surface-container-high h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-tertiary-container h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Card 4: Alkes & BHP */}
        <div
          onClick={() => setCategoryFilter('Alkes')}
          className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-secondary/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">vaccines</span>
              <span className="text-[11px] font-bold text-on-surface-variant">ALKES &amp; HABIS PAKAI</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container text-on-surface-variant">
              Tindakan
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface leading-none mb-1">
              112 <span className="text-xs font-normal text-on-surface-variant">jenis</span>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center justify-between mt-1">
              <span>Spuit, Kasa, Jarum &amp; Cairan</span>
              <span className="text-secondary font-bold">Aman</span>
            </p>
          </div>
          <div className="w-full bg-surface-container-high h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>
      </div>

      {/* Multi-Criteria Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container/60 mb-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama sediaan, kode OBT-, nomor barcode, atau komposisi aktif..."
            className="w-full h-10 pl-10 pr-20 bg-surface-container-low rounded-xl text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:bg-surface-container transition-all border border-transparent focus:border-primary/30"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-[10px] font-mono bg-surface-container-high px-1.5 py-0.5 rounded"
            >
              ESC reset
            </button>
          )}
        </div>

        {/* Dropdown Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Golongan */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 pl-3 pr-8 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold appearance-none focus:outline-none focus:bg-surface-container cursor-pointer transition-all border border-surface-container"
            >
              <option value="">Semua Golongan Obat</option>
              <option value="Bebas">Obat Bebas (Hijau)</option>
              <option value="Terbatas">Obat Bebas Terbatas (Biru)</option>
              <option value="Keras">Obat Keras / Ethical (Merah K)</option>
              <option value="Psikotropika">Psikotropika &amp; Prekursor</option>
              <option value="Alkes">Alat Kesehatan &amp; BHP</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Filter Lokasi Rak */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="h-10 pl-3 pr-8 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold appearance-none focus:outline-none focus:bg-surface-container cursor-pointer transition-all border border-surface-container"
            >
              <option value="">Semua Lokasi Rak / Cold Storage</option>
              <option value="Rak A">Rak Utama A (A-01 s/d A-04)</option>
              <option value="Rak B">Rak Sediaan Cair &amp; Salep B</option>
              <option value="chiller">Kulkas Suhu Terkontrol (2°C - 8°C)</option>
              <option value="narkotika">Lemari Ganda Narkotika/Psikotropika</option>
              <option value="Rak C">Gudang Alkes C</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Filter Status Stok */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-3 pr-8 bg-surface-container-low rounded-xl text-on-surface text-xs font-semibold appearance-none focus:outline-none focus:bg-surface-container cursor-pointer transition-all border border-surface-container"
            >
              <option value="">Semua Status Stok</option>
              <option value="tersedia">Stok Tersedia (Aman)</option>
              <option value="kritis">Stok Kritis / Buffer Warning</option>
              <option value="habis">Stok Habis (Kosong)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Reset Filter Button */}
          <button
            onClick={resetFilters}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors border border-surface-container"
            title="Bersihkan Filter"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
          </button>
        </div>
      </div>

      {/* Interactive Master Drug Table Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container/60 overflow-hidden mb-6">
        {/* Table Header Status */}
        <div className="px-4 py-3 bg-surface-container-low flex flex-wrap items-center justify-between gap-3 border-b border-surface-container">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xs sm:text-sm text-on-surface">
              Daftar Formularium Aktif
            </span>
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold">
              {drugs.length} Total SKU
            </span>
            <span className="hidden md:inline text-on-surface-variant text-xs">
              &bull; Menampilkan {filteredDrugs.length} sampel sediaan terverifikasi
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            <span>Terverifikasi BPOM RI &amp; Kemenkes SatuSehat</span>
          </div>
        </div>

        {/* The Dense Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Kode &amp; Barcode</th>
                <th className="py-3 px-4">Nama Obat &amp; Dosis</th>
                <th className="py-3 px-4">Golongan</th>
                <th className="py-3 px-4">Penyimpanan / Rak</th>
                <th className="py-3 px-4">Satuan</th>
                <th className="py-3 px-4 text-right">Buffer vs Aktual</th>
                <th className="py-3 px-4 text-right">Harga Beli / HJA</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm text-on-surface divide-y divide-surface-container/60">
              {filteredDrugs.map((drug, idx) => {
                const isOutOfStock = drug.stockActual === 0;
                const isLowStock = drug.stockActual < drug.bufferMin && !isOutOfStock;
                const percentBuffer = drug.bufferMin > 0 ? Math.min(100, Math.round((drug.stockActual / (drug.bufferMin * 2)) * 100)) : 100;

                return (
                  <tr
                    key={drug.id}
                    className={`hover:bg-surface-container-low/70 transition-colors ${
                      idx % 2 === 1 ? 'bg-surface-container-low/30' : 'bg-surface-container-lowest'
                    }`}
                  >
                    {/* Kode & Barcode */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-xs text-primary">{drug.code}</span>
                        <span className="font-mono text-[11px] text-outline tracking-wider">
                          {drug.barcode}
                        </span>
                      </div>
                    </td>

                    {/* Nama Obat & Dosis */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface text-xs sm:text-sm">
                            {drug.name}
                          </span>
                          {drug.isSipnap && (
                            <span className="px-1.5 py-0.2 bg-tertiary-fixed text-on-tertiary-fixed rounded text-[9px] font-bold">
                              SIPNAP
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-on-surface-variant mt-0.5">{drug.dosage}</span>
                      </div>
                    </td>

                    {/* Golongan Badge */}
                    <td className="py-3.5 px-4">
                      {drug.category === 'Bebas' && (
                        <div className="flex items-center gap-1.5" title="Obat Bebas (Hijau)">
                          <span className="w-4 h-4 rounded-full bg-secondary inline-block shrink-0"></span>
                          <span className="text-xs text-on-surface font-medium">Bebas</span>
                        </div>
                      )}
                      {drug.category === 'Terbatas' && (
                        <div className="flex items-center gap-1.5" title="Obat Bebas Terbatas (Biru)">
                          <span className="w-4 h-4 rounded-full bg-tertiary inline-block shrink-0"></span>
                          <span className="text-xs text-on-surface font-medium">Terbatas</span>
                        </div>
                      )}
                      {drug.category === 'Keras' && (
                        <div className="flex items-center gap-1.5" title="Obat Keras (Merah K)">
                          <span className="w-4 h-4 rounded-full bg-error text-on-error flex items-center justify-center font-bold text-[9px] leading-none shrink-0">
                            K
                          </span>
                          <span className="text-xs text-error font-semibold">Keras</span>
                        </div>
                      )}
                      {drug.category === 'Psikotropika' && (
                        <div className="flex items-center gap-1 text-tertiary font-semibold text-xs">
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                          <span>Psikotropika</span>
                        </div>
                      )}
                      {drug.category === 'Alkes' && (
                        <div className="flex items-center gap-1 text-outline font-medium text-xs">
                          <span className="material-symbols-outlined text-[16px]">healing</span>
                          <span>Alkes</span>
                        </div>
                      )}
                    </td>

                    {/* Penyimpanan / Rak */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-on-surface">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {drug.shelfLocation.includes('Kulkas') ? 'ac_unit' : drug.shelfLocation.includes('Lemari') ? 'vpn_key' : 'shelves'}
                        </span>
                        <span className="font-semibold text-xs">{drug.shelfLocation}</span>
                        <span className="text-outline text-[11px] ml-0.5">{drug.shelfDetail}</span>
                      </div>
                    </td>

                    {/* Satuan */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-xs text-on-surface-variant font-medium">
                        {drug.unit}
                      </span>
                    </td>

                    {/* Buffer vs Aktual */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isOutOfStock ? 'text-error' : isLowStock ? 'text-error' : 'text-on-surface'
                            }`}
                          >
                            {drug.stockActual}
                          </span>
                          <span className="font-mono text-[11px] text-outline">
                            / min {drug.bufferMin}
                          </span>
                        </div>
                        <div className="w-24 bg-surface-container-high h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOutOfStock ? 'bg-error w-0' : isLowStock ? 'bg-error' : 'bg-secondary'
                            }`}
                            style={{ width: `${percentBuffer}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Harga Beli / HJA */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-semibold text-xs text-on-surface">
                          {formatRupiah(drug.buyPrice)}
                        </span>
                        <span className="font-mono text-[10px] text-outline">
                          HJA: {formatRupiah(drug.sellPrice)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {drug.status === 'Tersedia' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Tersedia
                        </span>
                      )}
                      {drug.status === 'Stok Kritis' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-bold animate-pulse">
                          <span className="material-symbols-outlined text-[13px]">warning</span> Stok Kritis
                        </span>
                      )}
                      {drug.status === 'Habis' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error text-on-error text-xs font-bold">
                          <span className="material-symbols-outlined text-[13px]">do_not_disturb_on</span> Habis
                        </span>
                      )}
                      {drug.status === 'Diawasi' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Diawasi
                        </span>
                      )}
                      {drug.status === 'Suhu Terjaga' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Suhu Terjaga
                        </span>
                      )}
                    </td>

                    {/* Aksi Cepat */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            onShowToast(`Membuka buku mutasi kartu stok: ${drug.name}`, 'receipt_long')
                          }
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                          title="Lihat Kartu Stok"
                        >
                          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        </button>

                        <button
                          onClick={() => {
                            setAdjustModalDrug(drug);
                            setAdjustedQty(drug.stockActual);
                          }}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors"
                          title="Penyesuaian Stok Opname"
                        >
                          <span className="material-symbols-outlined text-[18px]">tune</span>
                        </button>

                        {isLowStock || isOutOfStock ? (
                          <button
                            onClick={() => onNavigate('penerimaan-pengadaan')}
                            className="p-1.5 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors"
                            title="Buat Pesanan Cepat (PO PBF)"
                          >
                            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              onShowToast(`Membuka form edit master sediaan: ${drug.code}`, 'edit_note')
                            }
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-tertiary transition-colors"
                            title="Edit Master Data"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit_note</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination & Table Footer */}
        <div className="px-4 py-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-container">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>Menampilkan</span>
            <select className="bg-surface-container-lowest px-2 py-1 rounded text-on-surface font-semibold focus:outline-none border border-surface-container">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>dari total 482 master item obat</span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              disabled
              className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface-variant font-medium border border-surface-container disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px] align-middle">chevron_left</span>
            </button>
            <button className="px-3 py-1 rounded bg-primary text-on-primary font-bold shadow-sm">
              1
            </button>
            <button className="px-3 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container">
              2
            </button>
            <button className="px-3 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container">
              3
            </button>
            <span className="px-1 text-outline">&hellip;</span>
            <button className="px-3 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container">
              49
            </button>
            <button className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container">
              <span className="material-symbols-outlined text-[16px] align-middle">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dual Bottom Panels: SIPNAP Compliance & Storage Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Panel 1: SIPNAP Regulatory Compliance (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-tertiary">
                <span className="material-symbols-outlined text-[22px]">policy</span>
                <span className="font-bold text-sm sm:text-base">
                  Regulasi Pelaporan SIPNAP &amp; Lemari Narkotika/Psikotropika
                </span>
              </div>
              <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded text-[10px] font-bold">
                Permenkes RI No. 3 / 2015
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Seluruh mutasi keluar-masuk 18 item Psikotropika &amp; Prekursor farmasi wajib tercatat dalam
              kartu stok rangkap dan dilaporkan paling lambat tanggal 10 setiap bulannya melalui portal
              resmi Kemenkes SIPNAP.
            </p>

            {/* Compliance Checklist Mini Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container/60 flex flex-col">
                <div className="flex items-center gap-1.5 text-secondary text-xs font-bold mb-1">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Gembok Ganda</span>
                </div>
                <span className="text-xs text-on-surface">Kunci A (APJ) &amp; Kunci B (TTK) dipisah</span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container/60 flex flex-col">
                <div className="flex items-center gap-1.5 text-secondary text-xs font-bold mb-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Log Mutasi Harian</span>
                </div>
                <span className="text-xs text-on-surface">Sinkronisasi 100% dengan resep fisik</span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container/60 flex flex-col">
                <div className="flex items-center gap-1.5 text-tertiary text-xs font-bold mb-1">
                  <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                  <span>Batas Unggah SIPNAP</span>
                </div>
                <span className="text-xs text-on-surface">H-17 Pelaporan Periode Okt</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-surface-container text-xs">
            <span className="text-outline">
              Penanggung Jawab: apt. Rahmawati, S.Farm (SIPA: 19920814/SIPA/2021)
            </span>
            <button
              onClick={() => onNavigate('laporan-pemusnahan')}
              className="text-tertiary font-bold hover:underline flex items-center gap-1"
            >
              <span>Buka Buku Arsip SIPNAP</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Panel 2: Physical Shelf Capacity & Layout Map (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-[22px] text-primary">view_quilt</span>
                <span className="font-bold text-sm sm:text-base">Kapasitas Rak &amp; Cold Storage</span>
              </div>
              <span className="text-xs text-secondary font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> 78% Terisi
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">
              Pemetaan ruang simpan farmasi aktif di Apotek Klinik Jambu Mawar.
            </p>

            {/* Shelf Visualizer Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="p-2.5 bg-surface-container-low rounded-xl border border-surface-container/60 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Rak A (Tablet Generik)</span>
                  <span className="font-mono text-[10px] text-on-surface-variant">4 Tingkat &bull; 32 Sekat</span>
                </div>
                <span className="font-mono text-xs font-bold text-secondary">88%</span>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded-xl border border-surface-container/60 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Rak B (Sirup &amp; Salep)</span>
                  <span className="font-mono text-[10px] text-on-surface-variant">3 Tingkat &bull; 18 Sekat</span>
                </div>
                <span className="font-mono text-xs font-bold text-secondary">65%</span>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded-xl border border-surface-container/60 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Chiller Vaksin (4°C)</span>
                  <span className="font-mono text-[10px] text-on-surface-variant">2 Rak Bio Farma</span>
                </div>
                <span className="font-mono text-xs font-bold text-primary">42%</span>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded-xl border border-surface-container/60 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Lemari Ganda Narko/Psi</span>
                  <span className="font-mono text-[10px] text-on-surface-variant">Baja Tempel Dinding</span>
                </div>
                <span className="font-mono text-xs font-bold text-tertiary">30%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              onShowToast('Membuka denah visual penataan tata letak rak apotek...', 'grid_view')
            }
            className="w-full py-2.5 bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Atur &amp; Konfigurasi Ulang Nomor Rak</span>
          </button>
        </div>
      </div>

      {/* Stock Opname Quick Adjust Modal */}
      {adjustModalDrug && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-on-surface">Penyesuaian Stok Opname Fisik</h3>
              <button
                onClick={() => setAdjustModalDrug(null)}
                className="p-1 rounded-lg text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Sediaan: <strong>{adjustModalDrug.name}</strong> ({adjustModalDrug.code})
            </p>
            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Jumlah Hitung Fisik Sebenarnya ({adjustModalDrug.unit}):
              </label>
              <input
                type="number"
                value={adjustedQty}
                onChange={(e) => setAdjustedQty(Number(e.target.value))}
                min="0"
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface font-mono text-sm border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdjustModalDrug(null)}
                className="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  adjustModalDrug.stockActual = adjustedQty;
                  setAdjustModalDrug(null);
                  onShowToast(
                    `Stok ${adjustModalDrug.name} diperbarui menjadi ${adjustedQty} ${adjustModalDrug.unit}`,
                    'tune'
                  );
                }}
                className="px-4 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-md"
              >
                Simpan Penyesuaian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
