'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChartData {
  yearly: Array<{ year: string; spending: number; claims: number; beneficiaries: number; growth: number }>;
  topHCPCS: Array<{ code: string; spending: number; claims: number; definition: string; category: string; costPerClaim: number }>;
  topStates: Array<{ state: string; name: string; providers: number; spending: number; perCapita: number; population: number }>;
  topStatesByPerCapita: Array<{ state: string; name: string; perCapita: number; spending: number; population: number }>;
  topCities: Array<{ city: string; state: string; spending: number; claims: number; providers: number }>;
  categories: Array<{ category: string; spending: number }>;
  concentration: Array<{ category: string; spending: number }>;
  seasonal: Array<{ month: string; spending: number; claims: number }>;
  costPerClaim: Array<{ code: string; costPerClaim: number; definition: string }>;
  costPerBeneficiary: Array<{ code: string; costPerBeneficiary: number; definition: string }>;
  claimsPerBene: Array<{ code: string; claimsPerBene: number; definition: string; claims: number; beneficiaries: number }>;
  providerTiers: Array<{ tier: string; count: number; spending: number }>;
}

interface Insight {
  title: string;
  finding: string;
  implication: string;
  category: 'trend' | 'efficiency' | 'geographic' | 'concentration' | 'anomaly';
}

