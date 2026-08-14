import React, { useState } from 'react';
import { Camera, Sparkles, Shield, UserCheck, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

const DEMO_CREDENTIALS = {
  pembina: ['pembina@sixnema.smpmusix.sch.id', 'pembina123'],
  siswa: ['siswa@sixnema.smpmusix.sch.id', 'siswa123'],
  waka: ['waka@sixnema.smpmusix.sch.id', 'waka123'],
};

const ROLE_CARDS = [
  { role: 'pembina', label: 'Pembina', sub: 'Adek Dharma Santoso, S.I.Kom, M.AP', Icon: UserCheck, testid: 'demo-pembina-btn' },
  { role: 'siswa', label: 'Siswa', sub: 'Wali Murid / Siswa', Icon: GraduationCap, testid: 'demo-siswa-btn' },
  { role: 'waka', label: 'Waka Kesiswaan', sub: 'Afika Amalia, S.Pd, Gr', Icon: Shield, testid: 'demo-waka-btn' },
];

export default function AuthScreen({ onAuthenticated }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const performLogin = async (email, password, roleLabel) => {
    try {
      const user = await api.login(email, password);
      onAuthenticated(user);
      toast.success(`Berhasil masuk sebagai ${roleLabel || user.role}`);
    } catch (err) {
      toast.error(err.message || 'Login gagal. Periksa kredensial.');
    }
  };

  const handleDemo = (role) => {
    const [email, password] = DEMO_CREDENTIALS[role];
    const label = ROLE_CARDS.find((r) => r.role === role)?.label;
    performLogin(email, password, label);
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Isi email dan kata sandi terlebih dahulu.');
      return;
    }
    performLogin(loginEmail, loginPassword);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col justify-between selection:bg-yellow-500 selection:text-black">
      <header className="border-b border-gray-800 bg-[#111827]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-2.5 rounded-xl shadow-lg shadow-yellow-500/20 text-black">
            <Camera className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              SIXNEMA <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">SMP Musix</span>
            </h1>
            <p className="text-xs text-gray-400">Ekskul Fotografi & Videografi • SMP Muhammadiyah 6 Surabaya</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-yellow-400" /> Akreditasi A</span>
          <span>•</span>
          <span>Karang Pilang, Surabaya</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Ekstrakurikuler Fotografi & Sinematografi
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              SIXNEMA, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
               SIXNEMA SMP MUHAMMADIYAH 6 SURABAYA.
              </span>
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Sistem manajemen terpadu ekstrakurikuler Fotografi & Videografi SMP Muhammadiyah 6 Surabaya. Absensi cepat, penilaian objektif (Teori 40% + Karya 60%), jurnal pengajaran, dan Website sistem Management terpadu ekstrakurikuler & Sinematografi SMP Muhammadiyah 6 Surabaya, Jurnal, Absensi dan Karya semua terintegrasi dengan baik melalui Aplikasi SixnemaApps.
            </p>

            <div className="pt-4">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Pilih Akses Cepat Demo Peran:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROLE_CARDS.map(({ role, label, sub, Icon, testid }) => (
                  <button
                    key={role}
                    onClick={() => handleDemo(role)}
                    data-testid={testid}
                    className="p-4 rounded-xl bg-gray-900/80 border border-yellow-500/30 hover:border-yellow-400 text-left transition-all group hover:shadow-lg hover:shadow-yellow-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-mono">Demo</span>
                    </div>
                    <div className="font-bold text-white text-sm">{label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Masuk ke Akun Sixnema</h3>
              <p className="text-xs text-gray-400 mt-1">Gunakan kredensial akun atau email terdaftar</p>
            </div>

            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Email / Peran</label>
                <input
                  type="text"
                  placeholder="pembina@sixnema.smpmusix.sch.id"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  data-testid="login-email-input"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Kata Sandi</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  data-testid="login-password-input"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                data-testid="login-submit-btn"
                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2"
              >
                Masuk Dashboard <Camera className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-400">Sistem oleh Filmuda Academy</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 bg-[#111827]/40 py-6 text-center text-xs text-gray-400">
        <p>© 2026 SIXNEMA SMP Muhammadiyah 6 Surabaya • Jl. Kemlaten Baru 43, Kebraon, Karang Pilang, Surabaya</p>
      </footer>
    </div>
  );
}
