# SIXNEMA — PRD

## Original Problem Statement
Aplikasi "sixnema" untuk ekstrakurikuler fotografi & videografi SMP Muhammadiyah 6 Surabaya dengan 3 peran (Pembina, Siswa, Waka Kesiswaan). Fitur: absensi cepat, jurnal pengajaran, input nilai (Teori 40% + Karya 60%), catatan siswa, upload link karya, feedback Waka, grafik perkembangan nilai, ranking otomatis. Tema gelap dengan aksen kuning.

## User Personas
- **Pembina** (Adek Dharma Santoso, S.I.Kom, M.AP): kelola absensi, jurnal, nilai, siswa, lihat grafik & ekspor rekap.
- **Siswa** (Ahmad Zaki + 14 lainnya): kirim link karya, lihat rapor + grafik perkembangan pribadi.
- **Waka Kesiswaan** (Drs. H. M. Fauzi): pantau laporan, kirim feedback, ekspor rekap, lihat riwayat absensi.

## Implementation Status (2026-02-13)
### DONE
- Auth JWT via httpOnly cookie untuk 3 peran + session restore (auth/me)
- 15 siswa canonical + persistensi penuh MongoDB (users, students, journals, artworks, feedback, attendance, grade_snapshots)
- CRUD lengkap: students (add/delete), journals, artworks, feedback, attendance
- Absensi cepat (Hadir/Tidak Hadir/Sakit) — auto set kehadiran default & auto-ringkas ke jurnal berikutnya
- Nilai (Teori 40% + Karya 60%) + catatan; snapshot historis otomatis tiap update
- **Grafik perkembangan** (Recharts LineChart) — per-input + rata-rata bulanan
- **Riwayat absensi** — per tanggal & per siswa
- **Export CSV & PDF**: ranking, jurnal, absensi (jsPDF + jspdf-autotable)
- Refactor App.js → komponen modular (AuthScreen, AppShell, DashboardHome, PembinaDashboard, SiswaDashboard, WakaDashboard, GradeChart, AttendanceHistory)

### Backlog (P1/P2)
- P1: Audit trail feedback & edit absensi
- P1: Notifikasi in-app saat karya baru masuk / feedback baru
- P2: Filter riwayat absensi per tanggal & per kelas
- P2: Grafik trend kelas keseluruhan (bukan per siswa)

## Key API Endpoints
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Students: `GET /api/students`, `POST /api/students`, `DELETE /api/students/{id}`, `PATCH /api/students/{id}/grades`, `GET /api/students/{id}/grade-history`
- Journals: `GET/POST /api/journals`
- Artworks: `GET/POST /api/artworks`
- Feedback: `GET/POST /api/feedback`
- Attendance: `GET/POST /api/attendance`
- Exports: `GET /api/export/ranking.csv`, `GET /api/export/attendance.csv`, `GET /api/export/journals.csv`

## Tech Stack
- Backend: FastAPI + Motor MongoDB + JWT (PyJWT) + bcrypt
- Frontend: React 19 + Tailwind + Recharts + Sonner + jsPDF + jspdf-autotable + lucide-react
