import os
import re

mappings = {
    r'\bactive:bg-zinc-600\b': 'active:bg-border-strong',
    r'\bhover:border-zinc-600\b': 'hover:border-accent',
    r'\bdisabled:text-zinc-600\b': 'disabled:text-muted',
    r'\btext-zinc-600\b': 'text-muted',
    r'\bstroke-zinc-400\b': 'stroke-border-strong',
    r'\bfill-zinc-300\b': 'fill-primary',
    r'\bfill-zinc-500\b': 'fill-secondary',
    r'\bstroke-blue-500\b': 'stroke-accent',
    r'\btext-orange-400\b': 'text-warning',
    r'\bfocus:border-blue-500\b': 'focus:border-accent',
    r'\bhover:bg-blue-500\b': 'hover:bg-accent-hover',
    r'\bbg-zinc-100\b': 'bg-primary',
    r'\btext-zinc-950\b': 'text-base',
    r'\bhover:bg-white\b': 'hover:opacity-90',
}

def migrate(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    for old, new in mappings.items():
        content = re.sub(old, new, content)
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            migrate(os.path.join(root, file))
