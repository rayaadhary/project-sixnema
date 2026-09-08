import React, { useEffect, useState, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';
import { api } from '../lib/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function FlipbookViewer() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const bookRef = useRef(null);

  useEffect(() => {
    const render = async () => {
      try {
        const res = await fetch(api.getFlipbookUrl(), { credentials: 'include' });
        if (!res.ok) throw new Error('NOT_FOUND');
        const buf = await res.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        setTotalPages(pdf.numPages);
        const rendered = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width;
          canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          rendered.push(canvas.toDataURL('image/jpeg', 0.85));
        }
        setPages(rendered);
      } catch {
        setError('Flipbook belum tersedia. Silakan upload PDF terlebih dahulu.');
      } finally {
        setLoading(false);
      }
    };
    render();
  }, [scale]);

  const onFlip = useCallback((e) => {
    setCurrentPage(e.data);
  }, []);

  const go = (dir) => {
    const flip = bookRef.current?.pageFlip();
    if (!flip) return;
    dir === 'prev' ? flip.flipPrev() : flip.flipNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-yellow-400 text-sm font-mono">Memuat Flipbook...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-400 text-sm text-center max-w-md">{error}</p>
        <button onClick={() => window.close()} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition-colors">
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center select-none">
      <header className="w-full bg-[#111827] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => window.close()} className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Kembali
          </button>
          <span className="text-yellow-400 font-bold text-sm tracking-tight">SITTAH Flipbook</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <button onClick={() => setScale((s) => Math.max(0.8, s - 0.25))} className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white transition-colors">-</button>
          <span className="font-mono text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.25))} className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white transition-colors">+</button>
        </div>
        <span className="text-xs font-mono text-gray-500">{currentPage + 1} / {totalPages}</span>
      </header>

      <main className="flex-1 flex items-center justify-center gap-4 py-6 px-4">
        <button onClick={() => go('prev')} className="shrink-0 w-10 h-10 rounded-full bg-gray-800 hover:bg-yellow-500 hover:text-black text-gray-400 flex items-center justify-center transition-all text-lg">‹</button>

        <HTMLFlipBook
          ref={bookRef}
          width={Math.round(300 * scale)}
          height={Math.round(420 * scale)}
          size="fixed"
          drawShadow
          flippingTime={600}
          usePortrait
          startZIndex={0}
          autoSize
          showCover
          onFlip={onFlip}
          className="shadow-2xl"
        >
          {pages.map((src, i) => (
            <div key={i} className="bg-white flex items-center justify-center overflow-hidden">
              <img src={src} alt={`Hal ${i + 1}`} className="w-full h-full object-contain" draggable={false} />
            </div>
          ))}
        </HTMLFlipBook>

        <button onClick={() => go('next')} className="shrink-0 w-10 h-10 rounded-full bg-gray-800 hover:bg-yellow-500 hover:text-black text-gray-400 flex items-center justify-center transition-all text-lg">›</button>
      </main>

      <footer className="w-full bg-[#111827] border-t border-gray-800 px-4 py-2 flex justify-center">
        <p className="text-[10px] text-gray-600 font-mono">SMP Muhammadiyah 6 Surabaya • SIXNEMA</p>
      </footer>
    </div>
  );
}
