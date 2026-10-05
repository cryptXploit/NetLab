import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { executeCommand } from '../../../core/cli/CommandParser';
import { X, Terminal as TermIcon, ChevronRight } from 'lucide-react';
import { DeviceType } from '../../../core/domain/Device';

export const Terminal: React.FC = () => {
  const activeTerminalDeviceId = useWorkspaceStore(state => state.activeTerminalDeviceId);
  const openTerminal = useWorkspaceStore(state => state.openTerminal);
  const engine = useSimulationStore(state => state.engine);
  const devices = useSimulationStore(state => state.devices);
  
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ command: string; output: string[] }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const device = devices.find(d => d.id === activeTerminalDeviceId);

  useEffect(() => {
    if (activeTerminalDeviceId && device) {
      setHistory([
        {
          command: '',
          output: [`Connected to ${device.name} console. Type 'help' for commands.`]
        }
      ]);
      // Focus after a short delay for mobile Safari/Chrome keyboards
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeTerminalDeviceId, device?.name]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (!activeTerminalDeviceId || !device) return null;

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const result = executeCommand(trimmed, activeTerminalDeviceId, engine);
    setHistory(prev => [...prev, { command: trimmed, output: result }]);
    setInput('');
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  const getSuggestions = () => {
    const common = ['ping 10.0.0.10', 'ipconfig'];
    if (device.type === DeviceType.ROUTER) {
      return [...common, 'show arp', 'show ip route'];
    }
    if (device.type === DeviceType.SWITCH) {
      return [...common, 'show arp'];
    }
    return [...common, 'show arp'];
  };

  return (
    <div className="absolute inset-0 md:inset-auto md:bottom-4 md:right-4 md:w-[28rem] md:h-[60vh] bg-zinc-950 md:rounded-2xl md:border border-border-strong z-[70] flex flex-col font-mono text-sm pointer-events-auto shadow-2xl">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-900 px-4 py-3 border-b border-zinc-800 shrink-0 md:rounded-t-2xl">
        <div className="flex items-center gap-2">
          <TermIcon className="w-5 h-5 text-tech-accent" />
          <span className="text-zinc-100 font-bold">{device.name} CLI</span>
        </div>
        <button 
          onClick={() => openTerminal(null)}
          className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 hover:bg-zinc-700 rounded-full p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 md:pb-4 text-zinc-300"
      >
        {history.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            {entry.command && (
              <div className="flex gap-2 text-zinc-400">
                <span className="text-tech-accent select-none">{device.name}&gt;</span>
                <span>{entry.command}</span>
              </div>
            )}
            <div className="whitespace-pre-wrap break-all text-zinc-200">
              {entry.output.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion Chips */}
      <div className="absolute bottom-14 left-0 w-full bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-6 pb-2 px-3 flex gap-2 overflow-x-auto hide-scrollbar shrink-0 pointer-events-auto border-t border-zinc-800/50">
        {getSuggestions().map(cmd => (
          <button
            key={cmd}
            onClick={() => { handleCommand(cmd); inputRef.current?.focus(); }}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 w-full bg-zinc-900 px-3 py-2 shrink-0 md:rounded-b-2xl pointer-events-auto border-t border-zinc-800 flex items-center">
        <span className="text-tech-accent font-bold mr-2 select-none flex items-center gap-1">
          {device.name}
          <ChevronRight className="w-4 h-4" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white outline-none placeholder-zinc-600"
          placeholder="Enter command..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
};
