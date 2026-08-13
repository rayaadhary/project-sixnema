import React, { useState } from 'react';
import { Video, ExternalLink, Award, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import GradeChart from '../GradeChart';

export function SiswaKarya({ currentUser, artworks, onArtworkSubmitted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !description || !url) {
      toast.error('Judul, tautan, dan deskripsi karya wajib diisi!');
      return;
    }
    try {
      const saved = await api.createArtwork({ title, url, description });
      onArtworkSubmitted(saved);
      setTitle('');
      setDescription('');
      setUrl('');
      toast.success('Link karya berhasil dikirim ke Pembina untuk dinilai!');
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim karya');
    }
  };

  const myWorks = artworks.filter((a) => a.student_id === currentUser.student_id);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-yellow-400" /> Kirim Tautan Karya & Deskripsi Singkat
          </h3>
          <p className="text-xs text-gray-400 mt-1">Unggah link portofolio (Google Drive / YouTube / Instagram / Behance) tanpa perlu unggah file.</p>
        </div>

        <form onSubmit={submit} className="space-y-5 bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Judul Karya Fotografi / Videografi</label>
            <input type="text" placeholder="Cth: Potret Siluet Senja di Halaman Sekolah" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="art-title-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Tautan Karya (URL Link)</label>
            <input type="url" placeholder="https://drive.google.com/... atau https://youtube.com/..." value={url} onChange={(e) => setUrl(e.target.value)} data-testid="art-url-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 font-mono text-xs" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Deskripsi Singkat / Cerita di Balik Lensa</label>
            <textarea rows="3" placeholder="Jelaskan teknik yang digunakan (ISO, Shutter speed, konsep cerita)..." value={description} onChange={(e) => setDescription(e.target.value)} data-testid="art-desc-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"></textarea>
          </div>

          <button type="submit" data-testid="submit-artwork-btn" className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2">
            <Video className="w-4 h-4" /> Kirim Karya ke Pembina
          </button>
        </form>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-4">Riwayat Karya Saya</h3>
        <div className="space-y-4">
          {myWorks.length === 0 && <p className="text-sm text-gray-400">Belum ada karya yang dikirim. Kirim link karya pertamamu di atas!</p>}
          {myWorks.map((art) => (
            <div key={art.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded font-mono">{art.status}</span>
                <h4 className="text-sm font-bold text-white mt-1">{art.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{art.description}</p>
              </div>
              <a href={art.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all">
                Buka Tautan <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiswaRapor({ currentUser, students }) {
  const studentInfo = students.find((s) => s.id === currentUser.student_id) || students[0];
  if (!studentInfo) return null;

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-yellow-500/10 via-[#111827] to-gray-900 border border-yellow-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full font-mono">
              NIS: {studentInfo.nis} • Kelas {studentInfo.class}
            </span>
            <h2 className="text-3xl font-black text-white mt-2">{studentInfo.name}</h2>
            <p className="text-xs text-gray-400 mt-1">Peserta Aktif Ekskul Fotografi & Videografi SMP Musix</p>
          </div>
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 text-center min-w-[140px]">
            <span className="text-[10px] uppercase text-gray-400 tracking-wider">Nilai Total Rapor</span>
            <div className="text-3xl font-black text-yellow-400 font-mono mt-0.5" data-testid="siswa-total-grade">{studentInfo.total}</div>
            <span className="text-[10px] text-green-400">Teori 40% + Karya 60%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" /> Komponen Nilai
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Nilai Teori Kamera (Bobot 40%)</span>
                <span className="font-mono font-bold text-white">{studentInfo.theory} / 100</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${studentInfo.theory}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Nilai Karya Portofolio (Bobot 60%)</span>
                <span className="font-mono font-bold text-white">{studentInfo.artwork} / 100</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${studentInfo.artwork}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-yellow-400" /> Catatan Personal Pembina
          </h4>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
            &ldquo;{studentInfo.notes}&rdquo;
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-400">
            <span>Status: Aktif</span>
            <span className="text-yellow-400 font-mono">Ekskul SIXNEMA</span>
          </div>
        </div>
      </div>

      <GradeChart studentId={studentInfo.id} studentName={studentInfo.name} />
    </div>
  );
}
