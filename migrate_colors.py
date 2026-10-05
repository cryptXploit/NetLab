import os
import re

mappings = {
    # Backgrounds
    r'\bbg-zinc-950\b': 'bg-base',
    r'\bbg-zinc-900\b': 'bg-surface',
    r'\bbg-zinc-800\b': 'bg-elevated',
    r'\bbg-zinc-700\b': 'bg-border-strong',
    r'\bbg-black/80\b': 'bg-overlay',
    r'\bbg-black/60\b': 'bg-overlay',
    r'\bbg-zinc-950/95\b': 'bg-overlay',
    
    # Text
    r'\btext-zinc-50\b': 'text-primary',
    r'\btext-zinc-100\b': 'text-primary',
    r'\btext-zinc-200\b': 'text-primary',
    r'\btext-zinc-300\b': 'text-secondary',
    r'\btext-zinc-400\b': 'text-secondary',
    r'\btext-zinc-500\b': 'text-muted',
    
    # Borders
    r'\bborder-zinc-900\b': 'border-border-base',
    r'\bborder-zinc-800\b': 'border-border-base',
    r'\bborder-zinc-700\b': 'border-border-strong',
    
    # Accents (Buttons/Highlights)
    r'\bbg-blue-600\b': 'bg-accent',
    r'\bhover:bg-blue-600/80\b': 'hover:bg-accent-hover',
    r'\bhover:bg-blue-600\b': 'hover:bg-accent-hover',
    r'\bactive:bg-blue-700\b': 'active:bg-accent',
    r'\bbg-blue-600/50\b': 'bg-accent-soft',
    r'\btext-blue-500\b': 'text-accent',
    r'\btext-blue-400\b': 'text-accent',
    
    r'\bbg-orange-600\b': 'bg-warning',
    r'\bbg-orange-500\b': 'bg-warning',
    r'\btext-orange-500\b': 'text-warning',
    
    r'\bbg-green-500\b': 'bg-success',
    r'\bbg-green-900/10\b': 'bg-success/10',
    r'\bborder-green-900/50\b': 'border-success/50',
    r'\btext-green-500\b': 'text-success',
    r'\btext-green-400\b': 'text-success',
    
    r'\bbg-red-500\b': 'bg-danger',
    r'\bbg-red-600\b': 'bg-danger',
    r'\btext-red-500\b': 'text-danger',
    r'\btext-red-400\b': 'text-danger',
    r'\bbg-red-900/10\b': 'bg-danger/10',
    r'\bborder-red-900/50\b': 'border-danger/50',
}

def migrate_classes(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    for old, new in mappings.items():
        content = re.sub(old, new, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            migrate_classes(os.path.join(root, file))
