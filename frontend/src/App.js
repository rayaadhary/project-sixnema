import React, { useCallback, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { api } from './lib/api';
import AuthScreen from './components/AuthScreen';
import AppShell from './components/AppShell';
import DashboardHome from './components/DashboardHome';
import { PembinaAbsensi, PembinaJurnal, PembinaSiswa } from './components/dashboards/PembinaDashboard';
import { SiswaKarya, SiswaRapor } from './components/dashboards/SiswaDashboard';
import WakaPantau from './components/dashboards/WakaDashboard';
import AttendanceHistory from './components/AttendanceHistory';
import FlipbookViewer from './components/FlipbookViewer';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [students, setStudents] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [journals, setJournals] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    api.me().then(setCurrentUser).catch(() => {}).finally(() => setCheckingSession(false));
  }, []);

  const loadAll = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [s, j, a, f] = await Promise.all([
        api.listStudents(),
        api.listJournals(),
        api.listArtworks(),
        api.listFeedback(),
      ]);
      setStudents(s);
      setJournals(j);
      setArtworks(a);
      setFeedback(f);
    } catch (err) {
      toast.error('Sebagian data belum dapat dimuat dari server.');
    }
  }, [currentUser]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    setCurrentUser(null);
    setActiveTab('dashboard');
    setStudents([]);
    setArtworks([]);
    setJournals([]);
    setFeedback([]);
  };

  if (window.location.pathname === '/flipbook') {
    return <FlipbookViewer />;
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-yellow-400 flex items-center justify-center font-mono text-sm">
        Memuat SIXNEMA...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <AuthScreen onAuthenticated={(u) => { setCurrentUser(u); setActiveTab('dashboard'); }} />
      </>
    );
  }

  const onStudentAdded = (s) => setStudents((prev) => [...prev, s]);
  const onStudentDeleted = (id) => setStudents((prev) => prev.filter((s) => s.id !== id));
  const onStudentUpdated = (updated) => setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  const onJournalAdded = (j) => setJournals((prev) => [j, ...prev]);
  const onArtworkSubmitted = (a) => setArtworks((prev) => [a, ...prev]);
  const onFeedbackAdded = (f) => setFeedback((prev) => [f, ...prev]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <AppShell
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        students={students}
      >
        {activeTab === 'dashboard' && (
          <DashboardHome currentUser={currentUser} students={students} artworks={artworks} journals={journals} />
        )}

        {currentUser.role === 'pembina' && activeTab === 'absensi' && (
          <PembinaAbsensi students={students} onSaved={loadAll} />
        )}
        {currentUser.role === 'pembina' && activeTab === 'jurnal' && (
          <PembinaJurnal
            students={students}
            journals={journals}
            onJournalAdded={onJournalAdded}
            onStudentUpdated={onStudentUpdated}
          />
        )}
        {currentUser.role === 'pembina' && activeTab === 'siswa' && (
          <PembinaSiswa students={students} onStudentAdded={onStudentAdded} onStudentDeleted={onStudentDeleted} />
        )}
        {currentUser.role === 'pembina' && activeTab === 'riwayat' && (
          <AttendanceHistory students={students} />
        )}

        {currentUser.role === 'siswa' && activeTab === 'karya' && (
          <SiswaKarya currentUser={currentUser} artworks={artworks} onArtworkSubmitted={onArtworkSubmitted} />
        )}
        {currentUser.role === 'siswa' && activeTab === 'rapor' && (
          <SiswaRapor currentUser={currentUser} students={students} />
        )}

        {currentUser.role === 'waka' && activeTab === 'pantau' && (
          <WakaPantau currentUser={currentUser} students={students} feedback={feedback} onFeedbackAdded={onFeedbackAdded} />
        )}
        {currentUser.role === 'waka' && activeTab === 'riwayat' && (
          <AttendanceHistory students={students} />
        )}
      </AppShell>
    </>
  );
}
