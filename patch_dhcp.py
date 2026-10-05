import re

path = 'src/ui/components/context/DeviceContextSheet.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the DHCP block
text = re.sub(r'\s*\{false && \(\s*<div className="text-tech-accent">DHCP Enabled</div>\s*\)\}', '', text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
