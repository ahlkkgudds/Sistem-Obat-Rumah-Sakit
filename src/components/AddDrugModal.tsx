import React, { useState } from 'react';
import { DrugCategory, DrugItem } from '../types';

interface AddDrugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDrug: (drug: DrugItem) => void;
}

export const AddDrugModal: React.FC<AddDrugModalProps> = ({ isOpen, onClose, onAddDrug }) => {
  const [code, setCode] = useState(`OBT-0${Math.floor(Math.random() * 800 + 100)}`);
  const [barcode, setBarcode] = useState(`899${Math.floor(Math.random() * 9000000000 + 1000000000)}`);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [category, setCategory] = useState<DrugCategory>('Keras');
  const [shelfLocation, setShelfLocation] = useState('Rak A-01');
  const [shelfDetail, setShelfDetail] = useState('Boks 01');
  const [unit, setUnit] = useState('Tablet');
  const [bufferMin, setBufferMin] = useState(50);
  const [stockActual, setStockActual] = useState(100);
  const [buyPrice, setBuyPrice] = useState(1500);
  const [sellPrice, setSellPrice] = useState(2500);
  const [isSipnap, setIsSipnap] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDrug: DrugItem = {
      id: code,
      code,
      barcode,
      name,
      dosage: dosage || 'Sediaan Standar Farmasi',
      category,
      shelfLocation,
      shelfDetail,
      unit,
      bufferMin: Number(bufferMin),
      stockActual: Number(stockActual),
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      status: Number(stockActual) === 0 ? 'Habis' : Number(stockActual) < Number(bufferMin) ? 'Stok Kritis' : 'Tersedia',
      isSipnap,
    };

    onAddDrug(newDrug);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-surface-container max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[24px]">medication</span>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-on-surface">
                Registrasi Master Obat &amp; Alkes Baru
              </h3>
              <p className="text-xs text-on-surface-variant">
                Formularium Farmasi Klinik Pratama Jambu Mawar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kode Obat */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Kode Obat (Auto/Manual)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="h-10 px-3 bg-surface-container-low rounded-xl text-on-surface font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
              />
            </div>

            {/* Barcode SKU */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Nomor Barcode / EAN-13</label>
              <div className="relative">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan atau ketik barcode..."
                  className="w-full h-10 pl-3 pr-10 bg-surface-container-low rounded-xl text-on-surface font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[20px] text-primary">
                  barcode_scanner
                </span>
              </div>
            </div>

            {/* Nama Obat */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">
                Nama Obat &amp; Dosis Lengkap <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Amoxicillin Trihydrate 500 mg Kaplet"
                required
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
              />
            </div>

            {/* Bentuk Sediaan / Keterangan */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Komposisi &amp; Deskripsi Sediaan</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Contoh: Generik • Dus 10x10 Tablet Salut Selaput"
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
              />
            </div>

            {/* Golongan Obat */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Golongan Obat</label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value as DrugCategory;
                  setCategory(val);
                  if (val === 'Psikotropika') setIsSipnap(true);
                }}
                className="h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container cursor-pointer"
              >
                <option value="Bebas">Obat Bebas (Lingkaran Hijau)</option>
                <option value="Terbatas">Obat Bebas Terbatas (Lingkaran Biru)</option>
                <option value="Keras">Obat Keras (Lingkaran Merah K)</option>
                <option value="Psikotropika">Psikotropika &amp; Prekursor (Diawasi Ketat)</option>
                <option value="Alkes">Alat Kesehatan &amp; BHP</option>
              </select>
            </div>

            {/* Lokasi Rak Penyimpanan */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Posisi Simpan (Rak / Chiller)</label>
              <select
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                className="h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container cursor-pointer"
              >
                <option value="Rak A-01">Rak A-01 (Tablet Generik Utama)</option>
                <option value="Rak A-02">Rak A-02 (Analgetik &amp; Antipiretik)</option>
                <option value="Rak A-03">Rak A-03 (Antibiotik &amp; Antidiabetik)</option>
                <option value="Rak B-01">Rak B-01 (Sediaan Suspensi / Sirup)</option>
                <option value="Rak B-02">Rak B-02 (Ampul &amp; Tetes Mata)</option>
                <option value="Kulkas Chiller">Kulkas Cold Storage (2-8°C)</option>
                <option value="Lemari Ganda">Lemari Ganda Narkotika/Psikotropika (Gembok)</option>
                <option value="Rak C-01">Rak C-01 (Alkes Tindakan &amp; Spuit)</option>
              </select>
            </div>

            {/* Satuan Terkecil */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Satuan Terkecil</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container cursor-pointer"
              >
                <option>Tablet</option>
                <option>Kaplet</option>
                <option>Kapsul</option>
                <option>Strip</option>
                <option>Botol</option>
                <option>Vial</option>
                <option>Ampul</option>
                <option>Pcs</option>
                <option>Kolf</option>
                <option>Box</option>
              </select>
            </div>

            {/* Stok Buffer Minimum */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Ambang Minimum Buffer Stok</label>
              <input
                type="number"
                value={bufferMin}
                onChange={(e) => setBufferMin(Number(e.target.value))}
                min="1"
                required
                className="h-10 px-3 bg-surface-container-low rounded-xl text-on-surface font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
              />
            </div>

            {/* Stok Awal Fisik */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Jumlah Stok Awal Fisik</label>
              <input
                type="number"
                value={stockActual}
                onChange={(e) => setStockActual(Number(e.target.value))}
                min="0"
                required
                className="h-10 px-3 bg-surface-container-low rounded-xl text-on-surface font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
              />
            </div>

            {/* Posisi Sekat */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Detail Sekat / Boks</label>
              <input
                type="text"
                value={shelfDetail}
                onChange={(e) => setShelfDetail(e.target.value)}
                placeholder="Contoh: Boks 04"
                className="h-10 px-3 bg-surface-container-low rounded-xl text-on-surface text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
              />
            </div>

            {/* Harga Beli */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Harga Beli Satuan (HPP)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-outline">
                  Rp
                </span>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(Number(e.target.value))}
                  min="0"
                  required
                  className="w-full h-10 pl-9 pr-3 bg-surface-container-low rounded-xl text-on-surface font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>
            </div>

            {/* Harga Jual Netto */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Harga Jual Apotek (HJA)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-outline">
                  Rp
                </span>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                  min="0"
                  required
                  className="w-full h-10 pl-9 pr-3 bg-surface-container-low rounded-xl text-on-surface font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>
            </div>
          </div>

          {/* Checkbox SIPNAP / Regulasi */}
          <label className="flex items-start gap-2.5 p-3 bg-surface-container-low rounded-xl cursor-pointer border border-surface-container mt-1">
            <input
              type="checkbox"
              checked={isSipnap}
              onChange={(e) => setIsSipnap(e.target.checked)}
              className="mt-0.5 rounded text-primary focus:ring-0 accent-primary"
            />
            <span className="text-xs text-on-surface leading-tight">
              <strong>Wajibkan pelaporan bulanan SIPNAP</strong> untuk sediaan ini (Wajib dicentang
              jika sediaan mengandung Narkotika, Psikotropika, atau Prekursor farmasi sesuai
              Permenkes No. 3/2015).
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs sm:text-sm font-semibold hover:bg-surface-container-high transition-colors"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-md hover:bg-primary-container transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan Master Data Obat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
