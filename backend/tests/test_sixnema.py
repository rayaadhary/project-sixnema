"""Backend regression tests for SIXNEMA API.

Covers auth, students, grade snapshots, journals, attendance, artworks,
feedback, and CSV exports across the 3 roles (pembina, siswa, waka).
"""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://photography-tracker-1.preview.emergentagent.com"
API = f"{BASE_URL}/api"

CREDS = {
    "pembina": ("pembina@sixnema.smpmusix.sch.id", "pembina123"),
    "siswa":   ("siswa@sixnema.smpmusix.sch.id",   "siswa123"),
    "waka":    ("waka@sixnema.smpmusix.sch.id",    "waka123"),
}


def _session(role):
    s = requests.Session()
    email, password = CREDS[role]
    r = s.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"Login failed for {role}: {r.status_code} {r.text}"
    body = r.json()
    assert body["role"] == role
    return s, body


@pytest.fixture(scope="module")
def pembina():
    return _session("pembina")


@pytest.fixture(scope="module")
def siswa():
    return _session("siswa")


@pytest.fixture(scope="module")
def waka():
    return _session("waka")


# ---------- Auth ----------
class TestAuth:
    def test_health(self):
        r = requests.get(f"{API}/health", timeout=10)
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_login_all_roles(self, pembina, siswa, waka):
        for _, u in (pembina, siswa, waka):
            assert u["email"]
            assert u["role"] in ("pembina", "siswa", "waka")

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "x@y.z", "password": "bad"}, timeout=10)
        assert r.status_code == 401

    def test_me_via_cookie(self, pembina):
        s, _ = pembina
        r = s.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 200
        assert r.json()["role"] == "pembina"

    def test_me_unauth(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401


# ---------- Students ----------
class TestStudents:
    def test_list_15_students(self, pembina):
        s, _ = pembina
        r = s.get(f"{API}/students", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 15
        by_id = {x["id"]: x for x in data}
        z = by_id["student-1"]
        assert z["name"] == "Ahmad Zaki Al-Farizi"
        assert z["theory"] == 88
        assert z["artwork"] == 92
        assert z["total"] == 90.4

    def test_create_and_delete_student_pembina(self, pembina):
        s, _ = pembina
        payload = {"name": "TEST Siswa Otomatis", "nis": "TEST999", "class": "9Z"}
        r = s.post(f"{API}/students", json=payload, timeout=10)
        assert r.status_code == 200
        new = r.json()
        assert new["name"] == payload["name"]
        assert new["theory"] == 75 and new["artwork"] == 75
        # verify persisted
        r2 = s.get(f"{API}/students", timeout=10)
        assert any(x["id"] == new["id"] for x in r2.json())
        # delete
        d = s.delete(f"{API}/students/{new['id']}", timeout=10)
        assert d.status_code == 200
        r3 = s.get(f"{API}/students", timeout=10)
        assert not any(x["id"] == new["id"] for x in r3.json())

    def test_create_student_forbidden_siswa_waka(self, siswa, waka):
        for role_sess in (siswa, waka):
            s, _ = role_sess
            r = s.post(f"{API}/students", json={"name": "X", "nis": "1", "class": "1A"}, timeout=10)
            assert r.status_code == 403

    def test_delete_student_forbidden_siswa(self, siswa):
        s, _ = siswa
        r = s.delete(f"{API}/students/student-2", timeout=10)
        assert r.status_code == 403


# ---------- Grades & History ----------
class TestGradesHistory:
    def test_history_seeded_non_empty(self, pembina):
        s, _ = pembina
        r = s.get(f"{API}/students/student-1/grade-history", timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert len(body["snapshots"]) >= 1
        assert len(body["monthly"]) >= 1

    def test_patch_grade_creates_snapshot(self, pembina):
        s, _ = pembina
        before = s.get(f"{API}/students/student-1/grade-history", timeout=10).json()
        n_before = len(before["snapshots"])
        r = s.patch(f"{API}/students/student-1/grades",
                    json={"theory": 90, "artwork": 95, "notes": "TEST update"}, timeout=10)
        assert r.status_code == 200
        updated = r.json()
        assert updated["theory"] == 90 and updated["artwork"] == 95
        assert updated["total"] == 93.0
        after = s.get(f"{API}/students/student-1/grade-history", timeout=10).json()
        assert len(after["snapshots"]) == n_before + 1

    def test_siswa_own_history_ok(self, siswa):
        s, _ = siswa
        r = s.get(f"{API}/students/student-1/grade-history", timeout=10)
        assert r.status_code == 200

    def test_siswa_other_history_403(self, siswa):
        s, _ = siswa
        r = s.get(f"{API}/students/student-2/grade-history", timeout=10)
        assert r.status_code == 403


# ---------- Journals & Attendance ----------
class TestJournalAttendance:
    def test_pembina_creates_attendance_and_lists(self, pembina, waka):
        s, _ = pembina
        payload = {"date": "2026-01-30", "records": {"student-1": "Hadir", "student-2": "Sakit", "student-3": "Tidak Hadir"}}
        r = s.post(f"{API}/attendance", json=payload, timeout=10)
        assert r.status_code == 200
        r2 = s.get(f"{API}/attendance", timeout=10)
        assert r2.status_code == 200
        assert any(x["date"] == "2026-01-30" for x in r2.json())
        w, _ = waka
        rw = w.get(f"{API}/attendance", timeout=10)
        assert rw.status_code == 200

    def test_siswa_cannot_view_attendance(self, siswa):
        s, _ = siswa
        r = s.get(f"{API}/attendance", timeout=10)
        assert r.status_code == 403

    def test_pembina_creates_journal_with_attendance_summary(self, pembina):
        s, _ = pembina
        r = s.post(f"{API}/journals", json={"topic": "TEST Topik", "summary": "TEST Ringkasan"}, timeout=10)
        assert r.status_code == 200
        j = r.json()
        assert j["topic"] == "TEST Topik"
        assert "Hadir" in j["attendance_summary"]

    def test_siswa_cannot_create_journal(self, siswa):
        s, _ = siswa
        r = s.post(f"{API}/journals", json={"topic": "x", "summary": "y"}, timeout=10)
        assert r.status_code == 403


# ---------- Artworks ----------
class TestArtworks:
    def test_siswa_creates_and_lists_own(self, siswa):
        s, _ = siswa
        r = s.post(f"{API}/artworks", json={"title": "TEST Karya", "url": "https://x.example/y", "description": "TEST"}, timeout=10)
        assert r.status_code == 200
        a = r.json()
        assert a["student_id"] == "student-1"
        assert a["status"] == "Pending Review"
        r2 = s.get(f"{API}/artworks", timeout=10)
        assert r2.status_code == 200
        for art in r2.json():
            assert art["student_id"] == "student-1"

    def test_pembina_sees_all_artworks(self, pembina):
        s, _ = pembina
        r = s.get(f"{API}/artworks", timeout=10)
        assert r.status_code == 200
        ids = {a["student_id"] for a in r.json()}
        assert len(ids) >= 2  # multiple students visible


# ---------- Feedback ----------
class TestFeedback:
    def test_waka_creates_feedback(self, waka):
        s, _ = waka
        r = s.post(f"{API}/feedback", json={"text": "TEST feedback", "target_role": "pembina"}, timeout=10)
        assert r.status_code == 200
        f = r.json()
        assert f["author_role"] == "waka"

    def test_siswa_cannot_feedback(self, siswa):
        s, _ = siswa
        r = s.post(f"{API}/feedback", json={"text": "x", "target_role": "pembina"}, timeout=10)
        assert r.status_code == 403


# ---------- Exports ----------
class TestExports:
    @pytest.mark.parametrize("path", ["ranking.csv", "attendance.csv", "journals.csv"])
    def test_export_csv_pembina(self, pembina, path):
        s, _ = pembina
        r = s.get(f"{API}/export/{path}", timeout=15)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        assert len(r.text.splitlines()) >= 1

    def test_export_forbidden_siswa(self, siswa):
        s, _ = siswa
        r = s.get(f"{API}/export/ranking.csv", timeout=10)
        assert r.status_code == 403