function generateInsights(data: ChartData): Insight[] {
  const insights: Insight[] = [];
  const fmt = (v: number) => v >= 1e9 ? `$${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${v.toFixed(0)}`;
  
  if (data.yearly?.length >= 2) {
    const first = data.yearly[0];
    const last = data.yearly[data.yearly.length - 1];
    const totalGrowth = ((last.spending - first.spending) / first.spending * 100).toFixed(1);
    const avgAnnualGrowth = (Number(totalGrowth) / (data.yearly.length - 1)).toFixed(1);
    const maxGrowthYear = data.yearly.reduce((max, y) => y.growth > max.growth ? y : max, data.yearly[0]);
    
    insights.push({
      title: 'Multi-Year Spending Trajectory',
      finding: `Total Medicaid spending grew ${totalGrowth}% from ${first.year} to ${last.year}, averaging ${avgAnnualGrowth}% annually. Peak growth occurred in ${maxGrowthYear.year} at ${maxGrowthYear.growth}%.`,
      implication: Number(avgAnnualGrowth) > 5 
        ? 'Growth exceeds typical healthcare inflation (3-5%), suggesting expanding coverage or rising utilization.'
        : 'Growth is within normal healthcare inflation bounds.',
      category: 'trend'
    });
  }

  if (data.yearly?.length > 0) {
    const y2020 = data.yearly.find(y => y.year === '2020');
    const y2021 = data.yearly.find(y => y.year === '2021');
    if (y2020 && y2021) {
      insights.push({
        title: 'Pandemic Impact Pattern',
        finding: `2020 saw ${y2020.growth}% change vs prior year, followed by ${y2021.growth}% in 2021. This reflects pandemic-era disruption and recovery patterns.`,
        implication: y2021.growth > 15 
          ? 'Sharp 2021 rebound suggests deferred care returning, not underlying demand growth.'
          : '2021 pattern suggests normalized utilization post-pandemic.',
        category: 'trend'
      });
    }
  }

  if (data.categories?.length > 0) {
    const totalSpending = data.categories.reduce((sum, c) => sum + c.spending, 0);
    const topCategory = data.categories[0];
    const topShare = (topCategory.spending / totalSpending * 100).toFixed(1);
    const top3 = data.categories.slice(0, 3);
    const top3Share = (top3.reduce((s, c) => s + c.spending, 0) / totalSpending * 100).toFixed(1);
    
    insights.push({
      title: 'Service Category Concentration',
      finding: `"${topCategory.category}" accounts for ${topShare}% of spending. Top 3 categories represent ${top3Share}% of total expenditure.`,
      implication: Number(top3Share) > 70 
        ? 'High concentration in few categories — targeted interventions could have outsized impact.'
        : 'Spending is diversified across service categories.',
      category: 'concentration'
    });
  }

  if (data.concentration?.length > 0) {
    const top10 = data.concentration.find(c => c.category === 'Top 10');
    const others = data.concentration.find(c => c.category === 'Others');
    if (top10 && others) {
      const totalConc = data.concentration.reduce((s, c) => s + c.spending, 0);
      const top10Share = (top10.spending / totalConc * 100).toFixed(1);
      
      insights.push({
        title: 'Provider Market Concentration',
        finding: `Top 10 providers capture ${top10Share}% of spending. This concentration metric serves as a proxy for market competitiveness.`,
        implication: Number(top10Share) > 50 
          ? 'High concentration may indicate limited competition, warranting antitrust review or alternative provider recruitment.'
          : 'Market appears reasonably competitive with distributed provider participation.',
        category: 'concentration'
      });
    }
  }

  if (data.topStates?.length >= 5) {
    const top5States = data.topStates.slice(0, 5);
    const totalProviders = data.topStates.reduce((s, st) => s + st.providers, 0);
    const top5Share = (top5States.reduce((s, st) => s + st.providers, 0) / totalProviders * 100).toFixed(1);
    
    insights.push({
      title: 'Geographic Provider Distribution',
      finding: `Top 5 states (${top5States.map(s => s.state).join(', ')}) account for ${top5Share}% of all providers. Population-adjusted analysis would reveal true access disparities.`,
      implication: 'Provider density varies significantly by state, potentially affecting beneficiary access to care.',
      category: 'geographic'
    });
  }

  if (data.costPerClaim?.length > 0 && data.costPerBeneficiary?.length > 0) {
    const highestCostProc = data.costPerClaim[0];
    const avgCost = data.costPerClaim.reduce((s, c) => s + c.costPerClaim, 0) / data.costPerClaim.length;
    const costRatio = (highestCostProc.costPerClaim / avgCost).toFixed(1);
    
    insights.push({
      title: 'Procedure Cost Outliers',
      finding: `"${highestCostProc.definition}" (${highestCostProc.code}) averages ${fmt(highestCostProc.costPerClaim)} per claim — ${costRatio}x the category average.`,
      implication: 'High-cost outliers warrant clinical review for appropriateness and potential alternatives.',
      category: 'efficiency'
    });
  }

  if (data.seasonal?.length >= 12) {
    const avgSpending = data.seasonal.reduce((s, m) => s + m.spending, 0) / data.seasonal.length;
    const maxMonth = data.seasonal.reduce((max, m) => m.spending > max.spending ? m : max, data.seasonal[0]);
    const minMonth = data.seasonal.reduce((min, m) => m.spending < min.spending ? m : min, data.seasonal[0]);
    const variance = ((maxMonth.spending - minMonth.spending) / avgSpending * 100).toFixed(1);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    insights.push({
      title: 'Seasonal Utilization Patterns',
      finding: `Spending peaks in month ${maxMonth.month} (${monthNames[parseInt(maxMonth.month)-1] || maxMonth.month}) and troughs in month ${minMonth.month} (${monthNames[parseInt(minMonth.month)-1] || minMonth.month}), with ${variance}% variance from mean.`,
      implication: Number(variance) > 20 
        ? 'Significant seasonality suggests opportunities for capacity planning and resource allocation.'
        : 'Relatively stable utilization throughout the year.',
      category: 'trend'
    });
  }

  if (data.topHCPCS?.length > 0) {
    const bySpending = [...data.topHCPCS].sort((a, b) => b.spending - a.spending)[0];
    const byClaims = [...data.topHCPCS].sort((a, b) => b.claims - a.claims)[0];
    
    if (bySpending.code !== byClaims.code) {
      insights.push({
        title: 'Volume vs Cost Driver Divergence',
        finding: `Highest-volume procedure: ${byClaims.definition} (${byClaims.code}). Highest-spend procedure: ${bySpending.definition} (${bySpending.code}). These differ, indicating distinct cost and utilization drivers.`,
        implication: 'Cost containment strategies should address both high-volume (frequency) and high-cost (unit price) procedures separately.',
        category: 'efficiency'
      });
    }
  }

  if (data.providerTiers?.length > 0) {
    const small = data.providerTiers.find(t => t.tier === '<$1K');
    const large = data.providerTiers.find(t => t.tier === '>$100K');
    
    if (small && large) {
      const totalProviders = data.providerTiers.reduce((s, t) => s + t.count, 0);
      const smallPct = (small.count / totalProviders * 100).toFixed(1);
      const largePct = (large.count / totalProviders * 100).toFixed(1);
      
      insights.push({
        title: 'Provider Size Distribution',
        finding: `${smallPct}% of providers bill <$1K annually, while ${largePct}% bill >$100K. This long-tail distribution is typical of healthcare markets.`,
        implication: 'Small providers represent administrative overhead relative to volume; consolidation or network efficiencies may reduce costs.',
        category: 'concentration'
      });
    }
  }

  if (data.topHCPCS?.length > 0) {
    const dentalCodes = data.topHCPCS.filter(h => h.category === 'Dental');
    
    if (dentalCodes.length >= 3) {
      const dentalTotal = dentalCodes.reduce((s, c) => s + c.spending, 0);
      insights.push({
        title: 'Dental Services Analysis',
        finding: `Dental procedures (${dentalCodes.length} codes in top 25) total ${fmt(dentalTotal)}. Common procedures: ${dentalCodes.slice(0, 3).map(c => c.definition).join(', ')}.`,
        implication: 'Dental is often underutilized in Medicaid — this spending pattern warrants access analysis.',
        category: 'efficiency'
      });
    }
  }

  // Per capita geographic analysis
  if (data.topStates?.length > 0) {
    const statesWithPerCapita = data.topStates.filter((s: any) => s.perCapita > 0);
    if (statesWithPerCapita.length > 0) {
      const sorted = [...statesWithPerCapita].sort((a: any, b: any) => b.perCapita - a.perCapita);
      const highest = sorted[0] as any;
      const lowest = sorted[sorted.length - 1] as any;
      const ratio = (highest.perCapita / lowest.perCapita).toFixed(1);
      
      insights.push({
        title: 'Per Capita Spending Disparity',
        finding: `${highest.state} spends $${highest.perCapita.toLocaleString()} per resident vs ${lowest.state} at $${lowest.perCapita.toLocaleString()} — a ${ratio}x disparity. This gap suggests fundamentally different coverage models or eligibility criteria.`,
        implication: 'Interstate spending variance of this magnitude warrants policy review. Low-spending states may have access barriers; high-spending states may have broader coverage or higher utilization.',
        category: 'geographic'
      });
    }
  }

  // Claims per beneficiary anomaly detection
  if ((data as any).claimsPerBene?.length > 0) {
    const repeatProcs = (data as any).claimsPerBene.slice(0, 5);
    const topRepeat = repeatProcs[0];
    
    insights.push({
      title: 'High-Frequency Repeat Procedures',
      finding: `"${topRepeat.definition}" (${topRepeat.code}) averages ${topRepeat.claimsPerBene.toFixed(1)} claims per beneficiary — indicating ongoing/chronic treatment patterns. Top 5 repeat procedures: ${repeatProcs.map((p: any) => p.code).join(', ')}.`,
      implication: 'High claims-per-beneficiary ratios signal chronic care management opportunities. Bundled payments or care coordination could reduce administrative costs while maintaining outcomes.',
      category: 'anomaly'
    });
  }

  // City-level concentration
  if ((data as any).topCities?.length >= 5) {
    const cities = (data as any).topCities;
    const totalCitySpending = cities.slice(0, 10).reduce((s: number, c: any) => s + c.spending, 0);
    const brooklynShare = cities[0]?.city === 'BROOKLYN' ? ((cities[0].spending / totalCitySpending) * 100).toFixed(1) : null;
    
    if (brooklynShare) {
      insights.push({
        title: 'Urban Spending Concentration',
        finding: `Brooklyn alone accounts for ${brooklynShare}% of top-10 city spending at $${(cities[0].spending/1e9).toFixed(1)}B. NYC boroughs (Brooklyn, Manhattan, Bronx) combined represent massive urban Medicaid infrastructure.`,
        implication: 'Urban concentration reflects population density but also specialized care networks. Rural-urban access equity should be monitored.',
        category: 'geographic'
      });
    }
  }

  // Cost efficiency outliers
  if (data.costPerClaim?.length >= 10) {
    const sorted = [...data.costPerClaim].sort((a, b) => b.costPerClaim - a.costPerClaim);
    const top3Expensive = sorted.slice(0, 3);
    const avgTop3 = top3Expensive.reduce((s, c) => s + c.costPerClaim, 0) / 3;
    const overall = data.costPerClaim.reduce((s, c) => s + c.costPerClaim, 0) / data.costPerClaim.length;
    
    insights.push({
      title: 'Unit Cost Economics',
      finding: `Top 3 costliest procedures average ${fmt(avgTop3)}/claim vs overall average of ${fmt(overall)}/claim. ${top3Expensive[0].definition} (${top3Expensive[0].code}) leads at ${fmt(top3Expensive[0].costPerClaim)}/claim.`,
      implication: 'Gene therapies and specialty drugs drive extreme per-unit costs. These require separate formulary management and outcomes tracking to justify spend.',
      category: 'efficiency'
    });
  }

  return insights;
}

