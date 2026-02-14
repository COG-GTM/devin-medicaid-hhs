'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DataVerificationBadge from '@/components/DataVerificationBadge';

interface FederalInsight {
  category: string;
  title: string;
  finding: string;
  implication: string;
  severity: 'info' | 'notable' | 'significant';
}

interface FederalAnalysisData {
  summary: string;
  insights: FederalInsight[];
  keyMetrics: {
    label: string;
    value: string;
    context: string;
  }[];
  policyImplications: string[];
  methodology: string;
  generatedAt: string;
}

interface DeepAnalysis {
  keyFindings: {
    fmapSpendingCorrelation: number;
    totalFederalSpendingBillions: number;
    expansionAvgPerCapita: number;
    nonExpansionAvgPerCapita: number;
    expansionPremium: number;
  };
  fmapQuartiles: Array<{
    quartile: number;
    states: number;
    avg_fmap: number;
    avg_per_capita: number;
  }>;
}

export default function FederalAnalysisPage() {
  const [data, setData] = useState<FederalAnalysisData | null>(null);
  const [deepData, setDeepData] = useState<DeepAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/federal/analysis').then(r => r.json()),
      fetch('/api/analysis/deep').then(r => r.json()).catch(() => null)
    ])
      .then(([analysis, deep]) => {
        setData(analysis);
        setDeepData(deep);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="border-2 border-black p-12 text-center animate-pulse">
          <p className="text-xl">Analyzing federal funding patterns...</p>
          <p className="text-sm text-gray-500 mt-2">Computing insights from FMAP and congressional data</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="border-2 border-black p-8 text-center">
          <p className="text-xl text-red-600">Error loading analysis</p>
          <p className="text-sm mt-2">{error}</p>
          <Link href="/federal" className="inline-block mt-4 border-2 border-black px-4 py-2 hover:bg-black hover:text-white">
            Back to Federal
          </Link>
        </div>
      </div>
    </div>
  );

  if (!data) return null;

  const severityStyles = {
    info: 'border-gray-300 bg-gray-50',
    notable: 'border-gray-400 bg-gray-100',
    significant: 'border-black bg-gray-200'
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/federal" className="hover:underline">Federal</Link>
            <span>/</span>
            <span>Analysis</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">FEDERAL FUNDING ANALYSIS</h1>
          <p className="text-gray-600 mt-2">AI-powered insights on FMAP rates and spending patterns</p>
        </div>

        {/* Data Verification Badge */}
        <div className="mb-8">
          <DataVerificationBadge 
            records="227M" 
            spending="$1.09T" 
            source="opendata.hhs.gov"
          />
        </div>

        {/* Key Statistical Finding */}
        {deepData && (
          <div className="border-4 border-black p-6 mb-8 bg-gray-50">
            <h2 className="text-xl font-bold mb-4">KEY STATISTICAL FINDING</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-5xl font-bold font-mono">{deepData.keyFindings.fmapSpendingCorrelation}</p>
                <p className="text-gray-600 mt-2">FMAP-Spending Correlation</p>
                <p className="text-sm mt-4">
                  A correlation near <strong>zero</strong> means FMAP rate does NOT predict spending. 
                  States receiving more federal matching don&apos;t spend more recklessly.
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 border">
                  <p className="text-sm text-gray-500">Expansion States Avg</p>
                  <p className="text-xl font-bold">${deepData.keyFindings.expansionAvgPerCapita}/person</p>
                </div>
                <div className="bg-white p-3 border">
                  <p className="text-sm text-gray-500">Non-Expansion Avg</p>
                  <p className="text-xl font-bold">${deepData.keyFindings.nonExpansionAvgPerCapita}/person</p>
                </div>
                <div className="bg-black text-white p-3">
                  <p className="text-sm">Expansion Premium</p>
                  <p className="text-xl font-bold">+{deepData.keyFindings.expansionPremium}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        <div className="border-2 border-black p-6 mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Executive Summary</h2>
          <p className="text-lg leading-relaxed">{data.summary}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {data.keyMetrics.map((metric, i) => (
            <div key={i} className="border-2 border-black p-4">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-gray-600 mt-1">{metric.context}</p>
            </div>
          ))}
        </div>

        {/* FMAP Quartile Analysis */}
        {deepData && deepData.fmapQuartiles && (
          <div className="border-2 border-black p-6 mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">FMAP Quartile Analysis</h2>
            <p className="text-sm text-gray-600 mb-4">States grouped by federal matching rate</p>
            <div className="grid grid-cols-4 gap-2">
              {deepData.fmapQuartiles.map(q => (
                <div key={q.quartile} className={`p-3 border ${q.quartile === 1 ? 'bg-gray-100' : q.quartile === 4 ? 'bg-gray-200' : 'bg-white'}`}>
                  <p className="text-xs text-gray-500">Q{q.quartile} {q.quartile === 1 ? '(Low)' : q.quartile === 4 ? '(High)' : ''}</p>
                  <p className="font-bold">{q.avg_fmap}%</p>
                  <p className="text-sm">${q.avg_per_capita}</p>
                  <p className="text-xs text-gray-500">{q.states} states</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 border">
              <strong>Finding:</strong> Q1 (lowest FMAP at 50%) has the highest per-capita spending. 
              These are wealthy states (MA, NY, CA) that fund generous programs with their own dollars.
            </p>
          </div>
        )}

        {/* Insights */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Key Findings</h2>
          <div className="space-y-4">
            {data.insights.map((insight, i) => (
              <div key={i} className={`border-2 p-4 ${severityStyles[insight.severity]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase bg-black text-white px-2 py-0.5">
                    {insight.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 ${
                    insight.severity === 'significant' ? 'bg-gray-800 text-white' :
                    insight.severity === 'notable' ? 'bg-gray-500 text-white' :
                    'bg-gray-300'
                  }`}>
                    {insight.severity}
                  </span>
                </div>
                <h3 className="font-bold mb-2">{insight.title}</h3>
                <p className="text-sm mb-2">{insight.finding}</p>
                <p className="text-sm text-gray-600 italic">{insight.implication}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Implications */}
        <div className="border-2 border-black p-6 mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Policy Implications</h2>
          <ul className="space-y-3">
            {data.policyImplications.map((implication, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-bold text-gray-400">{i + 1}.</span>
                <span>{implication}</span>
              </li>
            ))}
          </ul>
          {deepData && (
            <div className="mt-4 p-4 bg-gray-50 border-t">
              <p className="text-sm">
                <strong>Statistical Evidence:</strong> The near-zero correlation (r = {deepData.keyFindings.fmapSpendingCorrelation}) 
                between FMAP rates and per-capita spending suggests the federal matching formula is working as designed. 
                States don&apos;t abuse higher federal matching — spending is driven by state policy choices and demographics, not federal incentives.
              </p>
            </div>
          )}
        </div>

        {/* Methodology */}
        <div className="border-2 border-black p-4 bg-gray-50 mb-8">
          <h3 className="font-bold mb-2">Methodology</h3>
          <p className="text-sm text-gray-600">{data.methodology}</p>
          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            <p><strong>Statistical Analysis:</strong> Pearson correlation, quartile grouping, efficiency matrix (FMAP quartile x spending quartile)</p>
            <p><strong>Data:</strong> 227M payment records aggregated to state level, Census 2020 population, CMS FMAP rates FY2022-2024</p>
          </div>
        </div>

        {/* Source Links */}
        <div className="border-2 border-black p-4 bg-gray-50 mb-8">
          <h3 className="font-bold mb-2">Data Sources</h3>
          <div className="flex flex-wrap gap-3 text-xs">
            <a href="https://www.medicaid.gov/medicaid/finance/state-financials/federal-matching-rates-and-data/index.html" 
               target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              CMS FMAP Rates
            </a>
            <span className="text-gray-400">|</span>
            <a href="https://data.census.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              Census 2020
            </a>
            <span className="text-gray-400">|</span>
            <a href="https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners/medicaid-provider-utilization-and-payment-data" 
               target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              HHS Provider Data
            </a>
            <span className="text-gray-400">|</span>
            <Link href="/sources" className="underline hover:no-underline font-bold">All Sources</Link>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Generated: {new Date(data.generatedAt).toLocaleString()}</span>
          <Link href="/federal" className="border-2 border-black px-4 py-2 font-bold hover:bg-black hover:text-white">
            Back to Federal Data
          </Link>
        </div>
      </div>
    </div>
  );
}
