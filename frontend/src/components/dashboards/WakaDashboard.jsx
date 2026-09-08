import React, { useState } from 'react';
import { Shield, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import FlipbookUpload from '../FlipbookUpload';

export default function WakaPantau({ currentUser, students, feedback, onFeedbackAdded }) {
  const [text, setText] = useState('');

  const sortedStudents = [...students].sort((a, b) => (b.total || 0) - (a.total || 0));

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const saved = await api.createFeedback({ text, target_role: currentUser.role === 'waka' ? 'pembina' : 'waka' });
      onFeedbackAdded(saved);
      setText('');
      toast.success('Pesan/feedback langsung berhasil dikirim!');
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim feedback');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-yellow-400" /> Pantau Laporan Pembina & Rekapitulasi
            </h3>
            <p className="text-xs text-gray-400 mt-1">Pengawasan langsung program ekstrakurikuler SMP Muhammadiyah 6 Surabaya</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-xl text-yellow-400 text-xs font-mono">
            Status: (Akreditasi A)
          </div>
        </div>

        <form onSubmit={send} className="bg-gray-900 p-5 rounded-xl border border-gray-800 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-yellow-400" /> Berikan Feedback Langsung ke Pembina (Adek Dharma Santoso, S.I.Kom, M.AP)
          </h4>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Cth: Mohon laporan dokumentasi Pesantren Kilat difokuskan minggu ini..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              data-testid="waka-feedback-input"
              className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
            <button type="submit" data-testid="waka-send-feedback-btn" className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition-all shadow-md shadow-yellow-500/20 whitespace-nowrap">
              Kirim Feedback
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-4">Riwayat Komunikasi & Catatan Pengawasan</h3>
        <div className="space-y-4">
          {feedback.length === 0 && <p className="text-sm text-gray-400">Belum ada feedback tercatat.</p>}
          {feedback.map((fb) => (
            <div key={fb.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-yellow-400">{fb.author} ({fb.author_role})</span>
                <span className="text-[10px] text-gray-400 font-mono">{(fb.created_at || '').slice(0, 10)}</span>
              </div>
              <p className="text-sm text-gray-200">{fb.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-4">Rekapitulasi Nilai & Ranking Seluruh Siswa Ekskul</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" data-testid="waka-recap-table">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Rank</th>
                <th className="pb-3 font-semibold">Nama Siswa</th>
                <th className="pb-3 font-semibold text-center">Kelas</th>
                <th className="pb-3 font-semibold text-center">Teori (40%)</th>
                <th className="pb-3 font-semibold text-center">Karya (60%)</th>
                <th className="pb-3 font-semibold text-right">Nilai Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {sortedStudents.map((s, index) => (
                <tr key={s.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-yellow-400">#{index + 1}</td>
                  <td className="py-3 font-medium text-white">{s.name}</td>
                  <td className="py-3 text-center text-gray-300">{s.class}</td>
                  <td className="py-3 text-center font-mono text-gray-300">{s.theory}</td>
                  <td className="py-3 text-center font-mono text-gray-300">{s.artwork}</td>
                  <td className="py-3 text-right font-mono font-bold text-yellow-400">{s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FlipbookUpload />
    </div>
  );
}
