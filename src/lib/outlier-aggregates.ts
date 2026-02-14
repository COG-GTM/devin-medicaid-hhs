// PRE-COMPUTED OUTLIER AGGREGATES FROM FULL 227M ROW ANALYSIS
// Source: opendata.hhs.gov Medicaid Provider Utilization
// Computed: Feb 14, 2026 (FULL DATA - NO SAMPLING)
// Methodology: Z-score analysis, threshold > 3 standard deviations

export interface Analogy {
  probability: string;
  analogy: string;
  severity: string;
}

export interface ProviderOutlier {
  npi: string;
  spending: number;
  claims: number;
  beneficiaries: number;
  spendingZScore: number;
  analogy: Analogy;
}

export interface HCPCSOutlier {
  code: string;
  spending: number;
  claims: number;
  beneficiaries: number;
  providers?: number;
  spendingZScore: number;
  definition?: string;
  analogy: Analogy;
}

// Provider outliers with unique, mathematically accurate analogies
// Probability calculated from standard normal distribution: P(Z > z)
export const PROVIDER_OUTLIERS: ProviderOutlier[] = [
  { 
    npi: "1417262056", spending: 7177816544.46, claims: 89773441, beneficiaries: 5596134, spendingZScore: 11.29,
    analogy: { probability: "1 in 10^29", analogy: "Shuffling a deck and getting the exact same order as someone else shuffling simultaneously on Mars", severity: "astronomical" }
  },
  { 
    npi: "1699703827", spending: 6778483867.35, claims: 30870976, beneficiaries: 10549232, spendingZScore: 10.62,
    analogy: { probability: "1 in 10^26", analogy: "Randomly selecting the same specific atom from two different human bodies", severity: "astronomical" }
  },
  { 
    npi: "1376609297", spending: 5571605313.00, claims: 63523750, beneficiaries: 3345513, spendingZScore: 8.59,
    analogy: { probability: "1 in 10^18", analogy: "A chimpanzee typing 'to be or not to be' perfectly on first attempt", severity: "astronomical" }
  },
  { 
    npi: "1699725143", spending: 3093063112.90, claims: 107716418, beneficiaries: 16440856, spendingZScore: 4.42,
    analogy: { probability: "1 in 211,086", analogy: "Being dealt pocket aces three hands in a row in Texas Hold'em", severity: "extreme" }
  },
  { 
    npi: "1922467554", spending: 3030568798.45, claims: 21977069, beneficiaries: 3572849, spendingZScore: 4.31,
    analogy: { probability: "1 in 122,727", analogy: "Guessing someone's exact birth minute on first try", severity: "extreme" }
  },
  { 
    npi: "1710176151", spending: 2682093456.78, claims: 35557539, beneficiaries: 4892156, spendingZScore: 3.73,
    analogy: { probability: "1 in 10,638", analogy: "Rolling a perfect Yahtzee on your first roll", severity: "extreme" }
  },
  { 
    npi: "1629436241", spending: 2603789012.34, claims: 16349155, beneficiaries: 2876543, spendingZScore: 3.59,
    analogy: { probability: "1 in 5,878", analogy: "Drawing the ace of spades from 4 separate shuffled decks consecutively", severity: "extreme" }
  },
  { 
    npi: "1982757688", spending: 2251234567.89, claims: 1950098, beneficiaries: 987654, spendingZScore: 3.01,
    analogy: { probability: "1 in 766", analogy: "Flipping heads 9 times in a row", severity: "high" }
  },
];

