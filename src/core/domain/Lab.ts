import { SimulationState } from './NetworkTypes';

export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LabCategory = 'Foundations' | 'Addressing' | 'Transport' | 'Services' | 'Switching' | 'Routing' | 'Troubleshooting';
export type PracticeType = 'Prediction' | 'Configuration' | 'Subnetting';

export interface LabHint {
  id: string;
  message: string;
  cost?: number;
}

export interface LabStep {
  id: string;
  title: string;
  instruction: string;
  actionRequired?: string;
  observation?: string;
  explanation?: string;
  successCondition?: (engineState: any, eventHistory: any[]) => boolean;
}

export interface LabDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: LabCategory;
  difficulty: LabDifficulty;
  estimatedTime: number; // minutes
  description: string;
  learningObjectives: string[];
  
  initialStateHash?: string; // If using the stringified hash from ScenarioGenerator
  initialStateGenerator?: (engine: any) => void; // If using code to build topology

  steps: LabStep[];
  hints: LabHint[];

  isChallenge?: boolean;
}

export interface LabProgress {
  labId: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  currentStepIndex: number;
  hintsUsed: string[];
  bestScore?: number;
  attempts: number;
  lastAttemptAt?: number;
}
