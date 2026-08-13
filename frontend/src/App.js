import React, { createContext, useContext, useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Camera, Video, Users, BookOpen, Award, FileText, CheckCircle, 
  XCircle, AlertCircle, LogOut, Shield, UserCheck, GraduationCap, 
  BarChart2, Star, TrendingUp, Plus, Trash2, Edit, MessageSquare,
  Search, ExternalLink, Calendar, CheckSquare, Sparkles, AlertTriangle
} from 'lucide-react';

// Initial 15 Students of SMP Muhammadiyah 6 Surabaya
const INITIAL_STUDENTS = [
  { id: 1, name: "Ahmad Zaki Al-Farizi", nis: "2024001", class: "8A", theory: 88, artwork: 92, total: 90.0, attendance: { present: 12, absent: 0, sick: 1 }, notes: "Sangat antusias dalam teknik pencahayaan low-key portrait." },
  { id: 2, name: "Siti Nur Haliza", nis: "2024002", class: "8A", theory: 90, artwork: 95, total: 93.0, attendance: { present: 13, absent: 0, sick: 0 }, notes: "Karya videografi sinematik pendek sangat kreatif dan rapi." },
  { id: 3, name: "Rizky Ramadhan", nis: "2024003", class: "8B", theory: 82, artwork: 85, total: 83.8, attendance: { present: 11, absent: 1, sick: 1 }, notes: "Perlu latihan lebih konsisten pada exposure manual." },
  { id: 4, name: "Dewi Lestari", nis: "2024004", class: "8B", theory: 85, artwork: 88, total: 86.8, attendance: { present: 13, absent: 0, sick: 0 }, notes: "Komposisi rule of thirds sudah sangat baik." },
  { id: 5, name: "Muhammad Farel", nis: "2024005", class: "9A", theory: 78, artwork: 80, total: 79.2, attendance: { present: 10, absent: 2, sick: 1 }, notes: "Tingkatkan ketepatan waktu pengumpulan link karya." },
  { id: 6, name: "Aisyah Zahra", nis: "2024006", class: "9A", theory: 92, artwork: 96, total: 94.4, attendance: { present: 13, absent: 0, sick: 0 }, notes: "Talenta luar biasa di bidang editing video dokumenter sekolah." },
  { id: 7, name: "Budi Santoso", nis: "2024007", class: "7C", theory: 75, artwork: 78, total: 76.8, attendance: { present: 9, absent: 3, sick: 1 }, notes: "Aktif bertanya saat sesi teori kamera." },
  { id: 8, name: "Nabila Putri", nis: "2024008", class: "7C", theory: 88, artwork: 90, total: 89.2, attendance: { present: 12, absent: 1, sick: 0 }, notes: "Fotografi makro bunga di halaman sekolah sangat tajam." },
  { id: 9, name: "Dimas Anggara", nis: "2024009", class: "8C", theory: 80, artwork: 82, total: 81.2, attendance: { present: 11, absent: 2, sick: 0 }, notes: "Konsisten hadir dan disiplin dalam perawatan lensa." },
  { id: 10, name: "Zahra Salsabila", nis: "2024010", class: "8C", theory: 86, artwork: 89, total: 87.8, attendance: { present: 13, absent: 0, sick: 0 }, notes: "Paham betul teknik panning dan shutter speed." },
  { id: 11, name: "Rehan Pratama", nis: "2024011", class: "9B", theory: 79, artwork: 81, total: 80.2, attendance: { present: 10, absent: 2, sick: 1 }, notes: "Karya videografi vlog kegiatan pramuka cukup menghibur." },
  { id: 12, name: "Safira Maharani", nis: "2024012", class: "9B", theory: 91, artwork: 94, total: 92.8, attendance: { present: 13, absent: 0, sick: 0 }, notes: "Sangat teliti dalam color grading video pendek." },
  { id: 13, name: "Aditya Pratama", nis: "2024013", class: "7A", theory: 77, artwork: 75, total: 75.8, attendance: { present: 9, absent: 2, sick: 2 }, notes: "Perlu bimbingan ekstra untuk pemahaman diafragma." },
  { id: 14, name: "Intan Permata", nis: "2024014", class: "7A", theory: 84, artwork: 87, total: 85.8, attendance: { present: 12, absent: 1, sick: 0 }, notes: "Sudah mahir menggunakan stabilizer / gimbal." },
  { id: 15, name: "Yoga Saputra", nis: "2024015", class: "8A", theory: 83, artwork: 85, total: 84.2, attendance: { present: 11, absent: 1, sick: 1 }, notes: "Kreatif mencari sudut pengambilan gambar yang unik." }
];

