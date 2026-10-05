import re

path = 'src/app/store/usePracticeStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import type { PracticeType } from '../../core/domain/Lab';", "import type { PracticeType, Skill, LabDifficulty } from '../../core/domain/Lab';")

old_attempt = """export interface PracticeAttempt {
  id: string;
  scenarioId: string;
  type: PracticeType;
  startTime: number;
  endTime?: number;
  hintsUsed: number;
  mistakes: number;
  score?: number;
  result?: 'SUCCESS' | 'FAILURE';
  seed?: string; // for generated scenarios
}"""

new_attempt = """export interface PracticeAttempt {
  id: string;
  scenarioId: string;
  type: PracticeType;
  startTime: number;
  endTime?: number;
  hintsUsed: number;
  mistakes: number;
  score?: number;
  result?: 'SUCCESS' | 'FAILURE';
  seed?: string; // for generated scenarios
  skills?: Skill[];
  difficulty?: LabDifficulty;
}"""

text = text.replace(old_attempt, new_attempt)

# Update startPractice signature
text = text.replace("startPractice: (scenarioId: string, type: PracticeType, seed?: string) => void;", "startPractice: (scenarioId: string, type: PracticeType, seed?: string, skills?: Skill[], difficulty?: LabDifficulty) => void;")
text = text.replace("startPractice: (scenarioId, type, seed) => {", "startPractice: (scenarioId, type, seed, skills, difficulty) => {")
text = text.replace("seed\n        };", "seed,\n          skills,\n          difficulty\n        };")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
