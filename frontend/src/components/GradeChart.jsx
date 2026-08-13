import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { api } from '../lib/api';

const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (ym) => {
  const [y, m] = ym.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${names[parseInt(m, 10) - 1]} ${y.slice(2)}`;
};

const chartTooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid #374151',
  borderRadius: 8,
  color: '#f5f5f5',
  fontSize: 12,
};

export default function GradeChart({ studentId, studentName }) {
  const [data, setData] = useState({ snapshots: [], monthly: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    api
      .gradeHistory(studentId)
      .then(setData)
      .catch(() => setData({ snapshots: [], monthly: [] }))
      .finally(() => setLoading(false));
  }, [studentId]);

  const perInput = data.snapshots.map((s, i) => ({
    label: fmtDate(s.created_at),
    idx: i + 1,
    theory: s.theory,
    artwork: s.artwork,
    total: s.total,
  }));

  const perMonth = data.monthly.map((m) => ({
    label: monthLabel(m.month),
    theory: m.theory,
    artwork: m.artwork,
    total: m.total,
  }));

  if (loading) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 text-sm text-gray-400" data-testid="grade-chart-loading">
        Memuat grafik perkembangan nilai...
      </div>
    );
  }

  if (!perInput.length) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 text-sm text-gray-400" data-testid="grade-chart-empty">
        Belum ada riwayat nilai tercatat untuk {studentName || 'siswa ini'}.
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="grade-chart-section">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" /> Grafik Perkembangan Nilai (Per Input)
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">Setiap titik = pembaruan nilai oleh pembina.</p>
          </div>
        </div>
        <div className="h-64" data-testid="grade-chart-per-input">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={perInput} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#d1d5db' }} />
              <Line type="monotone" dataKey="theory" name="Teori" stroke="#facc15" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="artwork" name="Karya" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="total" name="Total" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {perMonth.length > 0 && (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-yellow-400" /> Rata-rata Nilai per Bulan
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">Agregasi rata-rata nilai tiap bulan.</p>
            </div>
          </div>
          <div className="h-64" data-testid="grade-chart-monthly">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perMonth} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#d1d5db' }} />
                <Line type="monotone" dataKey="theory" name="Rata Teori" stroke="#facc15" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="artwork" name="Rata Karya" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="total" name="Rata Total" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
