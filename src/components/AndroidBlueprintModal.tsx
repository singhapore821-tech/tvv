import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, ProjectFile } from '../data/androidProjectData';
import { X, Copy, Check, Download, FileCode, Folder, BookOpen, Layers, Terminal, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

interface AndroidBlueprintModalProps {
  onClose: () => void;
}

export const AndroidBlueprintModal: React.FC<AndroidBlueprintModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(ANDROID_PROJECT_FILES[0]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const categories = [
    { key: 'all', label: 'All Files', count: ANDROID_PROJECT_FILES.length },
    { key: 'gradle', label: 'Gradle Scripts', count: ANDROID_PROJECT_FILES.filter(f => f.category === 'gradle').length },
    { key: 'manifest', label: 'Manifest', count: ANDROID_PROJECT_FILES.filter(f => f.category === 'manifest').length },
    { key: 'java', label: 'Java Classes', count: ANDROID_PROJECT_FILES.filter(f => f.category === 'java').length },
    { key: 'xml', label: 'XML Layouts', count: ANDROID_PROJECT_FILES.filter(f => f.category === 'xml').length },
    { key: 'firebase', label: 'Firebase & Backend', count: ANDROID_PROJECT_FILES.filter(f => f.category === 'firebase').length },
    { key: 'guide', label: '2-Phone Test Guide', count: ANDROID_PROJECT_FILES.filter(f => f.category === 'guide').length }
  ];

  const filteredFiles = activeCategory === 'all'
    ? ANDROID_PROJECT_FILES
    : ANDROID_PROJECT_FILES.filter(f => f.category === activeCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      ANDROID_PROJECT_FILES.forEach((file) => {
        // Clean path for zip archive
        const cleanPath = file.path.replace(/\s*\(.*?\)\s*/g, '').trim();
        zip.file(cleanPath, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'VibeTV-Android-Studio-Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate zip', e);
      alert('Failed to generate zip archive.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-6xl h-[92vh] bg-[#0c0c11] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#121218]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff2a5f] to-[#e11d48] flex items-center justify-center text-white">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
                <span>VIBE TV Android Studio Project Blueprint</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/15 text-[#ff7597] border border-pink-500/20">
                  Java + XML + WebRTC + Firebase
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Complete production-ready code files to open or paste into Android Studio.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#e11d48] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#ff2a5f]/20 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Zipping...' : 'Download Project .ZIP'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#101015] border-b border-white/5 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeCategory === cat.key
                  ? 'bg-[#ff2a5f] text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === cat.key ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Modal Main Body (2 Columns: File List + Code Viewer) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-[#0e0e14] overflow-y-auto p-2 space-y-1 shrink-0 max-h-48 md:max-h-full">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 block">
              Project Files ({filteredFiles.length})
            </span>
            {filteredFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelectedFile(f)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                  selectedFile.path === f.path
                    ? 'bg-[#ff2a5f]/15 border border-[#ff2a5f]/40 text-white'
                    : 'text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${selectedFile.path === f.path ? 'text-[#ff2a5f]' : 'text-slate-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs font-semibold truncate">{f.path}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{f.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[#08080a] overflow-hidden">
            {/* Viewer Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#121218] border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs font-bold text-white truncate">{selectedFile.path}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-slate-400">
                  {selectedFile.language}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-[#060608]">
              <pre className="whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
