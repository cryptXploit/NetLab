import re

path = 'src/data/curriculum.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Delete LAB_FIX_GATEWAY block
text = re.sub(r"export const LAB_FIX_GATEWAY: LabDefinition = \{[\s\S]*?\};\n\n", "", text)
text = text.replace("  LAB_FIX_GATEWAY,\n", "")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
