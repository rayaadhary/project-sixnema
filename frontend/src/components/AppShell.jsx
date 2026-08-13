import React from 'react';
import { Camera, LogOut, BarChart2, CheckSquare, BookOpen, Users, Video, Award, Shield, Calendar } from 'lucide-react';

const ROLE_TABS = {
  pembina: [
    { id: 'dashboard', label: 'Dashboard Utama', Icon: BarChart2 },
    { id: 'absensi', label: 'Absensi Cepat', Icon: CheckSquare },
    { id: 'jurnal', label: 'Jurnal & Nilai', Icon: BookOpen },
    { id: 'siswa', label: 'Kelola Siswa', Icon: Users },
    { id: 'riwayat', label: 'Riwayat Absensi', Icon: Calendar },
  ],
  siswa: [
    { id: 'dashboard', label: 'Dashboard Utama', Icon: BarChart2 },
    { id: 'karya', label: 'Kirim Link Karya', Icon: Video },
    { id: 'rapor', label: 'Rapor & Catatan', Icon: Award },
  ],
  waka: [
    { id: 'dashboard', label: 'Dashboard Utama', Icon: BarChart2 },
    { id: 'pantau', label: 'Pantau & Feedback', Icon: Shield },
    { id: 'riwayat', label: 'Riwayat Absensi', Icon: Calendar },
  ],
};

export default function AppShell({ currentUser, activeTab, setActiveTab, onLogout, students, children }) {
  const tabs = ROLE_TABS[currentUser.role] || [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col selection:bg-yellow-500 selection:text-black">
      <header className="border-b border-gray-800 bg-[#111827]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-2 rounded-lg text-black font-bold shadow-md shadow-yellow-500/20">
            <Camera className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white text-base sm:text-lg">SIXNEMA</span>
              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded font-mono uppercase">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">SMP Muhammadiyah 6 Surabaya</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-1 bg-gray-900/90 p-1.5 rounded-xl border border-gray-800">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              data-testid={`nav-${id}-tab`}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === id
                  ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
              {id === 'siswa' && ` (${students.length})`}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{currentUser.name}</p>
            <p className="text-[10px] text-yellow-400">{currentUser.title}</p>
          </div>
          <button
            onClick={onLogout}
            data-testid="logout-btn"
            title="Keluar / Ganti Peran"
            className="p-2.5 rounded-xl bg-gray-900 hover:bg-red-500/10 hover:text-red-400 border border-gray-800 hover:border-red-500/30 transition-all text-gray-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex md:hidden bg-gray-900 border-b border-gray-800 px-4 py-2 overflow-x-auto space-x-2">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === id ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">{children}</main>

      <footer className="border-t border-gray-800 bg-[#111827]/60 py-6 text-center text-xs text-gray-400">
        <p>© 2026 SIXNEMA SMP Muhammadiyah 6 Surabaya • Jl. Kemlaten Baru 43, Kebraon, Karang Pilang, Surabaya</p>
      </footer>
    </div>
  );
}
