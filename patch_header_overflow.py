import re

with open('src/ui/components/layout/AppHeader.tsx', 'r', encoding='utf-8') as f:
    header_code = f.read()

# Fix the inner scrollable container to properly constrain to its flex parent
header_code = header_code.replace(
    '<div className="flex items-center overflow-x-auto whitespace-nowrap hide-scrollbar gap-3 w-full pb-1 pointer-events-auto">',
    '<div className="flex-1 min-w-0 flex items-center overflow-x-auto whitespace-nowrap hide-scrollbar gap-3 pb-1 pointer-events-auto">'
)
# And make sure the outer wrapper doesn't hide it unnecessarily, although overflow-hidden is fine if the inner shrinks.
header_code = header_code.replace(
    '<div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-2 md:px-4 gap-2 md:gap-4 select-none z-50 relative w-full overflow-hidden">',
    '<div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-2 md:px-4 gap-2 md:gap-4 select-none z-50 relative w-full">'
)

with open('src/ui/components/layout/AppHeader.tsx', 'w', encoding='utf-8') as f:
    f.write(header_code)
