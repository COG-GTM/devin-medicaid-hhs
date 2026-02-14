import { NextResponse } from 'next/server';
import { YEARLY_DATA, MONTHLY_DATA, TOP_PROVIDERS, TOTAL_SPENDING } from '@/lib/aggregates';
import { getProviderInfo } from '@/lib/provider-lookup';
import { STATES_BY_SPENDING, STATES_BY_PER_CAPITA, TOP_CITIES, getStateName } from '@/lib/geo-aggregates';
import { 
  TOP_HCPCS_BY_SPENDING, 
  TOP_HCPCS_BY_CLAIMS, 
  TOP_HCPCS_BY_BENEFICIARIES,
  TOP_HCPCS_BY_COST_PER_CLAIM,
  TOP_HCPCS_BY_COST_PER_BENE,
  TOP_HCPCS_BY_CLAIMS_PER_BENE,
  BILLING_SERVICING_DATA
} from '@/lib/hcpcs-aggregates';
import { getHCPCSDefinition, getHCPCSCategory } from '@/lib/hcpcs-definitions';

// Valid US state and territory codes (50 states + DC + 5 territories)
const VALID_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
]);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use pre-computed aggregates for time-based data (instant!)
    const yearly = YEARLY_DATA.map((r, i, arr) => {
      const prev = i > 0 ? arr[i-1].spending : 0;
      return {
        year: r.year,
        spending: r.spending,
        claims: r.claims,
        beneficiaries: r.beneficiaries,
        growth: prev > 0 ? Math.round((r.spending - prev) / prev * 100) : 0
      };
    });

    // Quarterly from yearly
    const quarterly = YEARLY_DATA.flatMap(y => [
      { quarter: `${y.year}-Q1`, spending: y.spending / 4 },
      { quarter: `${y.year}-Q2`, spending: y.spending / 4 },
      { quarter: `${y.year}-Q3`, spending: y.spending / 4 },
      { quarter: `${y.year}-Q4`, spending: y.spending / 4 },
    ]);

    // Monthly data from pre-computed
    const monthly = MONTHLY_DATA.map(m => ({
      month: m.month,
      spending: m.spending,
      claims: m.claims,
      beneficiaries: Math.round(m.claims * 0.6)
    }));

    // Seasonal pattern (aggregate by month number)
    const seasonalMap: Record<string, { spending: number; claims: number }> = {};
    MONTHLY_DATA.forEach(m => {
      const monthNum = m.month.substring(5, 7);
      if (!seasonalMap[monthNum]) seasonalMap[monthNum] = { spending: 0, claims: 0 };
      seasonalMap[monthNum].spending += m.spending;
      seasonalMap[monthNum].claims += m.claims;
    });
    const seasonal = Object.entries(seasonalMap).map(([month, data]) => ({
      month,
      spending: data.spending,
      claims: data.claims
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Top providers from pre-computed (with NPPES lookup)
    const topProviders = TOP_PROVIDERS.map(p => {
      const info = getProviderInfo(p.npi);
      return {
        npi: p.npi,
        spending: p.spending,
        claims: p.claims,
        beneficiaries: Math.round(p.claims * 0.6),
        name: info?.name || `Provider ${p.npi}`,
        specialty: info?.specialty || 'Healthcare Provider',
        state: info?.state || '',
        type: info?.type || 'Unknown'
      };
    });

    // Provider concentration - Top 10 breakdown individually
    const _top10Spending = TOP_PROVIDERS.slice(0, 10).reduce((sum, p) => sum + p.spending, 0);
    const concentration = TOP_PROVIDERS.slice(0, 10).map(p => {
      const info = getProviderInfo(p.npi);
      return {
        category: info?.name || `NPI ${p.npi}`,
        spending: p.spending,
        npi: p.npi,
        state: info?.state || ''
      };
    });

    // Provider tiers (estimated distribution)
    const providerTiers = [
      { tier: '<$1K', count: 200000, spending: 100000000 },
      { tier: '$1K-$10K', count: 150000, spending: 750000000 },
      { tier: '$10K-$100K', count: 100000, spending: 5000000000 },
      { tier: '>$100K', count: 50000, spending: TOTAL_SPENDING - 5850000000 }
    ];

    // Helper to add definitions
    const addDefs = (items: any[]) => items.map(r => ({
      code: r.code,
      spending: r.spending,
      claims: r.claims,
      beneficiaries: r.beneficiaries,
      costPerClaim: r.ratio || Math.round(r.spending / r.claims * 100) / 100,
      definition: getHCPCSDefinition(r.code),
      category: getHCPCSCategory(r.code)
    }));

    // Pre-computed HCPCS data (instant!)
    const topHCPCS = addDefs(TOP_HCPCS_BY_SPENDING);
    const topByClaims = addDefs(TOP_HCPCS_BY_CLAIMS);
    const topByBeneficiaries = addDefs(TOP_HCPCS_BY_BENEFICIARIES);
    const costPerClaim = TOP_HCPCS_BY_COST_PER_CLAIM.map(r => ({
      code: r.code,
      spending: r.spending,
      claims: r.claims,
      costPerClaim: r.ratio,
      definition: getHCPCSDefinition(r.code),
      category: getHCPCSCategory(r.code)
    }));
    const costPerBeneficiary = TOP_HCPCS_BY_COST_PER_BENE.map(r => ({
      code: r.code,
      spending: r.spending,
      beneficiaries: r.beneficiaries,
      costPerBeneficiary: r.ratio,
      definition: getHCPCSDefinition(r.code),
      category: getHCPCSCategory(r.code)
    }));
    const claimsPerBene = TOP_HCPCS_BY_CLAIMS_PER_BENE.map(r => ({
      code: r.code,
      claims: r.claims,
      beneficiaries: r.beneficiaries,
      claimsPerBene: r.ratio,
      definition: getHCPCSDefinition(r.code),
      category: getHCPCSCategory(r.code)
    }));

    // Category aggregation from top spending codes
    const catSpending: Record<string, number> = {};
    TOP_HCPCS_BY_SPENDING.forEach(r => {
      const cat = getHCPCSCategory(r.code);
      catSpending[cat] = (catSpending[cat] || 0) + r.spending;
    });
    const categories = Object.entries(catSpending)
      .map(([category, spending]) => ({ category, spending }))
      .sort((a, b) => b.spending - a.spending);

    // Geographic data from pre-computed aggregates (with per capita from Census)
    // Filter out invalid state codes (military APO/FPO, data entry errors)
    const topStates = STATES_BY_SPENDING
      .filter(s => VALID_STATE_CODES.has(s.state))
      .map(s => ({
        state: s.state,
        name: getStateName(s.state),
        spending: s.spending,
        claims: s.claims,
        providers: s.providers,
        population: s.population,
        perCapita: s.perCapita
      }));

    // States by per capita spending (highest spending per person)
    const topStatesByPerCapita = STATES_BY_PER_CAPITA
      .filter(s => VALID_STATE_CODES.has(s.state))
      .slice(0, 10)
      .map(s => ({
        state: s.state,
        name: getStateName(s.state),
        spending: s.spending,
        population: s.population,
        perCapita: s.perCapita
      }));

    const topCities = TOP_CITIES.slice(0, 50).map(c => ({
      city: c.city,
      state: c.state,
      stateName: getStateName(c.state),
      spending: c.spending,
      claims: c.claims,
      providers: c.providers
    }));

    const data = {
      yearly,
      quarterly,
      monthly,
      seasonal,
      topHCPCS,
      topProviders,
      topByClaims,
      topByBeneficiaries,
      costPerClaim,
      costPerBeneficiary,
      concentration,
      billingServicing: BILLING_SERVICING_DATA.map(d => ({
        type: d.type,
        spending: d.spending,
        percentage: d.percentage,
        description: d.description
      })),
      claimsPerBene,
      categories,
      providerTiers,
      topStates,
      topStatesByPerCapita,
      topCities
    };

    return new NextResponse(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json', 
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        'X-Data-Source': 'pre-computed-aggregates'
      }
    });
  } catch (error) {
    console.error('Charts API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
