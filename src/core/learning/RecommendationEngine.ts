import type { PracticeAttempt } from '../../app/store/usePracticeStore';
import type { Skill, LabDefinition } from '../domain/Lab';
import { MasteryEngine } from './MasteryEngine';
import type { SkillMastery } from './MasteryEngine';
import { CURRICULUM } from '../../data/curriculum';
import { TROUBLESHOOTING_SCENARIOS } from '../../data/troubleshootingScenarios';

export interface Recommendation {
  scenario: LabDefinition;
  reason: string;
}

export class RecommendationEngine {
  static ALL_SKILLS: Skill[] = [
    'FOUNDATIONS', 'ARP', 'IPV4', 'DNS', 'DHCP', 'SWITCHING', 'ROUTING', 'TROUBLESHOOTING'
  ];

  static recommendNext(history: PracticeAttempt[]): Recommendation | null {
    const allContent = [...CURRICULUM, ...TROUBLESHOOTING_SCENARIOS];

    // Compute mastery for all skills based on history
    const skillProfiles: Record<Skill, SkillMastery> = {} as any;
    
    for (const skill of this.ALL_SKILLS) {
      // Filter history for attempts that cover this skill
      const skillAttempts = history.filter(h => h.skills?.includes(skill));
      skillProfiles[skill] = MasteryEngine.calculateMastery(skill, skillAttempts);
    }

    // Sort skills by weakness (score ascending), ignoring UNSEEN unless no history exists
    const scoredSkills = Object.values(skillProfiles).filter(p => p.state !== 'UNSEEN' && p.attemptsCount > 0);
    scoredSkills.sort((a, b) => a.score - b.score);

    // If we have a weak skill (score < 80), recommend content for it
    if (scoredSkills.length > 0) {
      const weakest = scoredSkills[0];
      if (weakest.score < 80) {
        // Find a scenario that teaches this weak skill
        const candidate = allContent.find(c => c.skills?.includes(weakest.skill) && c.mode === 'troubleshooting');
        if (candidate) {
          return {
            scenario: candidate,
            reason: `Recommended because your mastery in ${weakest.skill} is currently ${weakest.state} (${weakest.score}%).`
          };
        }
      }
    }

    // If no weak skills or no history, recommend an unseen skill
    const unseenSkills = Object.values(skillProfiles).filter(p => p.state === 'UNSEEN');
    if (unseenSkills.length > 0) {
      const targetSkill = unseenSkills[0].skill;
      const candidate = allContent.find(c => c.skills?.includes(targetSkill));
      if (candidate) {
        return {
          scenario: candidate,
          reason: `Recommended to introduce you to ${targetSkill}.`
        };
      }
    }

    // Default to the first foundational lab
    return {
      scenario: CURRICULUM[0],
      reason: `Start your networking journey here.`
    };
  }
}
