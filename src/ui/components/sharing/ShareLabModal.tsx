import React, { useEffect, useState } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { LabShareService } from '../../../core/sharing/LabShareService';

interface ShareLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLabModal: React.FC<ShareLabModalProps> = ({ isOpen, onClose }) => {
  const engine = useSimulationStore(state => state.engine);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const hash = LabShareService.exportLabToHash(engine);
      const url = `${window.location.origin}/?lab=${hash}`;
      setShareUrl(url);
      setCopied(false);
    }
  }, [isOpen, engine]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[250] backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Share Topology</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center gap-6">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <QRCode value={shareUrl} size={200} />
          </div>
          
          <div className="w-full">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Share Link</label>
            <div className="flex items-center gap-2">
              <input 
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
