import re

path = 'src/ui/components/screens/SandboxView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# I will insert {activeLab?.mode === 'troubleshooting' ? <TroubleshootingOverlay /> : <LabOverlay />} right below {/* Top Workspace Bar */} 's closing tag
old_jsx = """          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}"""
new_jsx = """          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}"""

insert_point = """      <div className="relative w-full h-full flex flex-col overflow-hidden bg-base">"""
inserted = """      <div className="relative w-full h-full flex flex-col overflow-hidden bg-base">
      
      {activeLab?.mode === 'troubleshooting' ? <TroubleshootingOverlay /> : <LabOverlay />}"""

text = text.replace(insert_point, inserted)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