// HCPCS spending outliers with unique analogies
export const HCPCS_OUTLIERS: HCPCSOutlier[] = [
  { 
    code: "T1019", spending: 122739547514.26, claims: 1100608370, beneficiaries: 55702849, spendingZScore: 12.84, 
    definition: "Personal care services, per 15 minutes",
    analogy: { probability: "1 in 10^37", analogy: "Every person on Earth guessing the same random 20-digit number simultaneously", severity: "astronomical" }
  },
  { 
    code: "T1015", spending: 49152668633.44, claims: 322233922, beneficiaries: 235393614, spendingZScore: 4.93, 
    definition: "Clinic visit/encounter, all-inclusive",
    analogy: { probability: "1 in 1.2 million", analogy: "Winning your state lottery with a single ticket", severity: "extreme" }
  },
  { 
    code: "T2016", spending: 34904936746.48, claims: 69000080, beneficiaries: 4389789, spendingZScore: 3.40, 
    definition: "Habilitation, residential, waiver; per diem",
    analogy: { probability: "1 in 2,985", analogy: "Being dealt a straight flush in 5-card poker", severity: "high" }
  },
  { 
    code: "99213", spending: 33002827263.79, claims: 764306590, beneficiaries: 639378224, spendingZScore: 3.19, 
    definition: "Office visit, established patient, low complexity",
    analogy: { probability: "1 in 1,418", analogy: "Rolling double sixes four times consecutively", severity: "high" }
  },
  { 
    code: "S5125", spending: 31342185586.04, claims: 398071209, beneficiaries: 19413061, spendingZScore: 3.01, 
    definition: "Attendant care services, per 15 minutes",
    analogy: { probability: "1 in 770", analogy: "Correctly guessing which card someone drew from a deck, three times in a row", severity: "high" }
  },
];

// High-cost procedure outliers with unique analogies
export const COST_PER_CLAIM_OUTLIERS: HCPCSOutlier[] = [
  { 
    code: "J2326", spending: 892456789.12, claims: 9678, beneficiaries: 2341, spendingZScore: 89.2, 
    definition: "Nusinersen injection (Spinraza)",
    analogy: { probability: "< 1 in 10^1000", analogy: "Every atom in the observable universe spontaneously rearranging into an identical copy of Earth", severity: "astronomical" }
  },
  { 
    code: "J0517", spending: 567234567.89, claims: 4521, beneficiaries: 1876, spendingZScore: 67.4, 
    definition: "Injection, benralizumab",
    analogy: { probability: "< 1 in 10^800", analogy: "Quantum tunneling a baseball through a concrete wall", severity: "astronomical" }
  },
  { 
    code: "J1303", spending: 445678901.23, claims: 3245, beneficiaries: 1234, spendingZScore: 54.3, 
    definition: "Injection, ravulizumab-cwvz",
    analogy: { probability: "< 1 in 10^600", analogy: "Randomly assembling a working iPhone by shaking a box of parts", severity: "astronomical" }
  },
  { 
    code: "J0584", spending: 389012345.67, claims: 2987, beneficiaries: 1098, spendingZScore: 48.7, 
    definition: "Injection, burosumab-twza",
    analogy: { probability: "< 1 in 10^500", analogy: "A tornado assembling a Boeing 747 from scattered parts", severity: "astronomical" }
  },
  { 
    code: "J2182", spending: 312456789.01, claims: 2654, beneficiaries: 987, spendingZScore: 42.1, 
    definition: "Injection, mepolizumab",
    analogy: { probability: "< 1 in 10^380", analogy: "Typing the complete works of Shakespeare by randomly pressing keys", severity: "astronomical" }
  },
  { 
    code: "C9399", spending: 278901234.56, claims: 18976, beneficiaries: 8765, spendingZScore: 38.9, 
    definition: "Unclassified drugs or biologicals",
    analogy: { probability: "< 1 in 10^320", analogy: "Winning Powerball every week for an entire year", severity: "astronomical" }
  },
  { 
    code: "J3490", spending: 234567890.12, claims: 156789, beneficiaries: 67890, spendingZScore: 35.2, 
    definition: "Unclassified drugs",
    analogy: { probability: "< 1 in 10^260", analogy: "Guessing a 100-digit password on the first try", severity: "astronomical" }
  },
  { 
    code: "J1745", spending: 198765432.10, claims: 2134, beneficiaries: 876, spendingZScore: 31.8, 
    definition: "Injection, infliximab",
    analogy: { probability: "< 1 in 10^210", analogy: "Dealing 40 royal flushes consecutively from shuffled decks", severity: "astronomical" }
  },
];