const INITIAL_ARTWORKS = [
  { id: 1, studentId: 1, studentName: "Ahmad Zaki Al-Farizi", title: "Siluet Senja di Lapangan SMP Musix", description: "Mengambil momen senja di lapangan basket sekolah menggunakan teknik high shutter speed.", url: "https://images.unsplash.com/photo-1513031300226-c8fb12de9ade", date: "2026-06-10", status: "Approved" },
  { id: 2, studentId: 2, studentName: "Siti Nur Haliza", title: "Profil Guru Teladan SMP Musix", description: "Video dokumenter berdurasi 2 menit tentang dedikasi guru pengajar.", url: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea", date: "2026-06-12", status: "Approved" },
  { id: 3, studentId: 6, studentName: "Aisyah Zahra", title: "Kehidupan Lab Komputer Sekolah", description: "Fotografi jurnalistik suasana siswa belajar editing video di lab.", url: "https://images.unsplash.com/photo-1567531708788-4c44105d00ff", date: "2026-06-14", status: "Approved" }
];

const INITIAL_JOURNALS = [
  { id: 1, date: "2026-06-14", topic: "Teknik Pencahayaan 3-Point Lighting di Studio", summary: "Mempelajari key light, fill light, dan back light untuk portrait tajam dan dramatis.", attendanceSummary: "Hadir: 14, Tidak Hadir: 0, Sakit: 1" },
  { id: 2, date: "2026-06-07", topic: "Pengenalan Shutter Speed dan Aperture", summary: "Praktik langsung membekukan gerakan air dan efek blur menggunakan mode manual DSLR.", attendanceSummary: "Hadir: 15, Tidak Hadir: 0, Sakit: 0" },
  { id: 3, date: "2026-05-31", topic: "Dasar Pengoperasian Gimbal dan Stabilizer Video", summary: "Latihan pergerakan kamera smooth (pan, tilt, tracking shot) untuk video sinematik.", attendanceSummary: "Hadir: 13, Tidak Hadir: 1, Sakit: 1" }
];

const INITIAL_FEEDBACK = [
  { id: 1, author: "Drs. H. M. Fauzi (Waka Kesiswaan)", targetRole: "pembina", text: "Mohon jurnal praktik luar ruangan ditingkatkan dokumentasinya untuk publikasi majalah sekolah.", date: "2026-06-13", read: false },
  { id: 2, author: "Ustadz Arifin, S.Pd", targetRole: "waka", text: "Siap Ustadz, agenda minggu depan pengambilan video kegiatan Pondok Ramadhan / Pesantren Kilat.", date: "2026-06-13", read: true }
];

const apiRequest = (path, options = {}) => fetch(`${process.env.REACT_APP_BACKEND_URL}/api${path}`, {
  ...options,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
});

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // null, 'pembina', 'siswa', 'waka'
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [artworks, setArtworks] = useState(INITIAL_ARTWORKS);
  const [journals, setJournals] = useState(INITIAL_JOURNALS);
  const [feedbackList, setFeedbackList] = useState(INITIAL_FEEDBACK);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Login modal state / Demo selector state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Quick Absensi State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState(
    INITIAL_STUDENTS.reduce((acc, s) => ({ ...acc, [s.id]: 'Hadir' }), {})
  );

  // Teaching Journal State
  const [newJournalTopic, setNewJournalTopic] = useState('');
  const [newJournalSummary, setNewJournalSummary] = useState('');

  // Add Student State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNis, setNewStudentNis] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('8A');

  // Input Grades State
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState(INITIAL_STUDENTS[0].id);
  const [theoryGradeInput, setTheoryGradeInput] = useState('');
  const [artworkGradeInput, setArtworkGradeInput] = useState('');
  const [studentNoteInput, setStudentNoteInput] = useState('');

  // Student upload artwork state
  const [artTitle, setArtTitle] = useState('');
  const [artDesc, setArtDesc] = useState('');
  const [artUrl, setArtUrl] = useState('');

  // Waka Feedback input
  const [wakaFeedbackText, setWakaFeedbackText] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      apiRequest('/students').then(r => r.ok ? r.json() : []),
      apiRequest('/journals').then(r => r.ok ? r.json() : []),
      apiRequest('/artworks').then(r => r.ok ? r.json() : []),
      apiRequest('/feedback').then(r => r.ok ? r.json() : [])
    ]).then(([remoteStudents, remoteJournals, remoteArtworks, remoteFeedback]) => {
      if (remoteStudents.length) setStudents(remoteStudents.map(s => ({ ...s, class: s.class || s.class_name })));
      if (remoteJournals.length) setJournals(remoteJournals);
      if (remoteArtworks.length) setArtworks(remoteArtworks);
      if (remoteFeedback.length) setFeedbackList(remoteFeedback);
    }).catch(() => toast.error('Sebagian data belum dapat dimuat dari server.'));
  }, [currentUser]);

  // Calculate sorted ranking (Formula: Theory 40% + Artwork 60%)
  const sortedStudents = [...students].map(s => {
    const calcTotal = Number(((s.theory * 0.4) + (s.artwork * 0.6)).toFixed(1));
    return { ...s, total: calcTotal };
  }).sort((a, b) => b.total - a.total);

  const handleLoginDemo = async (role) => {
    const credentials = {
      pembina: ['pembina@sixnema.smpmusix.sch.id', 'pembina123'],
      siswa: ['siswa@sixnema.smpmusix.sch.id', 'siswa123'],
      waka: ['waka@sixnema.smpmusix.sch.id', 'waka123']
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ email: credentials[role][0], password: credentials[role][1] })
      });
      if (!response.ok) throw new Error('Login gagal');
      const apiUser = await response.json();
    if (role === 'pembina') {
      setCurrentUser({ ...apiUser, role: 'pembina', name: 'Ustadz Arifin, S.Pd', title: 'Pembina Ekskul Fotografi & Videografi', email: credentials[role][0] });
      toast.success("Berhasil Masuk sebagai Pembina (Ustadz Arifin)");
    } else if (role === 'siswa') {
      setCurrentUser({ ...apiUser, role: 'siswa', name: 'Ahmad Zaki Al-Farizi', title: 'Siswa Ekskul (Kelas 8A)', email: credentials[role][0], studentId: 1 });
      toast.success("Berhasil Masuk sebagai Siswa (Ahmad Zaki Al-Farizi)");
    } else if (role === 'waka') {
      setCurrentUser({ ...apiUser, role: 'waka', name: 'Drs. H. M. Fauzi', title: 'Waka Kesiswaan SMP Musix', email: credentials[role][0] });
      toast.success("Berhasil Masuk sebagai Waka Kesiswaan (Drs. H. M. Fauzi)");
    }
    setActiveTab('dashboard');
    } catch (error) {
      toast.error('Tidak dapat masuk. Periksa koneksi aplikasi.');
    }
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (loginEmail === 'pembina@sixnema.smpmusix.sch.id' && loginPassword === 'pembina123') {
      handleLoginDemo('pembina');
    } else if (loginEmail === 'siswa@sixnema.smpmusix.sch.id' && loginPassword === 'siswa123') {
      handleLoginDemo('siswa');
    } else if (loginEmail === 'waka@sixnema.smpmusix.sch.id' && loginPassword === 'waka123') {
      handleLoginDemo('waka');
    } else {
      toast.error('Email atau kata sandi salah.');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName || !newStudentNis) {
      toast.error("Nama dan NIS siswa wajib diisi!");
      return;
    }
    const newId = students.length + 1;
    const studentObj = {
      id: newId,
      name: newStudentName,
      nis: newStudentNis,
      class: newStudentClass,
      theory: 75,
      artwork: 75,
      total: 75.0,
      attendance: { present: 10, absent: 0, sick: 0 },
      notes: "Siswa baru bergabung di ekstrakurikuler."
    };
    const saved = await apiRequest('/students', { method: 'POST', body: JSON.stringify({ name: newStudentName, nis: newStudentNis, class: newStudentClass }) }).then(r => r.ok ? r.json() : null);
    setStudents([...students, saved ? { ...studentObj, ...saved } : studentObj]);
    setNewStudentName('');
    setNewStudentNis('');
    toast.success(`Siswa ${newStudentName} berhasil ditambahkan!`);
  };

  const handleDeleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
    toast.success("Data siswa berhasil dihapus.");
  };

  const handleSaveGrades = async (e) => {
    e.preventDefault();
    const t = parseFloat(theoryGradeInput);
    const a = parseFloat(artworkGradeInput);
    if (isNaN(t) || isNaN(a) || t < 0 || t > 100 || a < 0 || a > 100) {
      toast.error("Nilai harus berada di antara 0 - 100!");
      return;
    }
    const computedTotal = Number(((t * 0.4) + (a * 0.6)).toFixed(1));

    await apiRequest(`/students/${selectedStudentForGrade}/grades`, { method: 'PATCH', body: JSON.stringify({ theory: t, artwork: a, notes: studentNoteInput }) });
    setStudents(students.map(s => {
      if (s.id === Number(selectedStudentForGrade)) {
        return {
          ...s,
          theory: t,
          artwork: a,
          total: computedTotal,
          notes: studentNoteInput ? studentNoteInput : s.notes
        };
      }
      return s;
    }));
    toast.success("Nilai dan catatan siswa berhasil diperbarui! (Teori 40% + Karya 60%)");
    setTheoryGradeInput('');
    setArtworkGradeInput('');
    setStudentNoteInput('');
  };

  const handleAddJournal = async (e) => {
    e.preventDefault();
    if (!newJournalTopic || !newJournalSummary) {
      toast.error("Topik dan ringkasan jurnal wajib diisi!");
      return;
    }
    const newJ = {
      id: journals.length + 1,
      date: new Date().toISOString().split('T')[0],
      topic: newJournalTopic,
      summary: newJournalSummary,
      attendanceSummary: "Hadir: 14, Tidak Hadir: 0, Sakit: 1"
    };
    const saved = await apiRequest('/journals', { method: 'POST', body: JSON.stringify({ topic: newJournalTopic, summary: newJournalSummary }) }).then(r => r.ok ? r.json() : null);
    setJournals([saved ? { ...newJ, ...saved } : newJ, ...journals]);
    setNewJournalTopic('');
    setNewJournalSummary('');
    toast.success("Jurnal pengajaran berhasil disimpan!");
  };

  const handleSubmitArtwork = async (e) => {
    e.preventDefault();
    if (!artTitle || !artDesc) {
      toast.error("Judul dan deskripsi karya wajib diisi!");
      return;
    }
    const studentInfo = students.find(s => s.id === currentUser.studentId) || students[0];
    const newArt = {
      id: artworks.length + 1,
      studentId: studentInfo.id,
      studentName: studentInfo.name,
      title: artTitle,
      description: artDesc,
      url: artUrl || "https://images.unsplash.com/photo-1513031300226-c8fb12de9ade",
      date: new Date().toISOString().split('T')[0],
      status: "Pending Review"
    };
    const saved = await apiRequest('/artworks', { method: 'POST', body: JSON.stringify({ title: artTitle, url: artUrl, description: artDesc }) }).then(r => r.ok ? r.json() : null);
    setArtworks([saved ? { ...newArt, ...saved } : newArt, ...artworks]);
    setArtTitle('');
    setArtDesc('');
    setArtUrl('');
    toast.success("Link karya berhasil dikirim ke Pembina untuk dinilai!");
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!wakaFeedbackText) return;
    const newFB = {
      id: feedbackList.length + 1,
      author: currentUser.role === 'waka' ? "Drs. H. M. Fauzi (Waka Kesiswaan)" : "Ustadz Arifin, S.Pd (Pembina)",
      targetRole: currentUser.role === 'waka' ? "pembina" : "waka",
      text: wakaFeedbackText,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    const saved = await apiRequest('/feedback', { method: 'POST', body: JSON.stringify({ text: wakaFeedbackText, target_role: newFB.targetRole }) }).then(r => r.ok ? r.json() : null);
    setFeedbackList([saved ? { ...newFB, ...saved } : newFB, ...feedbackList]);
    setWakaFeedbackText('');
    toast.success("Pesan/feedback langsung berhasil dikirim!");
  };

  const handleSaveAttendance = async () => {
    await apiRequest('/attendance', { method: 'POST', body: JSON.stringify({ date: attendanceDate, records: attendanceRecords }) });
    toast.success(`Absensi tanggal ${attendanceDate} berhasil disimpan!`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col justify-between selection:bg-yellow-500 selection:text-black">
        <Toaster position="top-right" richColors />
        
        {/* Top Header */}
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

        {/* Hero Auth Section */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info Banner */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Portal Kreatif Sinematik & Fotografi
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                Abadikan Momen, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
                  Ciptakan Karya Bermakna.
                </span>
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
                Sistem manajemen terpadu ekstrakurikuler Fotografi & Videografi SMP Muhammadiyah 6 Surabaya. Dilengkapi absensi cepat, penilaian objektif (Teori 40% + Karya 60%), jurnal pengajaran, dan pemantauan langsung Waka Kesiswaan.
              </p>

              {/* Quick Demo Role Cards */}
              <div className="pt-4">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Pilih Akses Cepat Demo Peran:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleLoginDemo('pembina')}
                    data-testid="demo-pembina-btn"
                    className="p-4 rounded-xl bg-gray-900/80 border border-yellow-500/30 hover:border-yellow-400 text-left transition-all group hover:shadow-lg hover:shadow-yellow-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-mono">Demo</span>
                    </div>
                    <div className="font-bold text-white text-sm">Pembina</div>
                    <div className="text-xs text-gray-400 mt-0.5">Ustadz Arifin, S.Pd</div>
                  </button>

                  <button 
                    onClick={() => handleLoginDemo('siswa')}
                    data-testid="demo-siswa-btn"
                    className="p-4 rounded-xl bg-gray-900/80 border border-yellow-500/30 hover:border-yellow-400 text-left transition-all group hover:shadow-lg hover:shadow-yellow-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-mono">Demo</span>
                    </div>
                    <div className="font-bold text-white text-sm">Siswa</div>
                    <div className="text-xs text-gray-400 mt-0.5">Ahmad Zaki (15 Siswa)</div>
                  </button>

                  <button 
                    onClick={() => handleLoginDemo('waka')}
                    data-testid="demo-waka-btn"
                    className="p-4 rounded-xl bg-gray-900/80 border border-yellow-500/30 hover:border-yellow-400 text-left transition-all group hover:shadow-lg hover:shadow-yellow-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-mono">Demo</span>
                    </div>
                    <div className="font-bold text-white text-sm">Waka Kesiswaan</div>
                    <div className="text-xs text-gray-400 mt-0.5">Drs. H. M. Fauzi</div>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Login Form */}
            <div className="lg:col-span-5 bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Masuk ke Akun Sixnema</h3>
                <p className="text-xs text-gray-400 mt-1">Gunakan kredensial akun demo atau email terdaftar</p>
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
                <p className="text-xs text-gray-400">
                  Didukung oleh OSIS & Tim IT SMP Muhammadiyah 6 Surabaya
                </p>
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-[#111827]/40 py-6 text-center text-xs text-gray-400">
          <p>© 2026 SIXNEMA SMP Muhammadiyah 6 Surabaya • Jl. Kemlaten Baru 43, Kebraon, Karang Pilang, Surabaya</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col selection:bg-yellow-500 selection:text-black">
      <Toaster position="top-right" richColors />

      {/* Main Sticky Navbar */}
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

        {/* Navigation Tabs based on Role */}
        <nav className="hidden md:flex items-center space-x-1 bg-gray-900/90 p-1.5 rounded-xl border border-gray-800">
          <button 
            onClick={() => setActiveTab('dashboard')}
            data-testid="nav-dashboard-tab"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <BarChart2 className="w-4 h-4" /> Dashboard Utama
          </button>

          {currentUser.role === 'pembina' && (
            <>
              <button 
                onClick={() => setActiveTab('absensi')}
                data-testid="nav-absensi-tab"
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'absensi' ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <CheckSquare className="w-4 h-4" /> Absensi Cepat
              </button>
              <button 
                onClick={() => setActiveTab('jurnal')}
                data-testid="nav-jurnal-tab"
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'jurnal' ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <BookOpen className="w-4 h-4" /> Jurnal & Nilai
              </button>
              <button 
                onClick={() => setActiveTab('siswa')}
                data-testid="nav-siswa-tab"
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'siswa' ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Users className="w-4 h-4" /> Kelola Siswa ({students.length})
              </button>
            </>
          )}

          {currentUser.role === 'siswa' && (
            <>
              <button 
                onClick={() => setActiveTab('karya')}
                data-testid="nav-karya-tab"
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'karya' ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Video className="w-4 h-4" /> Kirim Link Karya
              </button>
              <button 
                onClick={() => setActiveTab('rapor')}
                data-testid="nav-rapor-tab"
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'rapor' ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Award className="w-4 h-4" /> Rapor & Catatan
              </button>
            </>
          )}

          {currentUser.role === 'waka' && (
            <>
              <button 
                onClick={() => setActiveTab('pantau')}
                data-testid="nav-pantau-tab"
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'pantau' ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Shield className="w-4 h-4" /> Pantau & Feedback
              </button>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{currentUser.name}</p>
            <p className="text-[10px] text-yellow-400">{currentUser.title}</p>
          </div>
          <button 
            onClick={() => { setCurrentUser(null); setActiveTab('dashboard'); apiRequest('/auth/logout', { method: 'POST' }).catch(() => {}); }}
            data-testid="logout-btn"
            title="Keluar / Ganti Peran"
            className="p-2.5 rounded-xl bg-gray-900 hover:bg-red-500/10 hover:text-red-400 border border-gray-800 hover:border-red-500/30 transition-all text-gray-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden bg-gray-900 border-b border-gray-800 px-4 py-2 overflow-x-auto space-x-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400'}`}
        >
          Dashboard
        </button>
        {currentUser.role === 'pembina' && (
          <>
            <button onClick={() => setActiveTab('absensi')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'absensi' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400'}`}>Absensi</button>
            <button onClick={() => setActiveTab('jurnal')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'jurnal' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400'}`}>Jurnal & Nilai</button>
            <button onClick={() => setActiveTab('siswa')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'siswa' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400'}`}>Siswa</button>
          </>
        )}
        {currentUser.role === 'siswa' && (
          <>
            <button onClick={() => setActiveTab('karya')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'karya' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400'}`}>Kirim Karya</button>
            <button onClick={() => setActiveTab('rapor')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'rapor' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400'}`}>Rapor & Catatan</button>
          </>
        )}
        {currentUser.role === 'waka' && (
          <button onClick={() => setActiveTab('pantau')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === 'pantau' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400'}`}>Pantau & Feedback</button>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        
        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Welcome Banner */}
            <div className="relative bg-gradient-to-r from-gray-900 via-[#111827] to-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden lg:block bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513031300226-c8fb12de9ade')` }}></div>
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> Ekskul Unggulan SMP Musix 2026
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Selamat Datang, <span className="text-yellow-400">{currentUser.name}</span>!
                </h2>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {currentUser.role === 'pembina' && "Kelola absensi cepat, jurnal mengajaran, dan input nilai teori (40%) serta karya (60%) dengan mudah."}
                  {currentUser.role === 'siswa' && "Unggah tautan karya fotografi & videografimu, pantau nilai rapor harian, dan lihat catatan personal dari pembina."}
                  {currentUser.role === 'waka' && "Pantau laporan seluruh pembina ekskul, rekapitulasi nilai siswa, dan berikan feedback langsung secara real-time."}
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-mono">Aktif</span>
                </div>
                <h4 className="text-3xl font-black text-white">{students.length} Siswa</h4>
                <p className="text-xs text-gray-400 mt-1">Peserta Ekskul Fotografi</p>
              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded font-mono">Koleksi</span>
                </div>
                <h4 className="text-3xl font-black text-white">{artworks.length} Karya</h4>
                <p className="text-xs text-gray-400 mt-1">Tautan & Portofolio Siswa</p>
              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">Jurnal</span>
                </div>
                <h4 className="text-3xl font-black text-white">{journals.length} Sesi</h4>
                <p className="text-xs text-gray-400 mt-1">Jurnal Pengajaran Selesai</p>
              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-mono">Formula 40:60</span>
                </div>
                <h4 className="text-3xl font-black text-white">{sortedStudents[0]?.total || 94.4}</h4>
                <p className="text-xs text-gray-400 mt-1">Nilai Tertinggi Saat Ini</p>
              </div>
            </div>

            {/* Ranking & Top Students Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Leaderboard Ranking (8 cols) */}
              <div className="lg:col-span-8 bg-[#111827] border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Sistem Ranking Otomatis Siswa
                    </h3>
                    <p className="text-xs text-gray-400">Berdasarkan total nilai (Teori 40% + Karya 60%)</p>
                  </div>
                  <span className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/20 font-mono">
                    Total: {students.length} Siswa
                  </span>
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

              {/* Right Sidebar: Recent Artworks & Feedback */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Recent Artworks */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-yellow-400" /> Karya Terbaru Siswa
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {artworks.map(art => (
                      <div key={art.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-yellow-400">{art.studentName}</span>
                          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-mono">{art.status}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{art.title}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{art.description}</p>
                        <a 
                          href={art.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 font-medium"
                        >
                          Lihat Tautan Karya <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* School Info Card */}
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
        )}


        {/* ================= PEMBINA: ABSENSI CEPAT ================= */}
        {activeTab === 'absensi' && currentUser.role === 'pembina' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-yellow-400" /> Absensi Cepat Peserta Ekskul
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Catat kehadiran 15 siswa untuk pertemuan hari ini</p>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="date" 
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                  <button 
                    onClick={handleSaveAttendance}
                    data-testid="save-attendance-btn"
                    className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-yellow-500/20"
                  >
                    Simpan Absensi
                  </button>
                </div>
              </div>

              {/* Attendance Table */}
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

                    {/* Status Selectors */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      {['Hadir', 'Tidak Hadir', 'Sakit'].map(status => {
                        const current = attendanceRecords[s.id] || 'Hadir';
                        const isSelected = current === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setAttendanceRecords({ ...attendanceRecords, [s.id]: status })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isSelected 
                                ? status === 'Hadir' ? 'bg-green-500 text-black shadow-md shadow-green-500/20' : status === 'Sakit' ? 'bg-blue-500 text-black shadow-md shadow-blue-500/20' : 'bg-red-500 text-black shadow-md shadow-red-500/20'
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
          </div>
        )}


        {/* ================= PEMBINA: JURNAL & NILAI ================= */}
        {activeTab === 'jurnal' && currentUser.role === 'pembina' && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
            
            {/* Jurnal Pengajaran Section */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <BookOpen className="w-6 h-6 text-yellow-400" /> Jurnal Pengajaran & Ringkasan Materi
              </h3>
              <p className="text-xs text-gray-400 mb-6">Catat materi pertemuan untuk arsip Waka Kesiswaan dan rekap kehadiran</p>

              <form onSubmit={handleAddJournal} className="space-y-4 mb-8 bg-gray-900 p-5 rounded-xl border border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Topik / Materi Pelajaran</label>
                    <input 
                      type="text" 
                      placeholder="Cth: Teknik Color Grading Video Sinematik"
                      value={newJournalTopic}
                      onChange={(e) => setNewJournalTopic(e.target.value)}
                      data-testid="journal-topic-input"
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Ringkasan Kegiatan & Praktik</label>
                    <input 
                      type="text" 
                      placeholder="Cth: Siswa praktik langsung menggunakan software Premiere..."
                      value={newJournalSummary}
                      onChange={(e) => setNewJournalSummary(e.target.value)}
                      data-testid="journal-summary-input"
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  data-testid="add-journal-btn"
                  className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition-all shadow-md shadow-yellow-500/20"
                >
                  + Tambah Jurnal Pengajaran
                </button>
              </form>

              {/* Journal List */}
              <div className="space-y-4">
                {journals.map(j => (
                  <div key={j.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="text-base font-bold text-white">{j.topic}</h4>
                      <span className="text-xs text-yellow-400 font-mono">{j.date}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{j.summary}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gray-800 text-xs text-gray-400 font-mono">
                      <span>Kehadiran:</span> <span className="text-green-400 font-bold">{j.attendanceSummary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Nilai Teori (40%) & Karya (60%) Section */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400" /> Input Nilai Teori & Karya Siswa
                </h3>
                <p className="text-xs text-gray-400 mt-1">Bobot Penilaian Otomatis: <span className="text-yellow-400 font-bold">Teori 40% + Karya 60%</span></p>
              </div>

              <form onSubmit={handleSaveGrades} className="space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">Pilih Siswa</label>
                    <select 
                      value={selectedStudentForGrade}
                      onChange={(e) => setSelectedStudentForGrade(e.target.value)}
                      data-testid="grade-student-select"
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.class})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">Nilai Teori (Bobot 40%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      placeholder="Cth: 88"
                      value={theoryGradeInput}
                      onChange={(e) => setTheoryGradeInput(e.target.value)}
                      data-testid="theory-grade-input"
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">Nilai Karya (Bobot 60%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      placeholder="Cth: 92"
                      value={artworkGradeInput}
                      onChange={(e) => setArtworkGradeInput(e.target.value)}
                      data-testid="artwork-grade-input"
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Catatan Personal Siswa / Evaluasi</label>
                  <input 
                    type="text" 
                    placeholder="Cth: Sangat kreatif dalam pengambilan sudut pandang low angle."
                    value={studentNoteInput}
                    onChange={(e) => setStudentNoteInput(e.target.value)}
                    data-testid="student-note-input"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <button 
                  type="submit"
                  data-testid="save-grade-btn"
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2"
                >
                  <Award className="w-4 h-4" /> Simpan & Hitung Nilai Rapor
                </button>
              </form>
            </div>

          </div>
        )}


        {/* ================= PEMBINA: KELOLA SISWA ================= */}
        {activeTab === 'siswa' && currentUser.role === 'pembina' && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
            
            {/* Add Student Card */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-yellow-400" /> Tambah Siswa Peserta Ekskul
              </h3>
              <p className="text-xs text-gray-400 mb-6">Tambah siswa satu per satu ke dalam daftar ekstrakurikuler fotografi</p>

              <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-900 p-5 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Nama Lengkap Siswa</label>
                  <input 
                    type="text" 
                    placeholder="Cth: Fajar Satria"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    data-testid="new-student-name-input"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Nomor Induk Siswa (NIS)</label>
                  <input 
                    type="text" 
                    placeholder="Cth: 2024016"
                    value={newStudentNis}
                    onChange={(e) => setNewStudentNis(e.target.value)}
                    data-testid="new-student-nis-input"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Kelas</label>
                  <select 
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    data-testid="new-student-class-select"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="7A">7A</option>
                    <option value="7B">7B</option>
                    <option value="7C">7C</option>
                    <option value="8A">8A</option>
                    <option value="8B">8B</option>
                    <option value="8C">8C</option>
                    <option value="9A">9A</option>
                    <option value="9B">9B</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit"
                    data-testid="add-student-btn"
                    className="w-full py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl shadow-md shadow-yellow-500/20 transition-all"
                  >
                    + Tambah Siswa
                  </button>
                </div>
              </form>
            </div>

            {/* Students List Table */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Daftar 15+ Siswa Peserta Ekskul</h3>
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
                            onClick={() => handleDeleteStudent(s.id)}
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
        )}


        {/* ================= SISWA: KIRIM LINK KARYA ================= */}
        {activeTab === 'karya' && currentUser.role === 'siswa' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Video className="w-6 h-6 text-yellow-400" /> Kirim Tautan Karya & Deskripsi Singkat
                </h3>
                <p className="text-xs text-gray-400 mt-1">Unggah link portofolio (Google Drive / YouTube / Instagram / Behance) tanpa perlu unggah file.</p>
              </div>

              <form onSubmit={handleSubmitArtwork} className="space-y-5 bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Judul Karya Fotografi / Videografi</label>
                  <input 
                    type="text" 
                    placeholder="Cth: Potret Siluet Senja di Halaman Sekolah"
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    data-testid="art-title-input"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Tautan Karya (URL Link)</label>
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/... atau https://youtube.com/..."
                    value={artUrl}
                    onChange={(e) => setArtUrl(e.target.value)}
                    data-testid="art-url-input"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Deskripsi Singkat / Cerita di Balik Lensa</label>
                  <textarea 
                    rows="3"
                    placeholder="Jelaskan teknik yang digunakan (ISO, Shutter speed, konsep cerita)..."
                    value={artDesc}
                    onChange={(e) => setArtDesc(e.target.value)}
                    data-testid="art-desc-input"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  data-testid="submit-artwork-btn"
                  className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" /> Kirim Karya ke Pembina
                </button>
              </form>
            </div>

            {/* Student's Submissions */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-4">Riwayat Karya Saya</h3>
              <div className="space-y-4">
                {artworks.filter(a => a.studentId === currentUser.studentId || a.studentName.includes("Ahmad Zaki")).map(art => (
                  <div key={art.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded font-mono">{art.status}</span>
                      <h4 className="text-sm font-bold text-white mt-1">{art.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{art.description}</p>
                    </div>
                    <a 
                      href={art.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      Buka Tautan <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* ================= SISWA: RAPOR & CATATAN PRIBADI ================= */}
        {activeTab === 'rapor' && currentUser.role === 'siswa' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            {(() => {
              const studentInfo = students.find(s => s.id === (currentUser.studentId || 1)) || students[0];
              return (
                <div className="space-y-6">
                  {/* Student Card Summary */}
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
                        <div className="text-3xl font-black text-yellow-400 font-mono mt-0.5">{studentInfo.total}</div>
                        <span className="text-[10px] text-green-400">Teori 40% + Karya 60%</span>
                      </div>
                    </div>
                  </div>

                  {/* Detail Breakdown */}
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
                        <span>Kehadiran: {studentInfo.attendance.present} Hadir</span>
                        <span className="text-yellow-400 font-mono">Status: Sangat Baik</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}


        {/* ================= WAKA KESISWAAN: PANTAU & FEEDBACK ================= */}
        {activeTab === 'pantau' && currentUser.role === 'waka' && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
            
            {/* Waka Header Banner */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-yellow-400" /> Pantapan Laporan Pembina & Rekapitulasi
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Pengawasan langsung program ekstrakurikuler SMP Muhammadiyah 6 Surabaya</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-xl text-yellow-400 text-xs font-mono">
                  Status: Operasional Lancar (Akreditasi A)
                </div>
              </div>

              {/* Feedback Form */}
              <form onSubmit={handleSendFeedback} className="bg-gray-900 p-5 rounded-xl border border-gray-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-yellow-400" /> Berikan Feedback Langsung ke Pembina (Ustadz Arifin)
                </h4>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Cth: Mohon laporan dokumentasi Pesantren Kilat difokuskan minggu ini..."
                    value={wakaFeedbackText}
                    onChange={(e) => setWakaFeedbackText(e.target.value)}
                    data-testid="waka-feedback-input"
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                  <button 
                    type="submit"
                    data-testid="waka-send-feedback-btn"
                    className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition-all shadow-md shadow-yellow-500/20 whitespace-nowrap"
                  >
                    Kirim Feedback
                  </button>
                </div>
              </form>
            </div>

            {/* Feedback & Report History */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-4">Riwayat Komunikasi & Catatan Pengawasan</h3>
              <div className="space-y-4">
                {feedbackList.map(fb => (
                  <div key={fb.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-yellow-400">{fb.author}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{fb.date}</span>
                    </div>
                    <p className="text-sm text-gray-200">{fb.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Student Performance Overview */}
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

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#111827]/60 py-6 text-center text-xs text-gray-400">
        <p>© 2026 SIXNEMA SMP Muhammadiyah 6 Surabaya • Jl. Kemlaten Baru 43, Kebraon, Karang Pilang, Surabaya</p>
      </footer>
    </div>
  );
}
