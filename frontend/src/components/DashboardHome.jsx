import React from 'react';
import { Users, Video, BookOpen, Award, Star, Sparkles, ExternalLink, Download, FileText } from 'lucide-react';
import { downloadCsv, downloadPdf } from '../lib/exports';
import { toast } from 'sonner';

export default function DashboardHome({ currentUser, students, artworks, journals }) {
  const sortedStudents = [...students].sort((a, b) => (b.total || 0) - (a.total || 0));

  const rankingRows = sortedStudents.map((s, i) => [
    i + 1,
    s.name,
    s.nis,
    s.class,
    s.theory,
    s.artwork,
    s.total,
  ]);

  const exportRankingCsv = () => {
    const rows = [['Rank', 'Nama', 'NIS', 'Kelas', 'Teori (40%)', 'Karya (60%)', 'Total'], ...rankingRows];
    downloadCsv(rows, 'sixnema-ranking.csv');
    toast.success('Ranking CSV berhasil diunduh.');
  };

  const exportRankingPdf = () => {
    downloadPdf({
      title: 'Ranking Nilai Ekskul SIXNEMA',
      subtitle: 'SMP Muhammadiyah 6 Surabaya • Bobot Teori 40% + Karya 60%',
      columns: ['Rank', 'Nama', 'NIS', 'Kelas', 'Teori', 'Karya', 'Total'],
      rows: rankingRows,
      filename: 'sixnema-ranking.pdf',
    });
    toast.success('Ranking PDF berhasil diunduh.');
  };

  const roleIntro = {
    pembina: '',
    siswa: 'Unggah tautan karya fotografi & videografimu, pantau nilai rapor harian, dan lihat catatan personal dari pembina.',
    waka: 'Pantau laporan seluruh pembina ekskul, rekapitulasi nilai siswa, dan berikan feedback langsung secara real-time.',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative bg-gradient-to-r from-gray-900 via-[#111827] to-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden lg:block bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513031300226-c8fb12de9ade')` }}></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Ekstrakurikuler Fotografi & Videografi
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Selamat Datang, <span className="text-yellow-400">{currentUser.name}</span>!
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{roleIntro[currentUser.role]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: `${students.length} Siswa`, sub: 'Peserta Ekskul Fotografi', Icon: Users, tag: 'Aktif', tagCls: 'bg-green-500/10 text-green-400' },
          { label: `${artworks.length} Karya`, sub: 'Tautan & Portofolio Siswa', Icon: Video, tag: 'Koleksi', tagCls: 'bg-yellow-500/10 text-yellow-400' },
          { label: `${journals.length} Sesi`, sub: 'Jurnal Pengajaran Selesai', Icon: BookOpen, tag: 'Jurnal', tagCls: 'bg-blue-500/10 text-blue-400' },
          { label: `${sortedStudents[0]?.total ?? '-'}`, sub: 'Nilai Tertinggi Saat Ini', Icon: Award, tag: 'Formula 40:60', tagCls: 'bg-purple-500/10 text-purple-400' },
        ].map(({ label, sub, Icon, tag, tagCls }) => (
          <div key={sub} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${tagCls}`}>{tag}</span>
            </div>
            <h4 className="text-3xl font-black text-white">{label}</h4>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Sistem Ranking Otomatis Siswa
              </h3>
              <p className="text-xs text-gray-400">Berdasarkan total nilai (Teori 40% + Karya 60%)</p>
            </div>
            {currentUser.role !== 'siswa' && (
              <div className="flex gap-2">
                <button
                  onClick={exportRankingCsv}
                  data-testid="export-ranking-csv-btn"
                  className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-yellow-500/40 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-yellow-400" /> CSV
                </button>
                <button
                  onClick={exportRankingPdf}
                  data-testid="export-ranking-pdf-btn"
                  className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-yellow-500/40 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-yellow-400" /> PDF
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" data-testid="ranking-table">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Rank</th>
                  <th className="pb-3 font-semibold">Nama Siswa / NIS</th>
                  <th className="pb-3 font-semibold text-center">Kelas</th>
                  <th className="pb-3 font-semibold text-center">Teori (40%)</th>
                  <th className="pb-3 font-semibold text-center">Karya (60%)</th>
                  <th className="pb-3 font-semibold text-right">Nilai Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {sortedStudents.map((s, index) => (
                  <tr key={s.id} className="hover:bg-gray-800/40 transition-colors group">
                    <td className="py-3.5 font-mono font-bold">
                      {index === 0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-black text-xs font-bold shadow-md shadow-yellow-500/30">1</span>}
                      {index === 1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-black text-xs font-bold">2</span>}
                      {index === 2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold">3</span>}
                      {index > 2 && <span className="text-gray-400 pl-2">#{index + 1}</span>}
                    </td>
                    <td className="py-3.5 font-medium text-white">
                      {s.name}
                      <span className="block text-[11px] text-gray-400 font-mono">NIS: {s.nis}</span>
                    </td>
                    <td className="py-3.5 text-center text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-xs">{s.class}</span>
                    </td>
                    <td className="py-3.5 text-center text-gray-300 font-mono">{s.theory}</td>
                    <td className="py-3.5 text-center text-gray-300 font-mono">{s.artwork}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-yellow-400 text-base">{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-yellow-400" /> Karya Terbaru Siswa
              </h3>
            </div>
            <div className="space-y-4">
              {artworks.slice(0, 4).map((art) => (
                <div key={art.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-yellow-400">{art.student_name || art.studentName}</span>
                    <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-mono">{art.status}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{art.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{art.description}</p>
                  <a href={art.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 font-medium">
                    Lihat Tautan Karya <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
              {artworks.length === 0 && <p className="text-xs text-gray-400">Belum ada karya yang dikirim siswa.</p>}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 via-gray-900 to-[#111827] border border-yellow-500/30 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-yellow-400 mb-2">SMP Muhammadiyah 6 Surabaya</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Ekskul Fotografi & Videografi (SIXNEMA) membekali siswa dengan keahlian jurnalistik visual, penyutradaraan video pendek, dan penguasaan kamera profesional.
            </p>
            <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-800">
              <span>Lokasi: Karang Pilang</span>
              <span className="text-yellow-400 font-mono">NPSN: 20532531</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
