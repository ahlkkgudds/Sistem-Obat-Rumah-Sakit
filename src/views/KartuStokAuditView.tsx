import React, { useState } from 'react';
import { DrugItem } from '../types';

interface KartuStokAuditViewProps {
  drugs: DrugItem[];
  onShowToast: (message: string, icon?: string) => void;
}

export const KartuStokAuditView: React.FC<KartuStokAuditViewProps> = ({ drugs, onShowToast }) => {
  const [selectedDrugId, setSelectedDrugId] = useState(drugs[0]?.id || '');
  const drug = drugs.find((d) => d.id === selectedDrugId) || drugs[0];

  const stockMovements = [
    {
      date: '24 Okt 2024, 09:18 WIB',
      docRef: 'FAK-2024/KF-X10492',
      type: 'Masuk (Faktur PBF)',
      qtyIn: 100,
      qtyOut: 0,
      balance: drug ? drug.stockActual : 420,
      batch: 'CPX24A09',
      pic: 'apt. Rahmawati',
    },
    {
      date: '23 Okt 2024, 14:10 WIB',
      docRef: 'RXP-2024-8812',
      type: 'Keluar (Resep Poli)',
      qtyIn: 0,
      qtyOut: 10,
      balance: (drug ? drug.stockActual : 420) - 10,
      batch: 'CPX24A09',
      pic: 'apt. Rahmawati',
    },
    {
      date: '22 Okt 2024, 11:30 WIB',
      docRef: 'BAK-KJM/2024/X/0029',
      type: 'Karantina Fisik (ED)',
      qtyIn: 0,
      qtyOut: 14,
      balance: (drug ? drug.stockActual : 420) - 24,
      batch: 'BT-2023-ABX09',
      pic: 'apt. Rahmawati',
    },
    {
      date: '20 Okt 2024, 08:00 WIB',
      docRef: 'SO-Q4-KJM-01',
      type: 'Saldo Awal Audit',
      qtyIn: 444,
      qtyOut: 0,
      balance: 444,
      batch: 'MULTI-BATCH',
      pic: 'Tim Audit Farmasi',
    },
  ];

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Title */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60">
        <div>
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">fact_check</span>
            <span>BUKU BESAR MUTASI &amp; AUDIT OPNAME FISIK</span>
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-on-surface">
            Kartu Stok &amp; Audit Opname Farmasi
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Pencatatan mutasi kartu stok rangkap digital sesuai standar Permenkes 73/2016 dan verifikasi
            selisih fisik per kuartal.
          </p>
        </div>

        <button
          onClick={() => onShowToast('Mengekspor kartu stok ke format PDF siap cetak...', 'print')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs sm:text-sm transition-all border border-surface-container shadow-sm self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          <span>Cetak Kartu Stok</span>
        </button>
      </div>

      {/* Drug Picker */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <span className="text-xs font-semibold text-on-surface whitespace-nowrap">
            Pilih Sediaan Farmasi:
          </span>
          <select
            value={selectedDrugId}
            onChange={(e) => setSelectedDrugId(e.target.value)}
            className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs font-bold border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {drugs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name} ({d.category})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex flex-col text-right">
            <span className="text-outline">Saldo Tercatat di Sistem:</span>
            <span className="font-mono font-bold text-sm text-primary">
              {drug?.stockActual} {drug?.unit}
            </span>
          </div>
          <div className="flex flex-col text-right pl-3 border-l border-surface-container">
            <span className="text-outline">Lokasi Rak:</span>
            <span className="font-bold text-on-surface">
              {drug?.shelfLocation} ({drug?.shelfDetail})
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container/60 overflow-hidden">
        <div className="px-5 py-3.5 bg-surface-container-low flex justify-between items-center border-b border-surface-container">
          <span className="font-bold text-xs sm:text-sm text-on-surface">
            Buku Mutasi Keluar - Masuk: {drug?.name}
          </span>
          <span className="text-xs text-secondary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            SINKRONISASI 100%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal &amp; Waktu</th>
                <th className="py-3 px-4">No. Dokumen / Ref</th>
                <th className="py-3 px-4">Jenis Mutasi</th>
                <th className="py-3 px-4">No. Batch</th>
                <th className="py-3 px-4 text-right">Masuk (+)</th>
                <th className="py-3 px-4 text-right">Keluar (-)</th>
                <th className="py-3 px-4 text-right">Sisa Saldo</th>
                <th className="py-3 px-4 text-center">Petugas (APJ)</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm text-on-surface divide-y divide-surface-container/60">
              {stockMovements.map((m, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3 px-4 text-on-surface-variant font-mono text-xs">{m.date}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-primary">{m.docRef}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.type.includes('Masuk')
                          ? 'bg-secondary-container text-on-secondary-container'
                          : m.type.includes('Karantina')
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-surface-container text-on-surface'
                      }`}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">{m.batch}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-secondary">
                    {m.qtyIn > 0 ? `+${m.qtyIn}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-error">
                    {m.qtyOut > 0 ? `-${m.qtyOut}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-on-surface">
                    {m.balance}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-outline">{m.pic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
