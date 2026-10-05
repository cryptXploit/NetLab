import type { PracticeAttempt } from '../../app/store/usePracticeStore';
import type { Skill } from '../domain/Lab';

export type MasteryState = 'UNSEEN' | 'LEARNING' | 'PRACTICING' | 'DEVELOPING' | 'STRONG' | 'MASTERED';

export interface SkillMastery {
  skill: Skill;
  score: number; // 0 to 100
  state: MasteryState;
  attemptsCount: number;
}

export class MasteryEngine {
  
  static calculateMastery(skill: Skill, attempts: PracticeAttempt[]): SkillMastery {
    if (attempts.length === 0) {
      return { skill, score: 0, state: 'UNSEEN', attemptsCount: 0 };
    }

    // Sort attempts by recency (oldest to newest)
    const sortedAttempts = [...attempts].sort((a, b) => a.startTime - b.startTime);
    
    // We want recent attempts to have more weight.
    // Exponential decay: w_i = e^(k * (i - N)) where N is total attempts.
    // simpler: linear weights: [1, 2, 3, 4] / sum
    let totalScore = 0;
    let totalWeight = 0;

    for (let i = 0; i < sortedAttempts.length; i++) {
      const attempt = sortedAttempts[i];
      if (attempt.result !== 'SUCCESS' && attempt.result !== 'FAILURE') continue;

      const weight = i + 1; // Recency weight
      
      // Base score for the attempt: (0 to 100)
      // Practice score is already 0-1000. Normalize to 0-100.
      let attemptScore = (attempt.score || 0) / 10;
      
      // If failure, score is 0
      if (attempt.result === 'FAILURE') {
        attemptScore = 0;
      }

      totalScore += attemptScore * weight;
      totalWeight += weight;
    }

    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    
    return {
      skill,
      score: finalScore,
      state: this.determineState(finalScore, attempts.length),
      attemptsCount: attempts.length
    };
  }

  static determineState(score: number, count: number): MasteryState {
    if (count === 0) return 'UNSEEN';
    if (count < 3 && score < 50) return 'LEARNING';
    if (score < 40) return 'LEARNING';
    if (score < 60) return 'PRACTICING';
    if (score < 80) return 'DEVELOPING';
    if (score < 95 || count < 5) return 'STRONG';
    return 'MASTERED'; // >95 with 5+ attempts
  }
}
