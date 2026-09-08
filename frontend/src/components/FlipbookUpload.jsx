import React, { useRef, useState } from 'react';
import { BookOpen, Upload, Trash2, ExternalLink } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { api } from '../lib/api';

async function compressPdf(file) {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('');
  doc.setCreator('');
  const compressed = await doc.save({ useObjectStreams: true, addDefaultPage: false });
  return new Blob([compressed], { type: 'application/pdf' });
}

export default function FlipbookUpload() {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Hanya file PDF yang diperbolehkan');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File terlalu besar, maksimal 20MB');
      return;
    }
    setUploading(true);
    try {
      toast.info('Mengompresi PDF...');
      const blob = await compressPdf(file);
      const sizeMB = (blob.size / 1024 / 1024).toFixed(1);
      toast.info(`Ukuran setelah kompres: ${sizeMB}MB. Mengupload...`);
      const result = await api.uploadFlipbook(new File([blob], file.name, { type: 'application/pdf' }));
      toast.success(`Flipbook berhasil diupload! (${sizeMB}MB)`);
    } catch (err) {
      toast.error(err.message || 'Gagal upload flipbook');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus flipbook? Aksi ini tidak dapat dibatalkan.')) return;
    setDeleting(true);
    try {
      await api.deleteFlipbook();
      toast.success('Flipbook berhasil dihapus');
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus flipbook');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-yellow-400" /> Kelola Flipbook (SITTAH)
        </h3>
        <p className="text-xs text-gray-400 mt-1">Upload atau ganti PDF flipbook. File akan dikompres otomatis sebelum diupload. Upload baru akan menimpa yang lama.</p>
      </div>

      <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            className="hidden"
            data-testid="flipbook-upload-input"
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            data-testid="flipbook-upload-btn"
            className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition-all shadow-md shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Mengupload...' : 'Upload PDF Flipbook'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            data-testid="flipbook-delete-btn"
            className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Menghapus...' : 'Hapus Flipbook'}
          </button>
          <a
            href="/flipbook"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition-all flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Lihat Flipbook
          </a>
        </div>
        <p className="text-[11px] text-gray-500">Format: PDF • Maks 20MB (akan dikompres otomatis) • Upload baru menimpa yang lama</p>
      </div>
    </div>
  );
}
