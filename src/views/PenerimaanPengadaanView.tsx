import React, { useState, useMemo } from 'react';
import { BatchItem, DrugItem, ProcurementItem } from '../types';

interface PenerimaanPengadaanViewProps {
  onShowToast: (message: string, icon?: string) => void;
  onAddNewBatch: (batch: BatchItem) => void;
  drugs: DrugItem[];
}

export const PenerimaanPengadaanView: React.FC<PenerimaanPengadaanViewProps> = ({
  onShowToast,
  onAddNewBatch,
  drugs,
}) => {
  const [invoiceNo, setInvoiceNo] = useState('FAK-2024/KF-X10492');
  const [distributor, setDistributor] = useState('PT Kimia Farma Trading & Distribution');
  const [invoiceDate, setInvoiceDate] = useState('2024-10-23');
  const [receiveDateTime, setReceiveDateTime] = useState('2024-10-24T09:15');
  const [spNumber, setSpNumber] = useState('SP/JM-FAR/2024/10-089');
  const [paymentTerm, setPaymentTerm] = useState<'net30' | 'net14' | 'cod'>('net30');
  const [notes, setNotes] = useState('');

  // QC Checkboxes
  const [qcTemp, setQcTemp] = useState(true);
  const [qcPackage, setQcPackage] = useState(true);
  const [qcInvoice, setQcInvoice] = useState(true);

  // Dynamic Item Rows
  const [items, setItems] = useState<ProcurementItem[]>([
    {
      id: 'item-1',
      drugName: 'Ciprofloxacin 500mg Kaplet',
      code: 'GEN-CPR-500 • Generik OGB',
      batchNumber: 'CPX24A09',
      expiryDate: '2026-10-14',
      qty: 100,
      unit: 'Box (@10 Strip)',
      discountPercent: 5,
      isPpn: true,
      pricePerUnit: 65000,
      subtotal: 6175000,
    },
    {
      id: 'item-2',
      drugName: 'Paracetamol Sirup 120mg/5ml (60ml)',
      code: 'PED-PCT-060 • Botol Kaca',
      batchNumber: 'PCT-S881',
      expiryDate: '2026-08-20',
      qty: 50,
      unit: 'Botol',
      discountPercent: 0,
      isPpn: true,
      pricePerUnit: 18500,
      subtotal: 925000,
    },
    {
      id: 'item-3',
      drugName: 'Amoxicillin 500mg Kapsul',
      code: 'GEN-AMX-500 • Dus 10x10',
      batchNumber: 'AMX24089',
      expiryDate: '2027-02-15',
      qty: 40,
      unit: 'Box (@10 Strip)',
      discountPercent: 2.5,
      isPpn: true,
      pricePerUnit: 48000,
      subtotal: 1872000,
    },
  ]);

  // Warning for short ED
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Check if any row has expiry < 18 months
  const checkExpiryValidation = (dateStr: string, drugName: string) => {
    if (!dateStr) return;
    const expDate = new Date(dateStr);
    const now = new Date();
    const diffMonths =
      (expDate.getFullYear() - now.getFullYear()) * 12 + (expDate.getMonth() - now.getMonth());

    if (diffMonths < 18) {
      setWarningMessage(
        `Peringatan: Item "${drugName}" memiliki masa simpan hanya ${Math.max(
          0,
          diffMonths
        )} bulan (di bawah standar minimal 18 bulan klinik Jambu Mawar). Diperlukan otorisasi khusus tertulis APJ.`
      );
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  const handleUpdateItem = (id: string, field: keyof ProcurementItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'pricePerUnit' || field === 'discountPercent') {
          const gross = Number(updated.qty) * Number(updated.pricePerUnit);
          const disc = gross * (Number(updated.discountPercent) / 100);
          updated.subtotal = gross - disc;
        }

        if (field === 'expiryDate') {
          checkExpiryValidation(value, updated.drugName);
        }

        return updated;
      })
    );
  };

  const handleAddRow = () => {
    const newItem: ProcurementItem = {
      id: `item-${Date.now()}`,
      drugName: 'Metformin HCl 500mg',
      code: 'GEN-MET-500 • Generik OGB',
      batchNumber: `MTF${Math.floor(Math.random() * 899 + 100)}`,
      expiryDate: '2026-12-31',
      qty: 20,
      unit: 'Box',
      discountPercent: 0,
      isPpn: true,
      pricePerUnit: 35000,
      subtotal: 700000,
    };
    setItems((prev) => [...prev, newItem]);
    onShowToast('Baris obat baru ditambahkan ke faktur.', 'add_circle');
  };

  const handleDeleteRow = (id: string) => {
    if (items.length <= 1) {
      onShowToast('Faktur minimal harus memiliki 1 baris item obat!', 'warning');
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    onShowToast('Baris item dihapus dari draf faktur.', 'delete');
  };

  // Financial Calculations
  const calculations = useMemo(() => {
    let subtotalBruto = 0;
    let totalDiscount = 0;
    let totalTaxable = 0;
    let totalQty = 0;

    items.forEach((item) => {
      const gross = item.qty * item.pricePerUnit;
      const disc = gross * (item.discountPercent / 100);
      const net = gross - disc;

      subtotalBruto += gross;
      totalDiscount += disc;
      totalQty += Number(item.qty);

      if (item.isPpn) {
        totalTaxable += net;
      }
    });

    const dpp = subtotalBruto - totalDiscount;
    const ppnAmount = totalTaxable * 0.11;
    const materai = dpp > 5000000 ? 10000 : 0;
    const grandTotal = dpp + ppnAmount + materai;

    return {
      subtotalBruto,
      totalDiscount,
      dpp,
      ppnAmount,
      materai,
      grandTotal,
      totalQty,
    };
  }, [items]);

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  };

  // Submit and Sync to Stock
  const handleSaveAndSyncStock = () => {
    if (!qcTemp || !qcPackage || !qcInvoice) {
      onShowToast('Wajib melengkapi seluruh cek fisik QC sebelum sinkronisasi!', 'gpp_bad');
      return;
    }

    // Add each item to batch list
    items.forEach((item) => {
      const exp = new Date(item.expiryDate);
      const now = new Date();
      const remainingDays = Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const newBatch: BatchItem = {
        id: `batch-${Date.now()}-${Math.random()}`,
        drugName: item.drugName,
        dosageForm: `${item.unit} • Masuk dari Faktur ${invoiceNo}`,
        location: 'Gudang Utama (Rak Masuk)',
        batchNumber: item.batchNumber,
        bpomReg: 'GKL' + Math.floor(Math.random() * 8999999 + 1000000) + 'A1',
        expiryDate: item.expiryDate,
        expiryDisplay: new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(exp),
        remainingDays,
        remainingText: `${remainingDays} Hari Lagi`,
        stock: item.qty,
        unit: item.unit,
        unitPrice: Math.round(item.pricePerUnit * 1.11),
        potentialLoss: Math.round(item.subtotal * 1.11),
        category: 'Injeksi',
        status: remainingDays < 0 ? 'expired' : remainingDays < 30 ? 'critical' : remainingDays < 90 ? 'warning' : 'safe',
        recommendation: remainingDays < 30 ? 'Dispensir Cepat (FEFO)' : 'Stok Aman Normal',
        recommendationType: remainingDays < 30 ? 'priority' : 'safe',
        isLocked: false,
      };

      onAddNewBatch(newBatch);
    });

    onShowToast(
      `Penerimaan Faktur ${invoiceNo} berhasil disinkronkan ke kartu stok farmasi!`,
      'task_alt'
    );
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header Section with Action Ribbon */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-outline text-xs uppercase tracking-wider flex-wrap">
            <span>Pengadaan Logistik</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Penerimaan Faktur PBF</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold">
              REG-FKT-2024-X41
            </span>
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-on-surface">
            Penerimaan Pengadaan Obat &amp; Input Faktur PBF
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Verifikasi fisik kargo medis, pencatatan nomor batch produsen, dan sinkronisasi otomatis
            kartu stok farmasi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onShowToast('Membuka arsip Surat Pesanan (SP) terbit...', 'history')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs sm:text-sm font-semibold hover:bg-surface-container-high transition-all shadow-sm border border-surface-container/60"
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">
              history_toggle_off
            </span>
            <span>Riwayat SP &amp; Arsip</span>
          </button>
          <button
            onClick={() => onShowToast('Draf formulir tersimpan di penyimpanan lokal.', 'draft')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-low text-on-surface-variant text-xs sm:text-sm font-semibold hover:bg-surface-container transition-all shadow-sm border border-surface-container/60"
          >
            <span className="material-symbols-outlined text-[18px]">draft</span>
            <span>Draf Tersimpan (3)</span>
          </button>
          <button
            onClick={handleSaveAndSyncStock}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs sm:text-sm font-bold transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            <span>Simpan &amp; Masukkan ke Stok</span>
          </button>
        </div>
      </div>

      {/* Clinical SOP Warning Ribbon */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-4 sm:p-5 shadow-sm border border-surface-container/60">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-primary font-bold uppercase tracking-wide">
                SOP Penerimaan Obat Standar Farmasi Jambu Mawar
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                Regulasi Aktif 2024
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface leading-relaxed mt-0.5">
              Pastikan tanggal kedaluwarsa (ED){' '}
              <strong className="text-primary font-bold">minimal 18 bulan</strong> sejak tanggal
              penerimaan fisik sesuai kebijakan mutu farmasi Klinik Pratama Jambu Mawar, kecuali
              jika terdapat surat rekomendasi &amp; persetujuan khusus tertulis dari Apoteker
              Penanggung Jawab (APJ).
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 pl-4 shrink-0 text-xs">
            <span className="material-symbols-outlined text-outline text-[18px]">info</span>
            <span className="font-mono text-outline">SK-APOTEK-JM/VIII/2024</span>
          </div>
        </div>
      </div>

      {/* Form Section: Split Dual Panel for Invoice & Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Invoice & Distributor Metadata (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60">
          <div className="flex items-center justify-between pb-1 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">description</span>
              <h2 className="font-bold text-sm sm:text-base text-on-surface">
                Identitas Faktur PBF &amp; Pengadaan
              </h2>
            </div>
            <span className="font-mono text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md font-semibold">
              Tahap 1 dari 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            {/* Nomor Faktur */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-on-surface-variant flex items-center justify-between">
                <span>Nomor Faktur PBF <span className="text-error">*</span></span>
                <span className="text-outline font-mono text-[10px]">Cetak Fisik</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  tag
                </span>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-on-surface font-mono text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>
            </div>

            {/* Distributor / PBF Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-on-surface-variant">
                Nama Distributor / PBF Resmi <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  domain
                </span>
                <select
                  value={distributor}
                  onChange={(e) => setDistributor(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 rounded-xl bg-surface-container-low text-on-surface text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container cursor-pointer font-medium"
                >
                  <option>PT Kimia Farma Trading &amp; Distribution</option>
                  <option>PT Enseval Putera Megatrading Tbk</option>
                  <option>PT Anugrah Argon Medica (AAM)</option>
                  <option>PT Mensa Bina Sukses (MBS)</option>
                  <option>PT Parit Padang Global</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Tanggal Terbit Faktur */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-on-surface-variant">
                Tanggal Terbit Faktur PBF <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  calendar_today
                </span>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>
            </div>

            {/* Tanggal & Jam Diterima Fisik */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-on-surface-variant">
                Tanggal &amp; Jam Diterima Fisik <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  schedule
                </span>
                <input
                  type="datetime-local"
                  value={receiveDateTime}
                  onChange={(e) => setReceiveDateTime(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>
            </div>

            {/* Nomor Surat Pesanan (SP) Klinik */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-on-surface-variant flex items-center justify-between">
                <span>Nomor Surat Pesanan (SP) <span className="text-error">*</span></span>
                <span className="text-secondary text-[11px] font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> SP Tervalidasi
                </span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  quick_reference_all
                </span>
                <input
                  type="text"
                  value={spNumber}
                  onChange={(e) => setSpNumber(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-on-surface font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>
            </div>

            {/* Petugas Penerima Farmasi */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-on-surface-variant">
                Petugas Farmasi Penerima <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                  badge
                </span>
                <input
                  type="text"
                  readOnly
                  value="apt. Rahmawati, S.Farm (STRA: 19890412/STRA-ITB/2016)"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container text-on-surface text-xs cursor-not-allowed border border-surface-container font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Physical Inspection & Logistics Verification (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60">
          <div className="flex items-center justify-between pb-1 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">fact_check</span>
              <h2 className="font-bold text-sm sm:text-base text-on-surface">
                Pengecekan Fisik &amp; Segel Kargo
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
              QC Wajib
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Setiap box dan ampul kiriman wajib diperiksa kelayakannya sebelum tanda tangan serah terima
            faktur.
          </p>

          <div className="flex flex-col gap-2.5">
            {/* Checkbox 1 */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer select-none border border-surface-container/60">
              <input
                type="checkbox"
                checked={qcTemp}
                onChange={(e) => setQcTemp(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">
                    device_thermostat
                  </span>
                  Suhu Pengiriman Sesuai Standar
                </span>
                <span className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Suhu ruang &lt;25&deg;C atau Coolpack 2&ndash;8&deg;C untuk sediaan termolabil/vaksin
                  (Termo-indikator aman).
                </span>
              </div>
            </label>

            {/* Checkbox 2 */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer select-none border border-surface-container/60">
              <input
                type="checkbox"
                checked={qcPackage}
                onChange={(e) => setQcPackage(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">lock</span>
                  Kemasan Utuh &amp; Tersegel Resmi Pabrik
                </span>
                <span className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Dus sekunder tidak penyok, botol sirup tidak retak, dan segel hologram PBF tidak rusak.
                </span>
              </div>
            </label>

            {/* Checkbox 3 */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer select-none border border-surface-container/60">
              <input
                type="checkbox"
                checked={qcInvoice}
                onChange={(e) => setQcInvoice(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-tertiary text-[16px]">verified</span>
                  Faktur Asli Bermaterai &amp; Stempel PBF
                </span>
                <span className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Faktur rangkap asli disertakan, terdapat stempel basah distributor, dan tanda tangan ekspedisi.
                </span>
              </div>
            </label>
          </div>

          {/* Live Delivery Snapshot Photo Attachment */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-surface-container/60">
            <img
              alt="Bukti Kargo Fisik Kimia Farma"
              className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm border border-surface-container-highest"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUUf7WW6Nqc0kpDVylvgczm-ZH-YaWZ_16netQEhgGfVsD477CS-9ChbxeMUOct5bX6E09F3YfI1rRLCsjvMu8-yYzHOk6vIlxFG1_I39R7w2_6OyiAozAAzOLGWX2-emiYBCVSFU6vLOzVcRcmF5hXNOUn8JOKuGCwqj3C1n9kfZKz0r5HFSItJCBqDoXtORb7_zTwVK5AqToVMOIslNBDzsS7KnEywFqswmBEy2YQvpxspJDl3NkNA"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-on-surface truncate">
                Lampiran Foto Bukti Kargo Fisik
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant">
                IMG_FKT_20241024_0918.webp &bull; 1.4 MB
              </span>
              <button
                type="button"
                onClick={() => onShowToast('Membuka antarmuka kamera scanner kargo...', 'photo_camera')}
                className="text-[11px] text-primary font-bold mt-1 hover:underline flex items-center gap-1 self-start"
              >
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                Perbarui Foto Kargo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Warning Notification Banner */}
      {showWarning && (
        <div className="rounded-2xl bg-error-container p-4 sm:p-5 shadow-sm border border-error/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 animate-pulse">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-on-error-container font-bold">
                Peringatan Validasi Masa Kedaluwarsa (ED &lt; 18 Bulan)
              </span>
              <span className="text-xs text-on-error-container leading-relaxed">
                {warningMessage}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowWarning(false)}
            className="px-3.5 py-1.5 rounded-xl bg-on-error-container text-on-error text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            Konfirmasi Dispensasi Khusus APJ
          </button>
        </div>
      )}

      {/* Table Section: Received Medication Items & Multiple Batch Allocation */}
      <div className="flex flex-col bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container/60 overflow-hidden">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-surface-container-low border-b border-surface-container">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">
              medication_liquid
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-on-surface">
                Rincian Item Obat yang Diterima (Multi-Batch Input)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Lakukan verifikasi kesesuaian fisik antara kemasan strip/botol dengan baris faktur.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs sm:text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Tambah Baris Obat</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 min-w-[220px]">Nama Obat &amp; Kekuatan Sediaan</th>
                <th className="py-3 px-3 min-w-[140px]">No. Batch Produsen</th>
                <th className="py-3 px-3 min-w-[170px]">Masa Kedaluwarsa (ED)</th>
                <th className="py-3 px-3 text-right w-24">Qty Masuk</th>
                <th className="py-3 px-3 w-28">Satuan</th>
                <th className="py-3 px-3 text-right w-20">Disc (%)</th>
                <th className="py-3 px-3 text-center w-20">PPN (11%)</th>
                <th className="py-3 px-3 text-right min-w-[130px]">HPP Netto (Rp)</th>
                <th className="py-3 px-3 text-right min-w-[140px]">Subtotal (Rp)</th>
                <th className="py-3 px-3 text-center w-14">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm text-on-surface divide-y divide-surface-container/60">
              {items.map((row, idx) => (
                <tr key={row.id} className="hover:bg-surface-container-low/70 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-outline">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface text-xs sm:text-sm">
                        {row.drugName}
                      </span>
                      <span className="font-mono text-[11px] text-outline">{row.code}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={row.batchNumber}
                      onChange={(e) => handleUpdateItem(row.id, 'batchNumber', e.target.value.toUpperCase())}
                      className="w-full h-9 px-2.5 rounded-lg bg-surface-container text-on-surface font-mono text-xs uppercase focus:ring-1 focus:ring-primary focus:outline-none border border-surface-container"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={row.expiryDate}
                        onChange={(e) => handleUpdateItem(row.id, 'expiryDate', e.target.value)}
                        className="w-full h-9 px-2.5 pr-7 rounded-lg bg-surface-container text-on-surface text-xs focus:ring-1 focus:ring-primary focus:outline-none border border-surface-container font-mono"
                      />
                      <span className="absolute right-2 text-secondary pointer-events-none material-symbols-outlined text-[16px]">
                        verified
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <input
                      type="number"
                      min="1"
                      value={row.qty}
                      onChange={(e) => handleUpdateItem(row.id, 'qty', Number(e.target.value))}
                      className="w-20 h-9 px-2 text-right rounded-lg bg-surface-container text-on-surface font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none border border-surface-container"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-surface-container px-2.5 py-1 rounded-md text-on-surface-variant font-medium text-xs block truncate">
                      {row.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={row.discountPercent}
                      onChange={(e) =>
                        handleUpdateItem(row.id, 'discountPercent', Number(e.target.value))
                      }
                      className="w-16 h-9 px-2 text-right rounded-lg bg-surface-container text-on-surface font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none border border-surface-container"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.isPpn}
                      onChange={(e) => handleUpdateItem(row.id, 'isPpn', e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={row.pricePerUnit}
                      onChange={(e) =>
                        handleUpdateItem(row.id, 'pricePerUnit', Number(e.target.value))
                      }
                      className="w-28 h-9 px-2 text-right rounded-lg bg-surface-container text-on-surface font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none border border-surface-container"
                    />
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-primary">
                    {formatRupiah(row.subtotal)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/40 transition-colors"
                      title="Hapus baris obat"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Quick Summary */}
        <div className="flex flex-wrap items-center justify-between p-4 bg-surface-container-low text-xs text-on-surface-variant border-t border-surface-container gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-primary text-[18px]">tag</span>
              Total Item Baris: <strong className="text-on-surface">{items.length} Item</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-secondary text-[18px]">inventory</span>
              Total Fisik Kargo:{' '}
              <strong className="text-on-surface">{calculations.totalQty} Unit</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-outline">
            <span className="material-symbols-outlined text-[16px]">lock_reset</span>
            <span className="font-mono">Sistem FEFO/FIFO akan diupdate secara instan</span>
          </div>
        </div>
      </div>

      {/* Bottom Calculation & Payment Terms Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Payment Terms, Due Date & Notes (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60 gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[22px]">payments</span>
              <h3 className="font-bold text-sm sm:text-base text-on-surface">
                Termin Pembayaran &amp; Jatuh Tempo Faktur
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Kredit pengadaan PBF disesuaikan dengan syarat jual beli resmi (Terms of Payment).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
              {/* Option 1 */}
              <label
                onClick={() => setPaymentTerm('net30')}
                className={`p-3 rounded-xl flex flex-col gap-1 cursor-pointer transition-all border ${
                  paymentTerm === 'net30'
                    ? 'bg-surface-container border-primary shadow-sm'
                    : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">30 Hari (Net 30)</span>
                  <input
                    type="radio"
                    name="top-term"
                    checked={paymentTerm === 'net30'}
                    onChange={() => setPaymentTerm('net30')}
                    className="text-primary accent-primary"
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant">Standar Distributor</span>
              </label>

              {/* Option 2 */}
              <label
                onClick={() => setPaymentTerm('net14')}
                className={`p-3 rounded-xl flex flex-col gap-1 cursor-pointer transition-all border ${
                  paymentTerm === 'net14'
                    ? 'bg-surface-container border-primary shadow-sm'
                    : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">14 Hari (Net 14)</span>
                  <input
                    type="radio"
                    name="top-term"
                    checked={paymentTerm === 'net14'}
                    onChange={() => setPaymentTerm('net14')}
                    className="text-primary accent-primary"
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant">Sediaan Cito / Reagen</span>
              </label>

              {/* Option 3 */}
              <label
                onClick={() => setPaymentTerm('cod')}
                className={`p-3 rounded-xl flex flex-col gap-1 cursor-pointer transition-all border ${
                  paymentTerm === 'cod'
                    ? 'bg-surface-container border-primary shadow-sm'
                    : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">Tunai (COD)</span>
                  <input
                    type="radio"
                    name="top-term"
                    checked={paymentTerm === 'cod'}
                    onChange={() => setPaymentTerm('cod')}
                    className="text-primary accent-primary"
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant">Diskon Pelunasan Cepat</span>
              </label>
            </div>
          </div>

          {/* Due date box */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-surface-container/60">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[28px]">event_repeat</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                  Tanggal Estimasi Jatuh Tempo
                </span>
                <span className="text-base sm:text-lg font-bold text-on-surface">
                  {paymentTerm === 'net30'
                    ? '22 November 2024'
                    : paymentTerm === 'net14'
                    ? '06 November 2024'
                    : '24 Oktober 2024 (Hari ini)'}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-md bg-secondary-fixed text-on-secondary-fixed font-mono text-xs font-bold">
              {paymentTerm === 'net30' ? '29 Hari Tersisa' : paymentTerm === 'net14' ? '13 Hari Tersisa' : 'Lunas Tunai'}
            </span>
          </div>

          {/* Internal Note */}
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-outline font-medium">
              Catatan Khusus Penerimaan / No. Resep Permintaan Unit:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Stok buffer IGD dan Poli Umum untuk estimasi 2 pekan..."
              className="w-full h-10 px-3 rounded-xl bg-surface-container text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
            />
          </div>
        </div>

        {/* Right Column: Auto-Calculated Financial Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-1 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">calculate</span>
              <h3 className="font-bold text-sm sm:text-base text-on-surface">
                Ringkasan Nilai Faktur
              </h3>
            </div>
            <span className="text-[11px] text-secondary font-bold bg-secondary-container/40 px-2 py-0.5 rounded-full">
              Kalkulasi Otomatis
            </span>
          </div>

          {/* Financial Breakdown */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Subtotal Bruto</span>
              <span className="font-mono font-semibold text-on-surface">
                {formatRupiah(calculations.subtotalBruto)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant flex items-center gap-1">
                Total Potongan Diskon
                <span className="material-symbols-outlined text-outline text-[14px]">high_res</span>
              </span>
              <span className="font-mono font-semibold text-secondary">
                - {formatRupiah(calculations.totalDiscount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">DPP (Dasar Pengenaan Pajak)</span>
              <span className="font-mono font-semibold text-on-surface">
                {formatRupiah(calculations.dpp)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant flex items-center gap-1">
                Total PPN (11% UU HPP)
                <span className="material-symbols-outlined text-outline text-[14px]">receipt</span>
              </span>
              <span className="font-mono font-semibold text-on-surface">
                {formatRupiah(calculations.ppnAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant flex items-center gap-1">
                Bea Materai Lunas
                <span className="material-symbols-outlined text-outline text-[14px]">
                  local_post_office
                </span>
              </span>
              <span className="font-mono font-semibold text-on-surface">
                {formatRupiah(calculations.materai)}
              </span>
            </div>

            <div className="h-px bg-surface-container-high my-1"></div>

            {/* Grand Total Card */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary-container text-on-primary-container shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold opacity-90">
                  Grand Total Kewajiban
                </span>
                <span className="text-lg sm:text-xl font-extrabold font-mono">
                  {formatRupiah(calculations.grandTotal)}
                </span>
              </div>
              <span className="material-symbols-outlined text-[32px] opacity-80">
                account_balance_wallet
              </span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleSaveAndSyncStock}
              className="w-full py-3 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
              <span>Validasi &amp; Sinkronisasi Kartu Stok</span>
            </button>
            <span className="text-[11px] text-outline text-center">
              Data akan otomatis dicatat pada buku besar mutasi logistik farmasi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
