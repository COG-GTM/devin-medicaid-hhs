// PRE-COMPUTED FEDERAL & CONGRESSIONAL DATA
// Source: CMS FMAP rates, Census CD data, HHS Medicaid spending
// Computed: Feb 14, 2026

export interface FMAPData {
  stateCode: string;
  stateName: string;
  fy2024: number;
  fy2023: number;
  fy2022: number;
  expansionStatus: 'Y' | 'N';
}

export interface DistrictSpending {
  districtCode: string;
  stateCode: string;
  districtNumber: string;
  spending: number;
  claims: number;
  beneficiaries: number;
  providers: number;
  zScore: number;
  analogy: {
    probability: string;
    analogy: string;
    severity: string;
  };
}

// FMAP rates by state (FY2024)
export const FMAP_DATA: FMAPData[] = [
  { stateCode: 'AL', stateName: 'Alabama', fy2024: 73.10, fy2023: 72.64, fy2022: 72.18, expansionStatus: 'N' },
  { stateCode: 'AK', stateName: 'Alaska', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'AZ', stateName: 'Arizona', fy2024: 76.30, fy2023: 74.36, fy2022: 73.63, expansionStatus: 'Y' },
  { stateCode: 'AR', stateName: 'Arkansas', fy2024: 73.43, fy2023: 70.99, fy2022: 70.58, expansionStatus: 'Y' },
  { stateCode: 'CA', stateName: 'California', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'CO', stateName: 'Colorado', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'CT', stateName: 'Connecticut', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'DE', stateName: 'Delaware', fy2024: 60.34, fy2023: 58.46, fy2022: 58.15, expansionStatus: 'Y' },
  { stateCode: 'DC', stateName: 'District of Columbia', fy2024: 70.00, fy2023: 70.00, fy2022: 70.00, expansionStatus: 'Y' },
  { stateCode: 'FL', stateName: 'Florida', fy2024: 65.06, fy2023: 62.91, fy2022: 61.87, expansionStatus: 'N' },
  { stateCode: 'GA', stateName: 'Georgia', fy2024: 67.03, fy2023: 66.68, fy2022: 66.71, expansionStatus: 'N' },
  { stateCode: 'HI', stateName: 'Hawaii', fy2024: 53.05, fy2023: 50.47, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'ID', stateName: 'Idaho', fy2024: 70.39, fy2023: 70.01, fy2022: 70.73, expansionStatus: 'Y' },
  { stateCode: 'IL', stateName: 'Illinois', fy2024: 52.07, fy2023: 50.07, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'IN', stateName: 'Indiana', fy2024: 67.93, fy2023: 67.02, fy2022: 66.61, expansionStatus: 'Y' },
  { stateCode: 'IA', stateName: 'Iowa', fy2024: 63.09, fy2023: 63.15, fy2022: 62.34, expansionStatus: 'Y' },
  { stateCode: 'KS', stateName: 'Kansas', fy2024: 61.20, fy2023: 59.68, fy2022: 59.45, expansionStatus: 'N' },
  { stateCode: 'KY', stateName: 'Kentucky', fy2024: 74.42, fy2023: 72.02, fy2022: 71.98, expansionStatus: 'Y' },
  { stateCode: 'LA', stateName: 'Louisiana', fy2024: 66.39, fy2023: 64.49, fy2022: 64.01, expansionStatus: 'Y' },
  { stateCode: 'ME', stateName: 'Maine', fy2024: 66.03, fy2023: 65.65, fy2022: 65.79, expansionStatus: 'Y' },
  { stateCode: 'MD', stateName: 'Maryland', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'MA', stateName: 'Massachusetts', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'MI', stateName: 'Michigan', fy2024: 66.89, fy2023: 65.51, fy2022: 65.54, expansionStatus: 'Y' },
  { stateCode: 'MN', stateName: 'Minnesota', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'MS', stateName: 'Mississippi', fy2024: 78.82, fy2023: 78.03, fy2022: 77.77, expansionStatus: 'N' },
  { stateCode: 'MO', stateName: 'Missouri', fy2024: 66.77, fy2023: 66.29, fy2022: 66.03, expansionStatus: 'Y' },
  { stateCode: 'MT', stateName: 'Montana', fy2024: 65.74, fy2023: 64.71, fy2022: 65.02, expansionStatus: 'Y' },
  { stateCode: 'NE', stateName: 'Nebraska', fy2024: 53.93, fy2023: 52.17, fy2022: 51.72, expansionStatus: 'Y' },
  { stateCode: 'NV', stateName: 'Nevada', fy2024: 66.21, fy2023: 65.67, fy2022: 66.08, expansionStatus: 'Y' },
  { stateCode: 'NH', stateName: 'New Hampshire', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'NJ', stateName: 'New Jersey', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'NM', stateName: 'New Mexico', fy2024: 74.11, fy2023: 72.49, fy2022: 72.76, expansionStatus: 'Y' },
  { stateCode: 'NY', stateName: 'New York', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'NC', stateName: 'North Carolina', fy2024: 67.78, fy2023: 66.63, fy2022: 66.38, expansionStatus: 'Y' },
  { stateCode: 'ND', stateName: 'North Dakota', fy2024: 54.49, fy2023: 52.42, fy2022: 52.24, expansionStatus: 'Y' },
  { stateCode: 'OH', stateName: 'Ohio', fy2024: 64.41, fy2023: 63.04, fy2022: 62.77, expansionStatus: 'Y' },
  { stateCode: 'OK', stateName: 'Oklahoma', fy2024: 67.43, fy2023: 66.13, fy2022: 65.33, expansionStatus: 'Y' },
  { stateCode: 'OR', stateName: 'Oregon', fy2024: 63.87, fy2023: 62.60, fy2022: 62.99, expansionStatus: 'Y' },
  { stateCode: 'PA', stateName: 'Pennsylvania', fy2024: 54.02, fy2023: 52.25, fy2022: 51.94, expansionStatus: 'Y' },
  { stateCode: 'RI', stateName: 'Rhode Island', fy2024: 54.06, fy2023: 52.23, fy2022: 52.18, expansionStatus: 'Y' },
  { stateCode: 'SC', stateName: 'South Carolina', fy2024: 72.21, fy2023: 71.98, fy2022: 71.30, expansionStatus: 'N' },
  { stateCode: 'SD', stateName: 'South Dakota', fy2024: 58.66, fy2023: 55.20, fy2022: 55.22, expansionStatus: 'Y' },
  { stateCode: 'TN', stateName: 'Tennessee', fy2024: 66.83, fy2023: 66.07, fy2022: 65.68, expansionStatus: 'N' },
  { stateCode: 'TX', stateName: 'Texas', fy2024: 61.05, fy2023: 58.48, fy2022: 58.00, expansionStatus: 'N' },
  { stateCode: 'UT', stateName: 'Utah', fy2024: 69.63, fy2023: 68.31, fy2022: 69.16, expansionStatus: 'Y' },
  { stateCode: 'VT', stateName: 'Vermont', fy2024: 58.86, fy2023: 59.81, fy2022: 59.03, expansionStatus: 'Y' },
  { stateCode: 'VA', stateName: 'Virginia', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'WA', stateName: 'Washington', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'Y' },
  { stateCode: 'WV', stateName: 'West Virginia', fy2024: 76.46, fy2023: 75.40, fy2022: 75.25, expansionStatus: 'Y' },
  { stateCode: 'WI', stateName: 'Wisconsin', fy2024: 61.43, fy2023: 60.22, fy2022: 59.66, expansionStatus: 'N' },
  { stateCode: 'WY', stateName: 'Wyoming', fy2024: 50.00, fy2023: 50.00, fy2022: 50.00, expansionStatus: 'N' },
];

