import { describe, it, expect } from 'vitest';
import { 
  FMAP_DATA, 
  DISTRICT_SPENDING, 
  FEDERAL_SUMMARY,
  FEDERAL_METADATA
} from './federal-aggregates';

describe('Federal Aggregates', () => {
  describe('FMAP_DATA', () => {
    it('should have 51 states and territories', () => {
      expect(FMAP_DATA.length).toBe(51);
    });

    it('should have required fields for each state', () => {
      FMAP_DATA.forEach(state => {
        expect(state.stateCode).toBeDefined();
        expect(state.stateName).toBeDefined();
        expect(state.fy2024).toBeDefined();
        expect(state.fy2023).toBeDefined();
        expect(state.fy2022).toBeDefined();
        expect(state.expansionStatus).toMatch(/^[YN]$/);
      });
    });

    it('should have FMAP rates between 50% and 85%', () => {
      FMAP_DATA.forEach(state => {
        expect(state.fy2024).toBeGreaterThanOrEqual(50);
        expect(state.fy2024).toBeLessThanOrEqual(85);
      });
    });

    it('should have Mississippi with highest FMAP', () => {
      const ms = FMAP_DATA.find(s => s.stateCode === 'MS');
      expect(ms).toBeDefined();
      expect(ms?.fy2024).toBe(78.82);
    });

    it('should have multiple states at 50% floor', () => {
      const atFloor = FMAP_DATA.filter(s => s.fy2024 === 50.00);
      expect(atFloor.length).toBeGreaterThan(5);
    });

    it('should have correct expansion state count', () => {
      const expansion = FMAP_DATA.filter(s => s.expansionStatus === 'Y');
      const nonExpansion = FMAP_DATA.filter(s => s.expansionStatus === 'N');
      expect(expansion.length).toBe(41);
      expect(nonExpansion.length).toBe(10);
    });
  });

  describe('DISTRICT_SPENDING', () => {
    it('should have 436 congressional districts', () => {
      expect(DISTRICT_SPENDING.length).toBe(436);
    });

    it('should have required fields for each district', () => {
      DISTRICT_SPENDING.slice(0, 10).forEach(district => {
        expect(district.districtCode).toBeDefined();
        expect(district.stateCode).toBeDefined();
        expect(district.districtNumber).toBeDefined();
        expect(district.spending).toBeDefined();
        expect(district.zScore).toBeDefined();
      });
    });

    it('should have valid district codes (STATE-##)', () => {
      DISTRICT_SPENDING.forEach(district => {
        expect(district.districtCode).toMatch(/^[A-Z]{2}-\d{2}$/);
      });
    });

    it('should be sorted by spending descending', () => {
      for (let i = 1; i < DISTRICT_SPENDING.length; i++) {
        expect(DISTRICT_SPENDING[i].spending).toBeLessThanOrEqual(DISTRICT_SPENDING[i-1].spending);
      }
    });
  });

  describe('FEDERAL_SUMMARY', () => {
    it('should have correct total states', () => {
      expect(FEDERAL_SUMMARY.totalStates).toBe(51);
    });

    it('should have correct expansion counts', () => {
      expect(FEDERAL_SUMMARY.expansionStates).toBe(41);
      expect(FEDERAL_SUMMARY.nonExpansionStates).toBe(10);
      expect(FEDERAL_SUMMARY.expansionStates + FEDERAL_SUMMARY.nonExpansionStates).toBe(51);
    });

    it('should have correct total districts', () => {
      expect(FEDERAL_SUMMARY.totalDistricts).toBe(436);
    });

    it('should have average FMAP around 61%', () => {
      expect(FEDERAL_SUMMARY.avgFMAP).toBeGreaterThan(60);
      expect(FEDERAL_SUMMARY.avgFMAP).toBeLessThan(65);
    });
  });

  describe('FEDERAL_METADATA', () => {
    it('should have valid computed timestamp', () => {
      expect(FEDERAL_METADATA.computedAt).toBeDefined();
      expect(new Date(FEDERAL_METADATA.computedAt).getTime()).not.toBeNaN();
    });

    it('should have source attribution', () => {
      expect(FEDERAL_METADATA.source).toContain('CMS');
    });
  });
});
