import re

path = 'src/ui/components/screens/SandboxView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Remove handleFault
text = re.sub(r'  const handleFault = \(\) => \{\n    setMenuOpen\(false\);\n    injectFault\(\'LINK_DOWN\'\);\n  \};\n', '', text)

# Replace the single handleFault button with two explicit ones
new_buttons = """              <button 
                onClick={() => { setMenuOpen(false); injectFault('LINK_DOWN'); }}
                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-warning" /> Link Down Fault
              </button>
              <button 
                onClick={() => { setMenuOpen(false); injectFault('BAD_GATEWAY'); }}
                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-danger" /> Bad Gateway Fault
              </button>"""

text = re.sub(r'              <button \n                onClick=\{handleFault\}\n                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"\n              >\n                <ShieldAlert className="w-4 h-4 text-danger" /> Inject Fault\n              </button>', new_buttons, text, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
