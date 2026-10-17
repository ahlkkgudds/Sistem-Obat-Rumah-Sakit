export type DrugCategory = 'Bebas' | 'Terbatas' | 'Keras' | 'Psikotropika' | 'Alkes';

export interface DrugItem {
  id: string;
  code: string;
  barcode: string;
  name: string;
  dosage: string;
  category: DrugCategory;
  categoryNote?: string;
  shelfLocation: string;
  shelfDetail: string;
  unit: string;
  bufferMin: number;
  stockActual: number;
  buyPrice: number;
  sellPrice: number;
  status: 'Tersedia' | 'Stok Kritis' | 'Habis' | 'Diawasi' | 'Suhu Terjaga';
  isSipnap?: boolean;
}

export type BatchStatus = 'all' | 'expired' | 'critical' | 'warning' | 'safe';

export interface BatchItem {
  id: string;
  drugId?: string;
  drugName: string;
  dosageForm: string;
  location: string;
  batchNumber: string;
  bpomReg: string;
  expiryDate: string; // YYYY-MM-DD or formatted
  expiryDisplay: string;
  remainingDays: number;
  remainingText: string;
  stock: number;
  unit: string;
  unitPrice: number;
  potentialLoss: number;
  category: string;
  status: 'expired' | 'critical' | 'warning' | 'safe';
  recommendation: string;
  recommendationType: 'quarantine' | 'retur' | 'priority' | 'rotate' | 'safe';
  isLocked: boolean;
  lockLocation?: string;
}

export interface ProcurementItem {
  id: string;
  drugName: string;
  code: string;
  batchNumber: string;
  expiryDate: string;
  qty: number;
  unit: string;
  discountPercent: number;
  isPpn: boolean;
  pricePerUnit: number;
  subtotal: number;
}

export interface QuarantineRecord {
  id: string;
  docNumber: string;
  date: string;
  apjName: string;
  apjSipa: string;
  reason: string;
  shelfLocation: string;
  items: {
    drugName: string;
    batchNumber: string;
    qty: number;
    unit: string;
  }[];
  notes?: string;
  status: 'Terkunci di Lemari Karantina' | 'Menunggu Saksi Dinkes/BPOM' | 'Telah Dimusnahkan';
}

export type ScreenId =
  | 'dashboard'
  | 'manajemen-stok-obat'
  | 'monitoring-kedaluwarsa'
  | 'penerimaan-pengadaan'
  | 'pengeluaran-resep'
  | 'kartu-stok-audit'
  | 'laporan-pemusnahan'
  | 'pengaturan-sistem';