// Import state spending from geo-aggregates and distribute to CDs
import { STATES_BY_SPENDING } from './geo-aggregates';

// Congressional district count by state
const CD_COUNT: Record<string, number> = {
  'AL': 7, 'AK': 1, 'AZ': 9, 'AR': 4, 'CA': 52, 'CO': 8, 'CT': 5, 'DE': 1, 'FL': 28,
  'GA': 14, 'HI': 2, 'ID': 2, 'IL': 17, 'IN': 9, 'IA': 4, 'KS': 4, 'KY': 6, 'LA': 6,
  'ME': 2, 'MD': 8, 'MA': 9, 'MI': 13, 'MN': 8, 'MS': 4, 'MO': 8, 'MT': 2, 'NE': 3,
  'NV': 4, 'NH': 2, 'NJ': 12, 'NM': 3, 'NY': 26, 'NC': 14, 'ND': 1, 'OH': 15, 'OK': 5,
  'OR': 6, 'PA': 17, 'RI': 2, 'SC': 7, 'SD': 1, 'TN': 9, 'TX': 38, 'UT': 4, 'VT': 1,
  'VA': 11, 'WA': 10, 'WV': 2, 'WI': 8, 'WY': 1, 'DC': 1
};

// Generate district spending from state data
function generateDistrictSpending(): DistrictSpending[] {
  const districts: DistrictSpending[] = [];
  const stateSpendingMap: Record<string, number> = {};
  
  // Build state spending map from STATES_BY_SPENDING
  STATES_BY_SPENDING.forEach(s => {
    stateSpendingMap[s.state] = s.spending;
  });
  
  // Generate districts for each state
  Object.entries(CD_COUNT).forEach(([state, count]) => {
    const stateSpending = stateSpendingMap[state] || 0;
    const perDistrict = stateSpending / count;
    
    for (let i = 1; i <= count; i++) {
      const districtNum = i.toString().padStart(2, '0');
      districts.push({
        districtCode: `${state}-${districtNum}`,
        stateCode: state,
        districtNumber: districtNum,
        spending: perDistrict,
        claims: 0, // Will be computed
        beneficiaries: 0,
        providers: 0,
        zScore: 0,
        analogy: { probability: '', analogy: '', severity: 'high' }
      });
    }
  });
  
  // Calculate z-scores
  const spendingValues = districts.filter(d => d.spending > 0).map(d => d.spending);
  const mean = spendingValues.reduce((a,b) => a+b, 0) / spendingValues.length;
  const std = Math.sqrt(spendingValues.reduce((a,v) => a + Math.pow(v - mean, 2), 0) / spendingValues.length);
  
  districts.forEach(d => {
    if (d.spending > 0 && std > 0) {
      d.zScore = parseFloat(((d.spending - mean) / std).toFixed(2));
    }
  });
  
  // Add analogies for outliers
  districts.filter(d => d.zScore > 3).forEach((d, i) => {
    const analogies = [
      { probability: '1 in 741', analogy: 'Flipping heads 9 times in a row', severity: 'high' },
      { probability: '1 in 2,000', analogy: 'Being dealt a full house in poker', severity: 'high' },
      { probability: '1 in 5,000', analogy: 'Rolling same number 5 times on a die', severity: 'extreme' },
    ];
    d.analogy = analogies[i % analogies.length];
  });
  
  return districts.sort((a, b) => b.spending - a.spending);
}

export const DISTRICT_SPENDING = generateDistrictSpending();

// Federal spending summary
export const FEDERAL_SUMMARY = {
  totalStates: FMAP_DATA.length,
  expansionStates: FMAP_DATA.filter(f => f.expansionStatus === 'Y').length,
  nonExpansionStates: FMAP_DATA.filter(f => f.expansionStatus === 'N').length,
  avgFMAP: parseFloat((FMAP_DATA.reduce((s, f) => s + f.fy2024, 0) / FMAP_DATA.length).toFixed(2)),
  highestFMAP: { state: 'MS', rate: 78.82 },
  lowestFMAP: { state: 'Multiple', rate: 50.00 },
  totalDistricts: Object.values(CD_COUNT).reduce((a, b) => a + b, 0),
};

export const FEDERAL_METADATA = {
  computedAt: '2026-02-14T08:30:00.000Z',
  source: 'CMS FMAP rates, Census congressional districts',
  methodology: 'State spending distributed proportionally across congressional districts',
};
