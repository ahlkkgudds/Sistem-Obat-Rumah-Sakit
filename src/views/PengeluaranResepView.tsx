import React, { useState } from 'react';
import { BatchItem, DrugItem } from '../types';

interface PengeluaranResepViewProps {
  drugs: DrugItem[];
  batches: BatchItem[];
  onShowToast: (message: string, icon?: string) => void;
  onDispense: (drugId: string, batchId: string, qty: number) => void;
}

export const PengeluaranResepView: React.FC<PengeluaranResepViewProps> = ({
  drugs,
  batches,
  onShowToast,
  onDispense,
}) => {
  const [selectedDrugId, setSelectedDrugId] = useState(drugs[0]?.id || '');
  const [dispenseQty, setDispenseQty] = useState(1);
  const [patientName, setPatientName] = useState('Bpk. Supriyanto (No. RM: 09-88-21)');
  const [doctorName, setDoctorName] = useState('dr. H. Prasetyo, Sp.PD');
  const [rxNotes, setRxNotes] = useState('3x1 sehari sesudah makan (habiskan)');

  const selectedDrug = drugs.find((d) => d.id === selectedDrugId) || drugs[0];

  // Eligible batches for this drug sorted strictly by FEFO (earliest expiry first, excluding expired/locked)
  const drugBatches = batches
    .filter((b) => b.drugName.toLowerCase().includes(selectedDrug?.name.toLowerCase()) || selectedDrug?.name.toLowerCase().includes(b.drugName.toLowerCase()))
    .sort((a, b) => a.remainingDays - b.remainingDays);

  const bestFefoBatch = drugBatches.find((b) => !b.isLocked && b.status !== 'expired' && b.stock >= dispenseQty);

  const handleExecuteDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bestFefoBatch) {
      onShowToast('Tidak ada batch yang memenuhi syarat FEFO & stok tidak mencukupi!', 'error');
      return;
    }

    onDispense(selectedDrug.id, bestFefoBatch.id, dispenseQty);
    onShowToast(
      `Resep berhasil dilayani: ${dispenseQty} ${selectedDrug.unit} ${selectedDrug.name} dialokasikan dari Batch FEFO: ${bestFefoBatch.batchNumber}`,
      'check_circle'
    );
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Title */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60">
        <div>
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>DISPENSING POLIKLINIK &amp; ALOKASI FEFO OTOMATIS</span>
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-on-surface">
            Pengeluaran Resep &amp; Simulasi Rotasi FEFO
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Sistem secara otomatis mengunci batch terdekat (First-Expired First-Out) dan memblokir
            sediaan kedaluwarsa atau dalam karantina.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col gap-4">
          <h2 className="font-bold text-sm sm:text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">prescriptions</span>
            Input e-Resep Pasien Rawat Jalan
          </h2>

          <form onSubmit={handleExecuteDispense} className="flex flex-col gap-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-on-surface block mb-1">Identitas Pasien &amp; No. RM</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">Dokter Penulis Resep</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-on-surface block mb-1">Pilih Item Sediaan Obat</label>
                <select
                  value={selectedDrugId}
                  onChange={(e) => setSelectedDrugId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-semibold"
                >
                  {drugs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name} ({d.category} - Stok: {d.stockActual} {d.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Jumlah yang Dikeluarkan ({selectedDrug?.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedDrug?.stockActual || 100}
                  value={dispenseQty}
                  onChange={(e) => setDispenseQty(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-mono text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">Signa / Aturan Pakai</label>
                <input
                  type="text"
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* FEFO Algorithm Suggestion Box */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-primary/20 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Rekomendasi Algoritma FEFO Sistem:
              </span>
              {bestFefoBatch ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-surface-container-lowest rounded-lg border border-surface-container">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface text-xs sm:text-sm">
                      Batch: <code className="font-mono text-primary font-bold">{bestFefoBatch.batchNumber}</code>
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Rak: {bestFefoBatch.location} &bull; Sisa Hari: {bestFefoBatch.remainingText}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-2 py-0.5 rounded-full">
                      Tersedia: {bestFefoBatch.stock} {bestFefoBatch.unit}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-error-container/20 rounded-lg text-xs text-error font-medium">
                  Tidak ditemukan batch aktif yang dapat dilayani untuk sediaan ini.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!bestFefoBatch}
              className="py-3 px-5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Layani Resep &amp; Kurangi Stok FEFO
            </button>
          </form>
        </div>

        {/* Right Panel: Batch Allocation Details (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col gap-4">
          <h2 className="font-bold text-sm sm:text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">sort</span>
            Urutan Antrean FEFO di Apotek
          </h2>
          <p className="text-xs text-on-surface-variant">
            Daftar seluruh batch aktif untuk <strong>{selectedDrug?.name}</strong> diurutkan dari yang
            paling cepat kedaluwarsa:
          </p>

          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {drugBatches.map((b, idx) => {
              const isExpired = b.status === 'expired' || b.isLocked;
              return (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border flex flex-col gap-1 ${
                    isExpired
                      ? 'bg-error-container/20 border-error/30 opacity-75'
                      : idx === 0
                      ? 'bg-secondary-container/20 border-secondary'
                      : 'bg-surface-container-low border-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-on-surface">
                      #{idx + 1} {b.batchNumber}
                    </span>
                    {isExpired ? (
                      <span className="bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">lock</span> DIKUNCI / ED
                      </span>
                    ) : idx === 0 ? (
                      <span className="bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        PRIORITAS FEFO #1
                      </span>
                    ) : (
                      <span className="text-[10px] text-outline font-mono">Antrean #{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>ED: {b.expiryDisplay}</span>
                    <span>Stok: {b.stock} {b.unit}</span>
                  </div>
                  <span className="text-[11px] text-outline">Lokasi: {b.location}</span>
                </div>
              );
            })}
            {drugBatches.length === 0 && (
              <div className="p-4 bg-surface-container-low rounded-xl text-center text-xs text-outline">
                Tidak ada data batch tersimpan untuk obat ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
