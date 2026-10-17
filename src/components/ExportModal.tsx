import React from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'Excel' | 'PDF') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 border border-surface-container">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-surface-container">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[24px]">file_download</span>
            <h3 className="font-bold text-base sm:text-lg text-on-surface">
              Ekspor Laporan Kedaluwarsa
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
          Pilih format berkas untuk laporan audit SIK (Sistem Informasi Klinis), rotasi FEFO, dan
          arsip kepatuhan Dinas Kesehatan / BPOM.
        </p>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 my-1">
          <button
            onClick={() => onExport('Excel')}
            className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container flex flex-col items-center gap-2 text-center group transition-all"
          >
            <span className="material-symbols-outlined text-secondary text-[36px] group-hover:scale-110 transition-transform">
              table_chart
            </span>
            <span className="font-semibold text-xs sm:text-sm text-on-surface">
              Format Excel (.xlsx)
            </span>
            <span className="text-[11px] text-outline">Lengkap dengan formula estimasi rugi</span>
          </button>

          <button
            onClick={() => onExport('PDF')}
            className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container flex flex-col items-center gap-2 text-center group transition-all"
          >
            <span className="material-symbols-outlined text-error text-[36px] group-hover:scale-110 transition-transform">
              picture_as_pdf
            </span>
            <span className="font-semibold text-xs sm:text-sm text-on-surface">
              Format PDF Berita Acara
            </span>
            <span className="text-[11px] text-outline">Siap cetak &amp; tanda tangan APJ</span>
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-surface-container">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-outline hover:text-on-surface text-xs sm:text-sm font-semibold hover:bg-surface-container transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