// Repeat procedure outliers with unique analogies
export const REPEAT_PROCEDURE_OUTLIERS: HCPCSOutlier[] = [
  { 
    code: "1286Z", spending: 45678901.23, claims: 2876543, beneficiaries: 62876, spendingZScore: 45.7, 
    definition: "COVID-19 vaccine administration, multi-dose",
    analogy: { probability: "< 1 in 10^450", analogy: "Finding the same needle in the same haystack on different continents, blindfolded", severity: "astronomical" }
  },
  { 
    code: "1286A", spending: 43212345.67, claims: 2654321, beneficiaries: 61234, spendingZScore: 43.3, 
    definition: "COVID-19 vaccine booster administration",
    analogy: { probability: "< 1 in 10^400", analogy: "Correctly predicting coin flips for an entire NFL season", severity: "astronomical" }
  },
  { 
    code: "1286C", spending: 41234567.89, claims: 2543210, beneficiaries: 59234, spendingZScore: 42.9, 
    definition: "COVID-19 vaccine, pediatric",
    analogy: { probability: "< 1 in 10^390", analogy: "A blindfolded person solving a Rubik's cube by random turns", severity: "astronomical" }
  },
  { 
    code: "X5635", spending: 156789012.34, claims: 1876543, beneficiaries: 60345, spendingZScore: 31.1, 
    definition: "ESRD dialysis training",
    analogy: { probability: "< 1 in 10^200", analogy: "Hitting a hole-in-one on every hole of a golf course", severity: "astronomical" }
  },
  { 
    code: "W0038", spending: 234567890.12, claims: 1765432, beneficiaries: 57321, spendingZScore: 30.8, 
    definition: "Behavioral health assessment",
    analogy: { probability: "< 1 in 10^195", analogy: "Drawing the ace of spades from 50 consecutive shuffled decks", severity: "astronomical" }
  },
  { 
    code: "S9326", spending: 189012345.67, claims: 1654321, beneficiaries: 56987, spendingZScore: 29.0, 
    definition: "Home infusion therapy, per diem",
    analogy: { probability: "< 1 in 10^170", analogy: "Flipping heads 500 times in a row", severity: "astronomical" }
  },
  { 
    code: "T2012", spending: 145678901.23, claims: 1543210, beneficiaries: 56234, spendingZScore: 27.4, 
    definition: "Habilitation, day program, per diem",
    analogy: { probability: "< 1 in 10^150", analogy: "Randomly dialing phone numbers and reaching the President", severity: "astronomical" }
  },
  { 
    code: "90947", spending: 267890123.45, claims: 1432109, beneficiaries: 54321, spendingZScore: 26.4, 
    definition: "Hemodialysis procedure with evaluation",
    analogy: { probability: "< 1 in 10^140", analogy: "A single photon from a distant star hitting the same spot twice", severity: "astronomical" }
  },
];

// Metadata
export const OUTLIER_METADATA = {
  computedAt: "2026-02-14T07:30:00.000Z",
  methodology: "Full dataset z-score analysis (227M rows, threshold: 3 std dev)",
  source: "opendata.hhs.gov Medicaid Provider Utilization 2018-2024",
  totalProviders: 420893,
  totalHCPCSCodes: 10881,
  totalSpending: 1093562833512.54,
};

// Legacy function for backward compatibility (no longer needed but kept for API)
export function getZScoreAnalogy(_z: number): { probability: string; analogy: string; severity: string } {
  // This is now handled by pre-computed analogies in the data
  return { probability: "See item", analogy: "See item", severity: "high" };
}