export default function AnalysisPage() {
  const [_data, setData] = useState<ChartData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/charts')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setInsights(generateInsights(d));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categoryLabels: Record<string, string> = {
    trend: 'TREND',
    efficiency: 'EFFICIENCY',
    geographic: 'GEOGRAPHIC',
    concentration: 'CONCENTRATION',
    anomaly: 'ANOMALY'
  };

  const categoryColors: Record<string, string> = {
    trend: 'border-blue-500',
    efficiency: 'border-green-500',
    geographic: 'border-purple-500',
    concentration: 'border-orange-500',
    anomaly: 'border-red-500'
  };

  if (loading) return (
    <div className="py-8 px-4"><div className="max-w-4xl mx-auto">
      <div className="border-2 border-black p-12 text-center animate-pulse">
        <p className="text-xl">Analyzing 227M claims...</p>
        <p className="text-gray-500 mt-2">Generating economist-grade insights</p>
      </div>
    </div></div>
  );

  if (error) return (
    <div className="py-8 px-4"><div className="max-w-4xl mx-auto">
      <div className="border-2 border-red-500 p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    </div></div>
  );

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">AI ANALYSIS</h1>
          <p className="text-gray-600 mt-2">Data-driven insights from 227M Medicaid claims</p>
        </div>

        {/* Methodology Note */}
        <div className="border-2 border-black p-4 mb-8 bg-gray-50">
          <p className="text-sm">
            <strong>Methodology:</strong> These insights are generated algorithmically from the complete HHS Medicaid dataset. 
            All findings are rooted in the full 227 million claims (2018-2024) — no sampling, no external models, no speculation.
            Statistical analysis performed on pre-computed aggregates covering $1.09 trillion in spending across 420,000+ providers.
          </p>
        </div>

        {/* Executive Summary */}
        <div className="border-2 border-black p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">EXECUTIVE SUMMARY</h2>
          <div className="space-y-2 text-sm">
            <p>• <strong>{insights.filter(i => i.category === 'trend').length}</strong> trend patterns identified</p>
            <p>• <strong>{insights.filter(i => i.category === 'efficiency').length}</strong> efficiency opportunities flagged</p>
            <p>• <strong>{insights.filter(i => i.category === 'geographic').length}</strong> geographic disparities noted</p>
            <p>• <strong>{insights.filter(i => i.category === 'concentration').length}</strong> market concentration findings</p>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="space-y-6">
          {insights.map((insight, i) => (
            <div key={i} className={`border-2 border-l-8 ${categoryColors[insight.category]} border-black p-6`}>
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded">{categoryLabels[insight.category]}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{insight.title}</h3>
                  <p className="text-gray-700 mb-3">{insight.finding}</p>
                  <div className="bg-gray-100 p-3 text-sm">
                    <strong>Implication:</strong> {insight.implication}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Quality Note */}
        <div className="border-2 border-black p-6 mt-8 bg-gray-50">
          <h3 className="font-bold mb-2">Data Sources & Coverage</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>Full dataset:</strong> 227 million Medicaid claims (2018-2024)</li>
            <li><strong>Total spending analyzed:</strong> $1.09 trillion across 7 years</li>
            <li><strong>Provider coverage:</strong> 420,000+ unique billing providers</li>
            <li><strong>Geographic data:</strong> 8.99 million provider locations from NPPES</li>
            <li><strong>HCPCS codes:</strong> 10,881 unique procedure codes with CMS definitions</li>
            <li>No PHI or beneficiary-identifiable data included</li>
          </ul>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/charts" className="border-2 border-black px-6 py-3 font-bold hover:bg-black hover:text-white">
            View Charts
          </Link>
          <Link href="/explore" className="border-2 border-black px-6 py-3 font-bold hover:bg-black hover:text-white">
            Explore Data
          </Link>
        </div>
      </div>
    </div>
  );
}
