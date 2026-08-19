import React, { useState } from 'react';
import { Camera, Sparkles, Shield, GraduationCap, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

const ROLES = [
  { value: 'siswa', label: 'Siswa' },
  { value: 'pembina', label: 'Pembina' },
  { value: 'waka', label: 'Waka Kesiswaan' },
];

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('siswa');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const performLogin = async (email, password) => {
    try {
      const user = await api.login(email, password);
      onAuthenticated(user);
      toast.success(`Berhasil masuk sebagai ${user.role}`);
    } catch (err) {
      toast.error(err.message || 'Login gagal. Periksa kredensial.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const email = loginEmail.trim();
    if (!email || !loginPassword) {
      toast.error('Isi email dan kata sandi terlebih dahulu.');
      return;
    }
    performLogin(email, loginPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = regEmail.trim();
    if (!email || !regPassword || !regConfirm) {
      toast.error('Isi semua field registrasi.');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    try {
      const user = await api.register({ email, role: regRole, password: regPassword });
      onAuthenticated(user);
      toast.success('Registrasi berhasil, selamat datang!');
    } catch (err) {
      toast.error(err.message || 'Registrasi gagal.');
    }
  };

  const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors";

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
              SMP MUHAMMADIYAH 6 SURABAYA.
              </span>
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Sistem manajemen terpadu ekstrakurikuler Fotografi & Videografi SMP Muhammadiyah 6 Surabaya. Absensi, jurnal pengajaran, dan Website sistem Management terpadu ekstrakurikuler & Sinematografi SMP Muhammadiyah 6 Surabaya, Jurnal, Absensi dan Karya semua terintegrasi dengan baik melalui Aplikasi SixnemaApps.
            </p>
            <div className="pt-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gray-900/80 border border-yellow-500/30 text-yellow-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                Punya akun? Masuk untuk melanjutkan. Belum punya? Daftar dengan memilih peran.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">
                {mode === 'login' ? 'Masuk ke Akun Sixnema' : 'Daftar Akun Sixnema'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {mode === 'login' ? 'Gunakan email terdaftar' : 'Buat akun baru dengan peran Anda'}
              </p>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="text"
                    placeholder="nama@sekolah.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    data-testid="login-email-input"
                    className={inputCls}
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
                    className={inputCls}
                  />
                </div>
                <button
                  type="submit"
                  data-testid="login-submit-btn"
                  className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Masuk <LogIn className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="text"
                    placeholder="nama@sekolah.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    data-testid="register-email-input"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Peran</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    data-testid="register-role-select"
                    className={inputCls}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Kata Sandi</label>
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    data-testid="register-password-input"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Konfirmasi Kata Sandi</label>
                  <input
                    type="password"
                    placeholder="Ulangi kata sandi"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    data-testid="register-confirm-input"
                    className={inputCls}
                  />
                </div>
                <button
                  type="submit"
                  data-testid="register-submit-btn"
                  className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Daftar <UserPlus className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="mt-4 pt-4 border-t border-gray-800 text-center">
              <button
                type="button"
                data-testid="auth-toggle-btn"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-sm text-yellow-400 hover:text-yellow-300 font-medium"
              >
                {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
              </button>
            </div>

            <div className="mt-4 text-center">
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