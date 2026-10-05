import { describe, it, expect } from 'vitest';
import { generateNetworkAddressQuestion, generateBroadcastAddressQuestion, generateQuestion } from '../practice/QuestionGenerators';
import { calculateNetworkAddress, calculateBroadcastAddress } from '../network/IPv4';

describe('PracticeEngine', () => {
  it('generates valid network address questions', () => {
    const q = generateNetworkAddressQuestion();
    expect(q.type).toBe('NETWORK_ADDRESS');
    expect(q.prompt).toContain('Network Address');
    
    // Extract IP and prefix from prompt (e.g., "What is the Network Address for 192.168.1.5/24?")
    const match = q.prompt.match(/for (\d+\.\d+\.\d+\.\d+)\/(\d+)\?/);
    expect(match).not.toBeNull();
    
    if (match) {
      const ip = match[1];
      const prefix = parseInt(match[2], 10);
      const expectedCorrectAnswer = calculateNetworkAddress(ip, prefix);
      expect(q.correctAnswer).toBe(expectedCorrectAnswer);
    }
  });

  it('generates valid broadcast address questions', () => {
    const q = generateBroadcastAddressQuestion();
    expect(q.type).toBe('BROADCAST_ADDRESS');
    expect(q.prompt).toContain('Broadcast Address');
    
    const match = q.prompt.match(/for (\d+\.\d+\.\d+\.\d+)\/(\d+)\?/);
    expect(match).not.toBeNull();
    
    if (match) {
      const ip = match[1];
      const prefix = parseInt(match[2], 10);
      const expectedCorrectAnswer = calculateBroadcastAddress(ip, prefix);
      expect(q.correctAnswer).toBe(expectedCorrectAnswer);
    }
  });

  it('generates random questions correctly', () => {
    const q = generateQuestion();
    expect(['NETWORK_ADDRESS', 'BROADCAST_ADDRESS']).toContain(q.type);
    expect(q.id).toBeDefined();
    expect(q.correctAnswer).toBeDefined();
  });
});
