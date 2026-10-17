import React, { useState } from 'react';
import { QuarantineRecord } from '../types';

interface LaporanBeritaAcaraViewProps {
  quarantineRecords: QuarantineRecord[];
  onShowToast: (message: string, icon?: string) => void;
}

export const LaporanBeritaAcaraView: React.FC<LaporanBeritaAcaraViewProps> = ({
  quarantineRecords,
  onShowToast,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<QuarantineRecord>(quarantineRecords[0]);

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Title */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60">
        <div>
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>ARSIP HUKUM &amp; KEPATUHAN FARMASI BPOM / DINKES</span>
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-on-surface">
            Laporan Resmi &amp; Berita Acara Karantina / Pemusnahan
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Dokumentasi sah penarikan batch, pemusnahan obat kedaluwarsa, dan kepatuhan pelaporan
            SIPNAP Kemenkes.
          </p>
        </div>

        <button
          onClick={() => onShowToast('Mengekspor seluruh arsip Berita Acara ke file ZIP...', 'download')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs sm:text-sm shadow-md hover:bg-primary-container transition-all self-start xl:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          <span>Unduh Semua Berita Acara</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Records (4 cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col gap-3">
          <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Daftar Dokumen Karantina ({quarantineRecords.length})
          </span>

          <div className="flex flex-col gap-2">
            {quarantineRecords.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRecord(r)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRecord?.id === r.id
                    ? 'bg-primary/5 border-primary shadow-sm'
                    : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-primary">{r.docNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error-container text-on-error-container">
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-on-surface font-semibold mt-1 truncate">{r.reason}</p>
                <span className="text-[11px] text-outline block mt-0.5">{r.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Preview Certificate (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col gap-5">
          {selectedRecord ? (
            <div className="flex flex-col gap-5">
              {/* Header Letterhead */}
              <div className="flex items-center justify-between border-b-2 border-on-surface pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold">
                    <span className="material-symbols-outlined text-[28px]">local_hospital</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-base sm:text-lg text-on-surface tracking-wide uppercase">
                      KLINIK PRATAMA JAMBU MAWAR
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Instalasi Farmasi &amp; Pengelolaan Obat &bull; SIPA APJ: {selectedRecord.apjSipa}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-outline">FORMULIR BPOM</span>
                  <span className="block font-mono text-[11px] text-outline">LAMPIRAN IX PMK 73/2016</span>
                </div>
              </div>

              {/* Title Document */}
              <div className="text-center my-2">
                <h3 className="font-extrabold text-base sm:text-lg text-on-surface tracking-wide uppercase underline">
                  BERITA ACARA KARANTINA &amp; PENARIKAN OBAT
                </h3>
                <span className="font-mono text-xs font-bold text-on-surface-variant block mt-1">
                  Nomor: {selectedRecord.docNumber}
                </span>
              </div>

              {/* Body Statement */}
              <div className="text-xs sm:text-sm text-on-surface leading-relaxed flex flex-col gap-3">
                <p>
                  Pada hari ini, tanggal <strong>{selectedRecord.date}</strong>, bertempat di
                  Instalasi Farmasi Klinik Pratama Jambu Mawar, yang bertanda tangan di bawah ini:
                </p>

                <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex flex-col gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-outline">Nama Apoteker:</span>
                    <strong className="text-on-surface">{selectedRecord.apjName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">SIPA:</span>
                    <span className="font-mono">{selectedRecord.apjSipa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Jabatan:</span>
                    <span>Apoteker Penanggung Jawab (APJ)</span>
                  </div>
                </div>

                <p>
                  Telah melakukan pemeriksaan fisik, penguncian sistem SIMRS, dan penarikan sediaan obat
                  rusak/kedaluwarsa menuju <strong>{selectedRecord.shelfLocation}</strong> dengan rincian
                  berikut:
                </p>

                {/* Items Table */}
                <div className="border border-surface-container rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-container font-bold text-on-surface-variant">
                        <th className="p-2.5">No</th>
                        <th className="p-2.5">Nama Sediaan Obat</th>
                        <th className="p-2.5">No. Batch</th>
                        <th className="p-2.5 text-right">Jumlah Fisik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {selectedRecord.items.map((it, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-mono text-outline">{i + 1}</td>
                          <td className="p-2.5 font-bold text-on-surface">{it.drugName}</td>
                          <td className="p-2.5 font-mono text-error font-semibold">{it.batchNumber}</td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            {it.qty} {it.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-on-surface-variant mt-1">
                  Catatan: <em>{selectedRecord.notes}</em>
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 mt-4 border-t border-surface-container text-xs text-center">
                <div className="flex flex-col items-center justify-between h-28">
                  <span>Petugas Saksi / TTK</span>
                  <div className="border-b border-on-surface w-36 pt-12">
                    <span className="font-semibold text-on-surface">apt. Nurul Huda, S.Farm</span>
                  </div>
                  <span className="text-[10px] text-outline">Tenaga Teknis Kefarmasian</span>
                </div>

                <div className="flex flex-col items-center justify-between h-28">
                  <span>Apoteker Penanggung Jawab</span>
                  <div className="border-b border-on-surface w-36 pt-12">
                    <span className="font-bold text-primary">apt. Rahmawati, S.Farm</span>
                  </div>
                  <span className="text-[10px] text-outline">SIPA: 19890214/SIPA-31.71/2021</span>
                </div>
              </div>

              {/* Print Action */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() =>
                    onShowToast(`Mencetak Dokumen Resmi ${selectedRecord.docNumber}...`, 'print')
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold shadow-md hover:bg-primary-container transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Cetak Berita Acara Fisik</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-outline text-xs">Pilih dokumen berita acara</div>
          )}
        </div>
      </div>
    </div>
  );
};
