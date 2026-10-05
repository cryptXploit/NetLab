import re

path = 'src/core/learning/MasteryEngine.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import type { Skill, LabDifficulty } from '../domain/Lab';", "import type { Skill } from '../domain/Lab';")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

path = 'src/ui/components/practice/PracticeView.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { MasteryEngine, SkillMastery } from '../../../core/learning/MasteryEngine';", "import { MasteryEngine } from '../../../core/learning/MasteryEngine';\nimport type { SkillMastery } from '../../../core/learning/MasteryEngine';")
text = text.replace("import { Skill } from '../../../core/domain/Lab';\n", "")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
