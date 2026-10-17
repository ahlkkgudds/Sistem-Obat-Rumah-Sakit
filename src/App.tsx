import React, { useState } from 'react';
import { ScreenId, DrugItem, BatchItem, QuarantineRecord, UserProfile } from './types';
import { INITIAL_DRUGS, INITIAL_BATCHES, INITIAL_QUARANTINE_RECORDS, DEFAULT_USERS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { QuarantineModal } from './components/QuarantineModal';
import { ExportModal } from './components/ExportModal';
import { AddDrugModal } from './components/AddDrugModal';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { MonitoringKedaluwarsaView } from './views/MonitoringKedaluwarsaView';
import { ManajemenStokView } from './views/ManajemenStokView';
import { PenerimaanPengadaanView } from './views/PenerimaanPengadaanView';
import { PengeluaranResepView } from './views/PengeluaranResepView';
import { KartuStokAuditView } from './views/KartuStokAuditView';
import { LaporanBeritaAcaraView } from './views/LaporanBeritaAcaraView';
import { PengaturanSistemView } from './views/PengaturanSistemView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS.petugas_farmasi);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Domain State
  const [drugs, setDrugs] = useState<DrugItem[]>(INITIAL_DRUGS);
  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCHES);
  const [quarantineRecords, setQuarantineRecords] = useState<QuarantineRecord[]>(
    INITIAL_QUARANTINE_RECORDS
  );
  const [roomTemp, setRoomTemp] = useState(23);
  const [chillerTemp, setChillerTemp] = useState(4);

  // Modals
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false);
  const [quarantineTargetBatch, setQuarantineTargetBatch] = useState<BatchItem | undefined>();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddDrugModalOpen, setIsAddDrugModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; icon: string }>({
    show: false,
    message: '',
    icon: 'check_circle',
  });

  const showToast = (message: string, icon = 'check_circle') => {
    setToast({ show: true, message, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Auth Handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('Anda telah keluar dari sesi sistem farmasi.', 'logout');
  };

  const handleSwitchRole = () => {
    const nextRoleKey = currentUser.role === 'petugas_farmasi' ? 'pimpinan_klinik' : 'petugas_farmasi';
    const nextUser = DEFAULT_USERS[nextRoleKey];
    setCurrentUser(nextUser);
    showToast(`Beralih peran aktif: ${nextUser.roleLabel} (${nextUser.name})`, 'swap_horiz');
  };

  // Handlers
  const handleOpenQuarantineModal = (batch?: BatchItem) => {
    setQuarantineTargetBatch(batch);
    setIsQuarantineModalOpen(true);
  };

  const handleQuarantineSubmit = (record: QuarantineRecord) => {
    setQuarantineRecords((prev) => [record, ...prev]);

    // Lock the quarantined batch(es)
    setBatches((prev) =>
      prev.map((b) => {
        const isTarget = record.items.some((it) => it.batchNumber === b.batchNumber);
        if (isTarget) {
          return {
            ...b,
            status: 'expired',
            isLocked: true,
            recommendation: 'Terkunci di Lemari Karantina',
            lockLocation: record.shelfLocation,
          };
        }
        return b;
      })
    );

    showToast(
      `Berita Acara Karantina ${record.docNumber} resmi diterbitkan & status batch telah dikunci!`,
      'verified'
    );
  };

  const handleExportFinish = (format: 'Excel' | 'PDF') => {
    setIsExportModalOpen(false);
    showToast(`Mengunduh berkas Laporan Monitoring ED (.${format.toLowerCase()})...`, 'download');
  };

  const handleAddDrug = (newDrug: DrugItem) => {
    setDrugs((prev) => [newDrug, ...prev]);
    showToast(`Sediaan ${newDrug.name} (${newDrug.code}) berhasil ditambahkan ke formularium!`, 'medication');
  };

  const handleAddNewBatchFromProcurement = (newBatch: BatchItem) => {
    setBatches((prev) => [newBatch, ...prev]);
    // update drug physical stock if matching
    setDrugs((prev) =>
      prev.map((d) => {
        if (newBatch.drugName.toLowerCase().includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(newBatch.drugName.toLowerCase())) {
          return {
            ...d,
            stockActual: d.stockActual + newBatch.stock,
            status: 'Tersedia',
          };
        }
        return d;
      })
    );
  };

  const handleDispense = (drugId: string, batchId: string, qty: number) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          const newStock = Math.max(0, b.stock - qty);
          return {
            ...b,
            stock: newStock,
          };
        }
        return b;
      })
    );

    setDrugs((prev) =>
      prev.map((d) => {
        if (d.id === drugId) {
          const newActual = Math.max(0, d.stockActual - qty);
          return {
            ...d,
            stockActual: newActual,
            status: newActual === 0 ? 'Habis' : newActual < d.bufferMin ? 'Stok Kritis' : 'Tersedia',
          };
        }
        return d;
      })
    );
  };

  const handleLockBatch = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          return { ...b, isLocked: true, status: 'expired' };
        }
        return b;
      })
    );
    showToast('Batch obat telah dikunci dari antrean resep.', 'lock');
  };

  const handleResetData = () => {
    setDrugs(INITIAL_DRUGS);
    setBatches(INITIAL_BATCHES);
    setQuarantineRecords(INITIAL_QUARANTINE_RECORDS);
    setRoomTemp(23);
    setChillerTemp(4);
  };

  // Batches to pass to quarantine modal
  const batchesForQuarantine = quarantineTargetBatch
    ? [quarantineTargetBatch]
    : batches.filter((b) => b.status === 'expired');

  const expiredCount = batches.filter((b) => b.status === 'expired' || b.isLocked).length;

  // If user is not logged in, render the dedicated Login Screen!
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
        <LoginView onLogin={handleLogin} onShowToast={showToast} />
        {/* Toast Notification */}
        <div
          className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 bg-inverse-surface text-inverse-on-surface rounded-2xl shadow-2xl border border-surface-container/20 ${
            toast.show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}
        >
          <span className="material-symbols-outlined text-secondary-fixed text-[22px]">
            {toast.icon}
          </span>
          <span className="text-xs sm:text-sm font-semibold max-w-sm">{toast.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased flex flex-col">
      {/* Left Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        expiredCount={expiredCount || 12}
        roomTemp={roomTemp}
        chillerTemp={chillerTemp}
        currentUser={currentUser}
      />

      {/* Main Content Wrap */}
      <div className="lg:pl-72 flex-1 flex flex-col">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setMobileOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          batches={batches}
          onNavigateToScreen={setCurrentScreen}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
        />

        {/* Page Container */}
        <main className="relative pt-20 px-4 sm:px-6 py-6 w-full flex-1 max-w-[1600px] mx-auto">
          {currentScreen === 'dashboard' && (
            <DashboardView
              batches={batches}
              drugs={drugs}
              onNavigate={setCurrentScreen}
              onOpenAddDrugModal={() => setIsAddDrugModalOpen(true)}
              onOpenQuarantineModal={handleOpenQuarantineModal}
              onShowToast={showToast}
              currentUser={currentUser}
            />
          )}

          {currentScreen === 'monitoring-kedaluwarsa' && (
            <MonitoringKedaluwarsaView
              batches={batches}
              onOpenQuarantineModal={handleOpenQuarantineModal}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onShowToast={showToast}
              onLockBatch={handleLockBatch}
            />
          )}

          {currentScreen === 'manajemen-stok-obat' && (
            <ManajemenStokView
              drugs={drugs}
              onOpenAddDrugModal={() => setIsAddDrugModalOpen(true)}
              onShowToast={showToast}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'penerimaan-pengadaan' && (
            <PenerimaanPengadaanView
              onShowToast={showToast}
              onAddNewBatch={handleAddNewBatchFromProcurement}
              drugs={drugs}
            />
          )}

          {currentScreen === 'pengeluaran-resep' && (
            <PengeluaranResepView
              drugs={drugs}
              batches={batches}
              onShowToast={showToast}
              onDispense={handleDispense}
            />
          )}

          {currentScreen === 'kartu-stok-audit' && (
            <KartuStokAuditView drugs={drugs} onShowToast={showToast} />
          )}

          {currentScreen === 'laporan-pemusnahan' && (
            <LaporanBeritaAcaraView
              quarantineRecords={quarantineRecords}
              onShowToast={showToast}
              currentUser={currentUser}
            />
          )}

          {currentScreen === 'pengaturan-sistem' && (
            <PengaturanSistemView
              onShowToast={showToast}
              roomTemp={roomTemp}
              chillerTemp={chillerTemp}
              onUpdateTemps={(r, c) => {
                setRoomTemp(r);
                setChillerTemp(c);
              }}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Quarantine Modal */}
      <QuarantineModal
        isOpen={isQuarantineModalOpen}
        onClose={() => setIsQuarantineModalOpen(false)}
        selectedBatches={batchesForQuarantine}
        onSubmit={handleQuarantineSubmit}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportFinish}
      />

      {/* Add Master Drug Modal */}
      <AddDrugModal
        isOpen={isAddDrugModalOpen}
        onClose={() => setIsAddDrugModalOpen(false)}
        onAddDrug={handleAddDrug}
      />

      {/* Floating Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 bg-inverse-surface text-inverse-on-surface rounded-2xl shadow-2xl border border-surface-container/20 ${
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <span className="material-symbols-outlined text-secondary-fixed text-[22px]">
          {toast.icon}
        </span>
        <span className="text-xs sm:text-sm font-semibold max-w-sm">{toast.message}</span>
      </div>
    </div>
  );
}
