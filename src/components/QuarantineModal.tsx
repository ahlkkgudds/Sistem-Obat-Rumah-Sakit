import React, { useState } from 'react';
import { BatchItem, QuarantineRecord } from '../types';

interface QuarantineModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBatches: BatchItem[];
  onSubmit: (record: QuarantineRecord) => void;
}

export const QuarantineModal: React.FC<QuarantineModalProps> = ({
  isOpen,
  onClose,
  selectedBatches,
  onSubmit,
}) => {
  const [docNumber] = useState(`BAK-KJM/2024/X/00${Math.floor(Math.random() * 90 + 10)}`);
  const [reason, setReason] = useState('Kedaluwarsa (Telah Melampaui Tanggal ED)');
  const [shelfLocation, setShelfLocation] = useState('Lemari Karantina Bawah G-01, Terkunci (Gembok Merah #04)');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: QuarantineRecord = {
      id: `QREC-${Date.now()}`,
      docNumber,
      date: new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()) + ' WIB',
      apjName: 'apt. Rahmawati, S.Farm',
      apjSipa: '19890214/SIPA-31.71/2021/2012',
      reason,
      shelfLocation,
      items: selectedBatches.map((b) => ({
        drugName: b.drugName,
        batchNumber: b.batchNumber,
        qty: b.stock,
        unit: b.unit,
      })),
      notes: notes || 'Telah diverifikasi fisik dan dipindahkan ke lemari karantina berlabel khusus.',
      status: 'Terkunci di Lemari Karantina',
    };
    onSubmit(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 border border-surface-container max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-surface-container">
          <div className="flex items-center gap-2 text-error">
            <span className="material-symbols-outlined text-[24px]">assignment_late</span>
            <h3 className="font-bold text-base sm:text-lg text-on-surface">
              Buat Berita Acara Karantina Fisik
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Formulir resmi penarikan obat kedaluwarsa dari rak dispenser menuju Lemari Karantina
          Terkunci untuk isolasi fisik dan persiapan pemusnahan resmi sesuai Permenkes 73/2016.
        </p>

        {/* Selected batches preview */}
        <div className="p-3 rounded-xl bg-error-container/20 border border-error-container/40">
          <span className="text-[11px] font-bold text-error uppercase tracking-wider block mb-1.5">
            Daftar Batch yang Akan Dikunci ({selectedBatches.length} Item):
          </span>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
            {selectedBatches.map((b) => (
              <div key={b.id} className="flex justify-between text-xs py-0.5 border-b border-error/10 last:border-0">
                <span className="font-medium text-on-surface truncate max-w-[200px]">{b.drugName}</span>
                <span className="font-mono text-error font-semibold shrink-0">
                  {b.batchNumber} ({b.stock} {b.unit})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Nomor Dokumen Karantina
            </label>
            <input
              type="text"
              value={docNumber}
              readOnly
              className="w-full h-10 px-3 bg-surface-container rounded-xl font-mono text-xs sm:text-sm text-on-surface font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Apoteker Penanggung Jawab (APJ)
            </label>
            <input
              type="text"
              value="apt. Rahmawati, S.Farm (SIPA: 19890214/SIPA-31.71/2021/2012)"
              readOnly
              className="w-full h-10 px-3 bg-surface-container rounded-xl text-xs text-on-surface focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Alasan Karantina
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
            >
              <option>Kedaluwarsa (Telah Melampaui Tanggal ED)</option>
              <option>Kemasan Rusak / Diskolorasi / Endapan</option>
              <option>Penarikan Pabrik (Mandatory Batch Recall BPOM)</option>
              <option>Kegagalan Rantai Dingin / Freeze Indicator Terbuka</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Lokasi Lemari Karantina Fisik
            </label>
            <input
              type="text"
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              placeholder="Contoh: Lemari Karantina Bawah G-01, Terkunci"
              className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Catatan Khusus Tindak Lanjut
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Menunggu jadwal pemusnahan bersama BPOM & Dinkes..."
              className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs sm:text-sm font-semibold hover:bg-surface-container-high transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-error text-on-error text-xs sm:text-sm font-semibold hover:bg-error/90 transition-colors shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Terbitkan &amp; Kunci Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
