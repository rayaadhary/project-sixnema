import React, { useEffect, useState } from 'react';
import { CheckSquare, BookOpen, Award, Users, Trash2, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { downloadCsv, downloadPdf } from '../../lib/exports';
import GradeChart from '../GradeChart';
import FlipbookUpload from '../FlipbookUpload';

const CLASSES = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B'];

export function PembinaAbsensi({ students, onSaved }) {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({});

  useEffect(() => {
    setRecords((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (!next[s.id]) next[s.id] = 'Hadir';
      });
      return next;
    });
  }, [students]);

  const handleSave = async () => {
    try {
      await api.saveAttendance({ date: attendanceDate, records });
      toast.success(`Absensi tanggal ${attendanceDate} berhasil disimpan!`);
      onSaved?.();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan absensi');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-yellow-400" /> Absensi Cepat Peserta Ekskul
            </h3>
            <p className="text-xs text-gray-400 mt-1">Catat kehadiran seluruh siswa untuk pertemuan hari ini</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              data-testid="attendance-date-input"
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
            <button
              onClick={handleSave}
              data-testid="save-attendance-btn"
              className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-yellow-500/20"
            >
              Simpan Absensi
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {students.map((s, index) => (
            <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-700 transition-all">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs text-gray-400 w-6">#{index + 1}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{s.name}</h4>
                  <p className="text-xs text-gray-400">NIS: {s.nis} • Kelas {s.class}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                {['Hadir', 'Tidak Hadir', 'Sakit'].map((status) => {
                  const current = records[s.id] || 'Hadir';
                  const isSelected = current === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setRecords({ ...records, [s.id]: status })}
                      data-testid={`attendance-${s.id}-${status.replace(' ', '-').toLowerCase()}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? status === 'Hadir'
                            ? 'bg-green-500 text-black shadow-md shadow-green-500/20'
                            : status === 'Sakit'
                            ? 'bg-blue-500 text-black shadow-md shadow-blue-500/20'
                            : 'bg-red-500 text-black shadow-md shadow-red-500/20'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FlipbookUpload />
    </div>
  );
}

export function PembinaJurnal({ students, journals, onJournalAdded, onStudentUpdated }) {
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [theory, setTheory] = useState('');
  const [artwork, setArtwork] = useState('');
  const [note, setNote] = useState('');
  const [selectedForChart, setSelectedForChart] = useState('');

  useEffect(() => {
    if (!selectedId && students.length) setSelectedId(students[0].id);
    if (!selectedForChart && students.length) setSelectedForChart(students[0].id);
  }, [students, selectedId, selectedForChart]);

  const exportJournalsCsv = () => {
    const rows = [['Tanggal', 'Topik', 'Ringkasan', 'Kehadiran']];
    journals.forEach((j) => rows.push([j.date, j.topic, j.summary, j.attendance_summary || j.attendanceSummary || '-']));
    downloadCsv(rows, 'sixnema-jurnal.csv');
    toast.success('Jurnal CSV berhasil diunduh.');
  };

  const exportJournalsPdf = () => {
    const rows = journals.map((j) => [j.date, j.topic, j.summary, j.attendance_summary || j.attendanceSummary || '-']);
    downloadPdf({
      title: 'Rekap Jurnal Pengajaran SIXNEMA',
      subtitle: 'SMP Muhammadiyah 6 Surabaya',
      columns: ['Tanggal', 'Topik', 'Ringkasan', 'Kehadiran'],
      rows,
      filename: 'sixnema-jurnal.pdf',
    });
    toast.success('Jurnal PDF berhasil diunduh.');
  };

  const submitJournal = async (e) => {
    e.preventDefault();
    if (!topic || !summary) {
      toast.error('Topik dan ringkasan jurnal wajib diisi!');
      return;
    }
    try {
      const saved = await api.createJournal({ topic, summary });
      onJournalAdded(saved);
      setTopic('');
      setSummary('');
      toast.success('Jurnal pengajaran berhasil disimpan!');
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan jurnal');
    }
  };

  const saveGrades = async (e) => {
    e.preventDefault();
    const t = parseFloat(theory);
    const a = parseFloat(artwork);
    if (Number.isNaN(t) || Number.isNaN(a) || t < 0 || t > 100 || a < 0 || a > 100) {
      toast.error('Nilai harus berada di antara 0 - 100!');
      return;
    }
    try {
      const updated = await api.updateGrades(selectedId, { theory: t, artwork: a, notes: note });
      onStudentUpdated(updated);
      toast.success('Nilai dan catatan siswa berhasil diperbarui! (Teori 40% + Karya 60%)');
      setTheory('');
      setArtwork('');
      setNote('');
      if (selectedForChart === selectedId) setSelectedForChart((v) => v);
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan nilai');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-yellow-400" /> Jurnal Pengajaran & Ringkasan Materi
            </h3>
            <p className="text-xs text-gray-400 mt-1">Rekap kehadiran otomatis mengambil absensi terbaru.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportJournalsCsv} data-testid="export-journal-csv-btn" className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-yellow-500/40 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-all">
              <Download className="w-3.5 h-3.5 text-yellow-400" /> CSV
            </button>
            <button onClick={exportJournalsPdf} data-testid="export-journal-pdf-btn" className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-yellow-500/40 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-all">
              <FileText className="w-3.5 h-3.5 text-yellow-400" /> PDF
            </button>
          </div>
        </div>

        <form onSubmit={submitJournal} className="space-y-4 mb-8 bg-gray-900 p-5 rounded-xl border border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Topik / Materi Pelajaran</label>
              <input type="text" placeholder="Cth: Teknik Color Grading Video Sinematik" value={topic} onChange={(e) => setTopic(e.target.value)} data-testid="journal-topic-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Ringkasan Kegiatan & Praktik</label>
              <input type="text" placeholder="Cth: Siswa praktik langsung menggunakan software Premiere..." value={summary} onChange={(e) => setSummary(e.target.value)} data-testid="journal-summary-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400" />
            </div>
          </div>
          <button type="submit" data-testid="add-journal-btn" className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition-all shadow-md shadow-yellow-500/20">
            + Tambah Jurnal Pengajaran
          </button>
        </form>

        <div className="space-y-4">
          {journals.map((j) => (
            <div key={j.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h4 className="text-base font-bold text-white">{j.topic}</h4>
                <span className="text-xs text-yellow-400 font-mono">{j.date}</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">{j.summary}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gray-800 text-xs text-gray-400 font-mono">
                <span>Kehadiran:</span> <span className="text-green-400 font-bold">{j.attendance_summary || j.attendanceSummary}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" /> Input Nilai Teori & Karya Siswa
          </h3>
          <p className="text-xs text-gray-400 mt-1">Bobot Penilaian Otomatis: <span className="text-yellow-400 font-bold">Teori 40% + Karya 60%</span></p>
        </div>

        <form onSubmit={saveGrades} className="space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Pilih Siswa</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} data-testid="grade-student-select" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400">
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{`${s.name} (${s.class})`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Nilai Teori (Bobot 40%)</label>
              <input type="number" min="0" max="100" placeholder="Cth: 88" value={theory} onChange={(e) => setTheory(e.target.value)} data-testid="theory-grade-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Nilai Karya (Bobot 60%)</label>
              <input type="number" min="0" max="100" placeholder="Cth: 92" value={artwork} onChange={(e) => setArtwork(e.target.value)} data-testid="artwork-grade-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Catatan Personal Siswa / Evaluasi</label>
            <input type="text" placeholder="Cth: Sangat kreatif dalam pengambilan sudut pandang low angle." value={note} onChange={(e) => setNote(e.target.value)} data-testid="student-note-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400" />
          </div>
          <button type="submit" data-testid="save-grade-btn" className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2">
            <Award className="w-4 h-4" /> Simpan & Hitung Nilai Rapor
          </button>
        </form>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Grafik Perkembangan Nilai Siswa</h3>
            <p className="text-xs text-gray-400 mt-1">Pantau progres nilai teori, karya, dan rata-rata bulanan.</p>
          </div>
          <select value={selectedForChart} onChange={(e) => setSelectedForChart(e.target.value)} data-testid="chart-student-select" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-400">
            {students.map((s) => (
              <option key={s.id} value={s.id}>{`${s.name} (${s.class})`}</option>
            ))}
          </select>
        </div>
        {selectedForChart && <GradeChart studentId={selectedForChart} studentName={students.find((s) => s.id === selectedForChart)?.name} />}
      </div>
    </div>
  );
}

export function PembinaSiswa({ students, onStudentAdded, onStudentDeleted }) {
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [cls, setCls] = useState('8A');

  const addStudent = async (e) => {
    e.preventDefault();
    if (!name || !nis) {
      toast.error('Nama dan NIS siswa wajib diisi!');
      return;
    }
    try {
      const saved = await api.createStudent({ name, nis, class: cls });
      onStudentAdded(saved);
      setName('');
      setNis('');
      toast.success(`Siswa ${name} berhasil ditambahkan!`);
    } catch (err) {
      toast.error(err.message || 'Gagal menambah siswa');
    }
  };

  const removeStudent = async (id) => {
    try {
      await api.deleteStudent(id);
      onStudentDeleted(id);
      toast.success('Data siswa berhasil dihapus.');
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus siswa');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <Users className="w-6 h-6 text-yellow-400" /> Tambah Siswa Peserta Ekskul
        </h3>
        <p className="text-xs text-gray-400 mb-6">Tambah siswa satu per satu ke dalam daftar ekstrakurikuler fotografi</p>

        <form onSubmit={addStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-900 p-5 rounded-xl border border-gray-800">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Nama Lengkap Siswa</label>
            <input type="text" placeholder="Cth: Fajar Satria" value={name} onChange={(e) => setName(e.target.value)} data-testid="new-student-name-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Nomor Induk Siswa (NIS)</label>
            <input type="text" placeholder="Cth: 2024016" value={nis} onChange={(e) => setNis(e.target.value)} data-testid="new-student-nis-input" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Kelas</label>
            <select value={cls} onChange={(e) => setCls(e.target.value)} data-testid="new-student-class-select" className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400">
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" data-testid="add-student-btn" className="w-full py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl shadow-md shadow-yellow-500/20 transition-all">
              + Tambah Siswa
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Daftar Siswa Peserta Ekskul</h3>
            <p className="text-xs text-gray-400">SMP Muhammadiyah 6 Surabaya</p>
          </div>
          <span className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/20 font-mono">
            Total: {students.length} Siswa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" data-testid="students-management-table">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">No</th>
                <th className="pb-3 font-semibold">Nama & NIS</th>
                <th className="pb-3 font-semibold text-center">Kelas</th>
                <th className="pb-3 font-semibold">Catatan Pembina</th>
                <th className="pb-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {students.map((s, index) => (
                <tr key={s.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3.5 font-mono text-gray-400">{index + 1}</td>
                  <td className="py-3.5 font-medium text-white">
                    {s.name}
                    <span className="block text-[11px] text-gray-400 font-mono">NIS: {s.nis}</span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-xs">{s.class}</span>
                  </td>
                  <td className="py-3.5 text-xs text-gray-300 max-w-xs truncate">{s.notes}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => removeStudent(s.id)}
                      data-testid={`delete-student-${s.id}`}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
