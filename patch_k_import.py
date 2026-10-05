import re

path = 'src/core/learning/RecommendationEngine.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { MasteryEngine }\nimport type { SkillMastery } from './MasteryEngine';", "import { MasteryEngine } from './MasteryEngine';\nimport type { SkillMastery } from './MasteryEngine';")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
