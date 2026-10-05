import React, { useEffect } from 'react';
import { X, Play, Trash2, Library } from 'lucide-react';
import { useLibraryStore } from '../../../app/store/useLibraryStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useToastStore } from '../../../app/store/useToastStore';

export const LabLibraryModal: React.FC = () => {
  const { isLibraryOpen, toggleLibrary, savedLabs, fetchLabs, deleteLab } = useLibraryStore();
  const restoreSnapshot = useSimulationStore(state => state.restoreSnapshot);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    if (isLibraryOpen) {
      fetchLabs();
    }
  }, [isLibraryOpen, fetchLabs]);

  if (!isLibraryOpen) return null;

  const handleLoad = (snapshot: any, name: string) => {
    try {
      restoreSnapshot(snapshot);
      addToast('Lab Loaded', `Successfully loaded "${name}".`, 'success');
      toggleLibrary();
    } catch (err) {
      console.error(err);
      addToast('Load Failed', 'Failed to load the saved lab.', 'info');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteLab(id);
      addToast('Lab Deleted', `"${name}" has been removed from your library.`, 'success');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[250] backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Library className="w-5 h-5 text-indigo-400" />
            My Library
          </h2>
          <button onClick={toggleLibrary} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {savedLabs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
              <Library className="w-12 h-12 mb-4 opacity-20" />
              <p>Your library is empty.</p>
              <p className="text-sm">Save a lab to see it here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {savedLabs.map(lab => (
                <div key={lab.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 transition-colors group">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-200">{lab.name}</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(lab.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleLoad(lab.snapshot, lab.name)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(lab.id, lab.name)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete Lab"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
