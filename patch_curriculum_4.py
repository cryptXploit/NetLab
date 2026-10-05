import re

path = 'src/data/curriculum.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r"export const LAB_FIX_GATEWAY: LabDefinition = \{[\s\S]*?\};\n\n", "", text)
text = text.replace("import type { LabDefinition } from '../core/domain/Lab';\nimport type { LabDefinition } from '../core/domain/Lab';", "import type { LabDefinition } from '../core/domain/Lab';")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
