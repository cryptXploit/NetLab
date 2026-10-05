import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useToastStore } from '../../../app/store/useToastStore';

interface ImportLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportLabModal: React.FC<ImportLabModalProps> = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const loadSharedLab = useSimulationStore(state => state.loadSharedLab);
  const addToast = useToastStore(state => state.addToast);

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      let hash = inputValue.trim();
      
      // If it's a URL, extract the 'lab' parameter
      if (hash.startsWith('http')) {
        const url = new URL(hash);
        const labParam = url.searchParams.get('lab');
        if (labParam) {
          hash = labParam;
        }
      }

      const success = loadSharedLab(hash);
      
      if (success) {
        addToast('Topology Imported', 'Successfully loaded shared lab.', 'success');
        setInputValue('');
        onClose();
      } else {
        addToast('Import Failed', 'Invalid or corrupted share link.', 'info');
      }
    } catch (e) {
      addToast('Import Failed', 'Invalid or corrupted share link.', 'info');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[250] backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Import Topology</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-zinc-400">
            Paste a shared link or raw lab hash to instantly load a custom topology.
          </p>
          
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://netlab.local/?lab=..."
            className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono break-all"
          />
          
          <button 
            onClick={handleImport}
            disabled={!inputValue.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Import Lab
          </button>
        </div>
      </div>
    </div>
  );
};
