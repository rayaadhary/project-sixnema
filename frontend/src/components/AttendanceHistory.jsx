import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { downloadCsv, downloadPdf } from '../lib/exports';

const STATUS_CLR = {
  Hadir: 'text-green-400 bg-green-500/10 border-green-500/30',
  'Tidak Hadir': 'text-red-400 bg-red-500/10 border-red-500/30',
  Sakit: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

export default function AttendanceHistory({ students }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listAttendance()
      .then(setRecords)
      .catch(() => toast.error('Gagal memuat riwayat absensi'))
      .finally(() => setLoading(false));
  }, []);

  const studentMap = useMemo(() => Object.fromEntries(students.map((s) => [s.id, s])), [students]);

  const perStudent = useMemo(() => {
    const map = new Map();
    students.forEach((s) => map.set(s.id, { student: s, Hadir: 0, 'Tidak Hadir': 0, Sakit: 0 }));
    records.forEach((rec) => {
      Object.entries(rec.records || {}).forEach(([sid, status]) => {
        const row = map.get(sid);
        if (row && row[status] !== undefined) row[status] += 1;
      });
    });
    return Array.from(map.values());
  }, [records, students]);

  const exportCsv = () => {
    const rows = [['Tanggal', 'Siswa', 'NIS', 'Kelas', 'Status']];
    records.forEach((rec) => {
      Object.entries(rec.records || {}).forEach(([sid, status]) => {
        const s = studentMap[sid];
        rows.push([rec.date, s?.name || sid, s?.nis || '-', s?.class || '-', status]);
      });
    });
    downloadCsv(rows, 'sixnema-absensi.csv');
    toast.success('Rekap absensi CSV berhasil diunduh.');
  };

  const exportPdf = () => {
    const rows = [];
    records.forEach((rec) => {
      Object.entries(rec.records || {}).forEach(([sid, status]) => {
        const s = studentMap[sid];
        rows.push([rec.date, s?.name || sid, s?.nis || '-', s?.class || '-', status]);
      });
    });
    downloadPdf({
      title: 'Rekap Absensi Ekskul SIXNEMA',
      subtitle: 'SMP Muhammadiyah 6 Surabaya',
      columns: ['Tanggal', 'Siswa', 'NIS', 'Kelas', 'Status'],
      rows,
      filename: 'sixnema-absensi.pdf',
    });
    toast.success('Rekap absensi PDF berhasil diunduh.');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-yellow-400" /> Riwayat Absensi
            </h3>
            <p className="text-xs text-gray-400 mt-1">Rekap kehadiran per tanggal dan per siswa.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              data-testid="export-attendance-csv-btn"
              className="px-4 py-2 bg-gray-900 border border-gray-800 hover:border-yellow-500/40 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-yellow-400" /> CSV
            </button>
            <button
              onClick={exportPdf}
              data-testid="export-attendance-pdf-btn"
              className="px-4 py-2 bg-gray-900 border border-gray-800 hover:border-yellow-500/40 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-yellow-400" /> PDF
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Memuat data absensi...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-400" data-testid="attendance-history-empty">Belum ada absensi tercatat. Simpan absensi pertama dari tab Absensi Cepat.</p>
        ) : (
          <div className="space-y-8" data-testid="attendance-history-list">
            <div>
              <h4 className="text-sm font-bold text-white mb-3">Per Tanggal</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {records.map((rec) => {
                  const counts = { Hadir: 0, 'Tidak Hadir': 0, Sakit: 0 };
                  Object.values(rec.records || {}).forEach((s) => {
                    if (counts[s] !== undefined) counts[s] += 1;
                  });
                  return (
                    <div key={rec.id || rec.date} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-white font-mono">{rec.date}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {Object.keys(rec.records || {}).length} siswa
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {Object.entries(counts).map(([status, count]) => (
                          <span key={status} className={`px-2 py-1 rounded border ${STATUS_CLR[status]}`}>
                            {status}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">Per Siswa</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" data-testid="attendance-per-student-table">
                  <thead>
                    <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Nama Siswa</th>
                      <th className="pb-3 font-semibold text-center">Kelas</th>
                      <th className="pb-3 font-semibold text-center">Hadir</th>
                      <th className="pb-3 font-semibold text-center">Tidak Hadir</th>
                      <th className="pb-3 font-semibold text-center">Sakit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {perStudent.map(({ student, ...c }) => (
                      <tr key={student.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 font-medium text-white">
                          {student.name}
                          <span className="block text-[11px] text-gray-400 font-mono">NIS: {student.nis}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-xs">{student.class}</span>
                        </td>
                        <td className="py-3 text-center font-mono text-green-400">{c.Hadir}</td>
                        <td className="py-3 text-center font-mono text-red-400">{c['Tidak Hadir']}</td>
                        <td className="py-3 text-center font-mono text-blue-400">{c.Sakit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
