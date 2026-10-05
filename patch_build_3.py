import re

path = 'src/data/troubleshootingScenarios.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("(_engine) =>", "(engine) =>")
text = text.replace("(_engine, _history)", "(_engine, history)")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

path = 'src/data/curriculum.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { TRBL_WRONG_GATEWAY", "import type { LabDefinition } from '../core/domain/Lab';\nimport { TRBL_WRONG_GATEWAY")
text = text.replace("import type { LabDefinition } from '../core/domain/Lab';\nimport type { LabDefinition } from '../core/domain/Lab';", "import type { LabDefinition } from '../core/domain/Lab';")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

path = 'src/ui/components/context/LabOverlay.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("  const markLabComplete = useLabStore(state => state.markLabComplete);", "")
with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
