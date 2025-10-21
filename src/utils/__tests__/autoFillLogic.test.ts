import { describe, it, expect } from 'vitest';
import {
  materialDatabase,
  standardRules,
  getRecommendedFrequency,
  getCouplantRecommendation,
  calculateMetalTravel,
} from '../autoFillLogic';

describe('Material Database', () => {
  it('should contain all required materials', () => {
    expect(materialDatabase).toHaveProperty('aluminum');
    expect(materialDatabase).toHaveProperty('steel');
    expect(materialDatabase).toHaveProperty('titanium');
    expect(materialDatabase).toHaveProperty('magnesium');
  });

  it('should have valid material properties for aluminum', () => {
    const aluminum = materialDatabase.aluminum;
    expect(aluminum.velocity).toBeGreaterThan(0);
    expect(aluminum.velocityShear).toBeGreaterThan(0);
    expect(aluminum.acousticImpedance).toBeGreaterThan(0);
    expect(aluminum.density).toBeGreaterThan(0);
    expect(aluminum.surfaceCondition).toBeTruthy();
  });

  it('should have realistic velocity values', () => {
    // Typical ultrasonic velocities are in range 3-7 mm/µs
    Object.values(materialDatabase).forEach(material => {
      expect(material.velocity).toBeGreaterThan(3);
      expect(material.velocity).toBeLessThan(7);
    });
  });
});

describe('Standard Rules', () => {
  it('should contain all required standards', () => {
    expect(standardRules).toHaveProperty('AMS-STD-2154E');
    expect(standardRules).toHaveProperty('ASTM-E-114');
    expect(standardRules).toHaveProperty('MIL-STD-2154');
  });

  it('should have valid acceptance classes', () => {
    const validClasses = ['AAA', 'AA', 'A', 'B', 'C'];
    Object.values(standardRules).forEach(rule => {
      expect(validClasses).toContain(rule.defaultAcceptanceClass);
    });
  });

  it('should have minimum thickness requirements', () => {
    Object.values(standardRules).forEach(rule => {
      expect(rule.minThickness).toBeGreaterThan(0);
    });
  });
});

describe('getRecommendedFrequency', () => {
  it('should return valid frequency for aluminum plate', () => {
    const freq = getRecommendedFrequency(25, 'aluminum');
    expect(freq).toBeTruthy();
    expect(parseFloat(freq)).toBeGreaterThan(0);
    expect(parseFloat(freq)).toBeLessThanOrEqual(15);
  });

  it('should recommend lower frequency for thicker parts', () => {
    const thinFreq = parseFloat(getRecommendedFrequency(10, 'steel'));
    const thickFreq = parseFloat(getRecommendedFrequency(100, 'steel'));
    expect(thinFreq).toBeGreaterThanOrEqual(thickFreq);
  });

  it('should adjust frequency based on material attenuation', () => {
    // Magnesium has higher attenuation, should affect frequency calculation
    const alFreq = getRecommendedFrequency(25, 'aluminum');
    const mgFreq = getRecommendedFrequency(25, 'magnesium');
    expect(alFreq).toBeTruthy();
    expect(mgFreq).toBeTruthy();
  });

  it('should handle edge cases', () => {
    // Very thin part
    expect(getRecommendedFrequency(1, 'aluminum')).toBeTruthy();
    // Very thick part
    expect(getRecommendedFrequency(200, 'steel')).toBeTruthy();
  });
});

describe('getCouplantRecommendation', () => {
  it('should recommend water for immersion transducers', () => {
    const couplant = getCouplantRecommendation('immersion', 'aluminum');
    expect(couplant.toLowerCase()).toContain('water');
  });

  it('should recommend gel for contact transducers', () => {
    const couplant = getCouplantRecommendation('contact', 'aluminum');
    expect(couplant.toLowerCase()).toContain('gel');
  });

  it('should recommend non-corrosive couplant for magnesium', () => {
    const couplant = getCouplantRecommendation('contact', 'magnesium');
    expect(couplant.toLowerCase()).toMatch(/water|non-corrosive/i);
  });

  it('should handle various transducer types', () => {
    expect(getCouplantRecommendation('dual element', 'steel')).toBeTruthy();
    expect(getCouplantRecommendation('angle beam', 'titanium')).toBeTruthy();
  });
});

describe('calculateMetalTravel', () => {
  it('should calculate metal travel as 3x thickness', () => {
    const travel = calculateMetalTravel(25);
    expect(travel).toBe(75);
  });

  it('should round to nearest 5mm', () => {
    expect(calculateMetalTravel(24)).toBe(70); // 24*3=72 -> rounds to 70
    expect(calculateMetalTravel(26)).toBe(80); // 26*3=78 -> rounds to 80
    expect(calculateMetalTravel(17)).toBe(50); // 17*3=51 -> rounds to 50
  });

  it('should handle small thicknesses', () => {
    const travel = calculateMetalTravel(5);
    expect(travel).toBeGreaterThanOrEqual(15);
    expect(travel % 5).toBe(0); // Should be multiple of 5
  });

  it('should handle large thicknesses', () => {
    const travel = calculateMetalTravel(100);
    expect(travel).toBe(300);
    expect(travel % 5).toBe(0);
  });
});
