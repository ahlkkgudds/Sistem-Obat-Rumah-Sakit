import React, { useState } from 'react';

interface PengaturanSistemViewProps {
  onShowToast: (message: string, icon?: string) => void;
  roomTemp: number;
  chillerTemp: number;
  onUpdateTemps: (room: number, chiller: number) => void;
  onResetData: () => void;
}

export const PengaturanSistemView: React.FC<PengaturanSistemViewProps> = ({
  onShowToast,
  roomTemp,
  chillerTemp,
  onUpdateTemps,
  onResetData,
}) => {
  const [clinicName, setClinicName] = useState('Klinik Pratama Jambu Mawar');
  const [subTitle, setSubTitle] = useState('Instalasi Farmasi & Apotek Pelayanan');
  const [apjName, setApjName] = useState('apt. Rahmawati, S.Farm');
  const [apjSipa, setApjSipa] = useState('19890214/SIPA-31.71/2021/2012');
  const [fefoAlertDays, setFefoAlertDays] = useState(60);
  const [rTemp, setRTemp] = useState(roomTemp);
  const [cTemp, setCTemp] = useState(chillerTemp);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTemps(Number(rTemp), Number(cTemp));
    onShowToast('Pengaturan konfigurasi sistem farmasi berhasil disimpan!', 'verified');
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Title */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60">
        <div>
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span>KONFIGURASI FARMASI &amp; KEBIJAKAN ROTASI FEFO</span>
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-on-surface">
            Pengaturan Sistem &amp; Kebijakan Apotek
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Kelola legalitas Apoteker Penanggung Jawab (APJ), ambang peringatan suhu rantai dingin, dan
            parameter FEFO.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Clinic & APJ Credentials (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col gap-4 text-xs sm:text-sm">
          <h2 className="font-bold text-sm sm:text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
            Identitas Fasilitas &amp; Legalitas Farmasi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="font-semibold text-on-surface">Nama Klinik / Fasilitas Pelayanan</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="font-semibold text-on-surface">Unit Pelayanan</label>
              <input
                type="text"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-on-surface">Apoteker Penanggung Jawab (APJ)</label>
              <input
                type="text"
                value={apjName}
                onChange={(e) => setApjName(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-on-surface">Nomor Surat Izin Praktik (SIPA)</label>
              <input
                type="text"
                value={apjSipa}
                onChange={(e) => setApjSipa(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-mono text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="font-semibold text-on-surface">
                Ambang Batas Peringatan FEFO Otomatis (Hari Menuju ED)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                value={fefoAlertDays}
                onChange={(e) => setFefoAlertDays(Number(e.target.value))}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-mono text-on-surface border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[11px] text-outline">
                Batch yang tersisa di bawah jumlah hari ini akan otomatis ditandai untuk prioritas retur
                atau peresepan dipercepat.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary-container transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan Perubahan Konfigurasi
            </button>
          </div>
        </div>

        {/* Temperature Sensor Simulator & Reset (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Temperature Sensor Simulator */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container/60 flex flex-col gap-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm sm:text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">thermostat</span>
                Simulasi Sensor Rantai Dingin
              </h2>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Suhu Ruang Apotek:</span>
                  <span className="font-mono text-primary font-bold">{rTemp}&deg;C</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="35"
                  value={rTemp}
                  onChange={(e) => setRTemp(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <span className="text-[10px] text-outline">Batas aman: 20&deg;C - 25&deg;C</span>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Suhu Chiller Vaksin:</span>
                  <span className="font-mono text-secondary font-bold">{cTemp}&deg;C</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={cTemp}
                  onChange={(e) => setCTemp(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <span className="text-[10px] text-outline">Batas aman vaksin: 2&deg;C - 8&deg;C</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onUpdateTemps(Number(rTemp), Number(cTemp));
                onShowToast(`Sensor suhu diperbarui: Ruang ${rTemp}°C, Chiller ${cTemp}°C`, 'device_thermostat');
              }}
              className="py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs"
            >
              Terapkan Perubahan Sensor
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-error-container/40 flex flex-col gap-3 text-xs sm:text-sm">
            <h2 className="font-bold text-sm text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
              Reset Data Demo Sistem
            </h2>
            <p className="text-xs text-on-surface-variant">
              Kembalikan seluruh data batch obat, katalog formularium, dan faktur kembali ke data awal
              sesuai tangkapan layar.
            </p>
            <button
              type="button"
              onClick={() => {
                onResetData();
                onShowToast('Data simulasi farmasi telah direset ke setelan awal!', 'restore');
              }}
              className="py-2 px-4 rounded-xl bg-error/10 hover:bg-error text-error hover:text-on-error font-semibold text-xs transition-all border border-error/20"
            >
              Reset ke Data Awal Pabrik
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
