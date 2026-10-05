import re

path = 'src/ui/components/screens/SandboxView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the single handleFault button with two explicit ones
old_button = """              <button 
                
                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-danger" /> Inject Link Fault
              </button>"""
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

# Since my previous powershell replace broke the string somewhat, I'll just find the exact block and replace it.
text = re.sub(r'              <button\s*?className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"\s*>\s*<ShieldAlert className="w-4 h-4 text-danger" /> Inject Link Fault\s*</button>', new_buttons, text, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
