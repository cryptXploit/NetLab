import re

path = 'src/ui/components/terminal/Terminal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';", "import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';\nimport { useLabStore } from '../../../app/store/useLabStore';")

old_handle = """  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const result = executeCommand(trimmed, activeTerminalDeviceId, engine);
    setHistory(prev => [...prev, { command: trimmed, output: result }]);"""
new_handle = """  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const result = executeCommand(trimmed, activeTerminalDeviceId, engine);
    setHistory(prev => [...prev, { command: trimmed, output: result }]);
    
    // Log as evidence if in a lab
    if (useLabStore.getState().activeLabId) {
      let tool: any = 'CLI';
      if (trimmed.toLowerCase().startsWith('ping')) tool = 'PING';
      else if (trimmed.toLowerCase().includes('arp')) tool = 'ARP';
      else if (trimmed.toLowerCase().includes('route')) tool = 'ROUTE';
      else if (trimmed.toLowerCase().includes('ipconfig') || trimmed.toLowerCase().includes('ifconfig')) tool = 'INTERFACE';
      
      useLabStore.getState().addEvidence({
        tool,
        target: device?.name || activeTerminalDeviceId,
        result: result.join('\\n').substring(0, 100) + (result.join('\\n').length > 100 ? '...' : ''),
        observation: `Ran command: ${trimmed}`
      });
    }"""
text = text.replace(old_handle, new_handle)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
