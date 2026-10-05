import re

path = 'src/ui/components/practice/PracticeView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("startPractice('generated-gw', 'Troubleshooting' as any, seed);", "startPractice('generated-gw', 'Troubleshooting' as any, seed, labDef.skills, labDef.difficulty);")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
