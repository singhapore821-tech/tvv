import React, { useState } from 'react';
import { X, Copy, Check, Globe, Smartphone, QrCode, Share2, Users, ExternalLink } from 'lucide-react';

interface SharePublicModalProps {
  onClose: () => void;
}

export const SharePublicModal: React.FC<SharePublicModalProps> = ({ onClose }) => {
  // Use public shared URL if available, otherwise window.location.origin
  const publicUrl = 'https://ais-pre-pafwumpzuazafiz3zlowmc-302847450550.asia-southeast1.run.app';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicUrl)}&bgcolor=14-14-1c&color=ffffff&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121218] border border-white/15 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#161622]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff2a5f] to-[#e11d48] flex items-center justify-center text-white shadow-md shadow-[#ff2a5f]/25">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Public Live Link</h3>
              <p className="text-[11px] text-slate-400">Accessible by anyone on any device worldwide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Anyone can open this public link in their mobile or desktop browser without logging into Google AI Studio.
          </p>

          {/* Copy Link Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Shareable URL
            </label>
            <div className="flex items-center gap-2 bg-[#0a0a0e] border border-white/10 rounded-xl p-2 pl-3">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-transparent text-xs text-white font-mono select-all focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-[#ff2a5f] hover:bg-[#e11d48] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-[#ff2a5f]/20"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* QR Code for Quick Mobile Camera Scanning */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center text-center">
            <div className="w-44 h-44 rounded-xl overflow-hidden p-2 bg-[#161622] border border-white/10 flex items-center justify-center mb-2.5 shadow-lg">
              <img
                src={qrImageUrl}
                alt="Scan QR code for public link"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <span className="text-xs font-semibold text-white flex items-center gap-1.5 justify-center">
              <Smartphone className="w-3.5 h-3.5 text-[#ff2a5f]" />
              Scan with your phone camera
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Instantly opens VIBE TV on mobile browser
            </span>
          </div>

          {/* 2-Device Testing Steps */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Users className="w-3.5 h-3.5 text-[#ff7597]" />
              <span>How to test live video call:</span>
            </div>
            <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-1 pl-1">
              <li>Open this link on <strong>Device 1</strong> and register an account.</li>
              <li>Open this link on <strong>Device 2</strong> and register a second account.</li>
              <li>Both devices tap <strong>START</strong> to connect with live video & audio!</li>
            </ol>
          </div>

          {/* Open link button */}
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
