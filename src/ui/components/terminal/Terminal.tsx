import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { executeCommand } from '../../../core/cli/CommandParser';

export const Terminal: React.FC = () => {
  const activeTerminalDeviceId = useSimulationStore(state => state.activeTerminalDeviceId);
  const openTerminal = useSimulationStore(state => state.openTerminal);
  const engine = useSimulationStore(state => state.engine);
  const devices = useSimulationStore(state => state.devices);
  
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ command: string; output: string[] }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const device = devices.find(d => d.id === activeTerminalDeviceId);

  useEffect(() => {
    if (activeTerminalDeviceId) {
      setHistory([
        {
          command: '',
          output: [`Connected to ${device?.name || 'Device'} console. Type 'help' for commands.`]
        }
      ]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [activeTerminalDeviceId, device?.name]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (!activeTerminalDeviceId || !device) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const trimmed = input.trim();
      if (!trimmed) return;

      const result = executeCommand(trimmed, activeTerminalDeviceId, engine);
      setHistory(prev => [...prev, { command: trimmed, output: result }]);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-[50dvh] bg-black border-t border-zinc-700 z-[60] flex flex-col font-mono text-sm pointer-events-auto md:absolute md:top-4 md:bottom-auto md:left-auto md:right-4 md:w-96 md:max-h-[60vh] md:rounded-lg md:border md:shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-800 px-3 py-2 border-b border-zinc-700 select-none">
        <span className="text-zinc-200 font-bold">{device.name} - Terminal</span>
        <button 
          onClick={() => openTerminal(null)}
          className="text-zinc-400 hover:text-white transition-colors p-2 text-xl shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 text-green-400 whitespace-pre-wrap"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry, idx) => (
          <div key={idx} className="mb-2">
            {entry.command && (
              <div className="flex">
                <span className="text-zinc-500 mr-2">{'>'}</span>
                <span className="text-white">{entry.command}</span>
              </div>
            )}
            {entry.output.map((line, lidx) => (
              <div key={lidx}>{line}</div>
            ))}
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center mt-2">
          <span className="text-zinc-500 mr-2">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0 p-0"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
};
