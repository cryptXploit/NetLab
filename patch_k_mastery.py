import re
import os

def patch(path, ops):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    for op in ops:
        text = text.replace(op[0], op[1])
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

patch('src/core/learning/MasteryEngine.ts', [
    ("import { PracticeAttempt }", "import type { PracticeAttempt }"),
    ("import { Skill, LabDifficulty }", "import type { Skill, LabDifficulty }"),
    ("const DIFFICULTY_WEIGHT: Record<LabDifficulty, number> = {\n  Beginner: 1.0,\n  Intermediate: 1.5,\n  Advanced: 2.0\n};\n\n", "")
])

patch('src/core/learning/RecommendationEngine.ts', [
    ("import { PracticeAttempt }", "import type { PracticeAttempt }"),
    ("import { Skill, LabDefinition }", "import type { Skill, LabDefinition }"),
    ("import { MasteryEngine, SkillMastery }", "import { MasteryEngine }\nimport type { SkillMastery }")
])
