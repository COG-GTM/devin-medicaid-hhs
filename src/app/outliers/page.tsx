'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Analogy {
  probability: string;
  analogy: string;
  severity: string;
}

interface ProviderOutlier {
  npi: string;
  spending: number;
  claims: number;
  beneficiaries: number;
  spendingZScore: number;
  analogy: Analogy;
}

interface HCPCSOutlier {
  code: string;
  spending: number;
  claims: number;
  beneficiaries: number;
  spendingZScore: number;
  definition?: string;
  analogy: Analogy;
}

interface OutlierData {
  providerOutliers: ProviderOutlier[];
  hcpcsOutliers: HCPCSOutlier[];
  costPerClaimOutliers: HCPCSOutlier[];
  repeatProcedureOutliers: HCPCSOutlier[];
  metadata: {
    computedAt: string;
    methodology: string;
    totalProviders: number;
    totalHCPCSCodes: number;
    totalSpending: number;
  };
}

const ITEMS_PER_PAGE = 25;

function ZScoreBadge({ z, analogy }: { z: number; analogy: Analogy }) {
  const getBgColor = () => {
    if (z >= 10) return 'bg-purple-900 text-white';
    if (z >= 6) return 'bg-red-900 text-white';
    if (z >= 5) return 'bg-red-700 text-white';
    if (z >= 4) return 'bg-red-500 text-white';
    if (z >= 3.5) return 'bg-orange-500 text-white';
    return 'bg-yellow-400 text-black';
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`px-3 py-1 rounded font-bold text-lg ${getBgColor()}`}>
        {z.toFixed(1)}σ
      </span>
      <span className="text-xs text-gray-500">{analogy.probability}</span>
    </div>
  );
}

function AnalogyTooltip({ analogy }: { analogy: Analogy }) {
  return (
    <div className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 text-gray-600 italic">
      {analogy.analogy}
    </div>
  );
}

export default function OutliersPage() {
  const [data, setData] = useState<OutlierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'providers' | 'hcpcs' | 'cost' | 'repeat'>('providers');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/api/outliers')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v: number) => v >= 1e9 ? `$${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${v.toFixed(0)}`;
  const fmtNum = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v.toLocaleString();

  if (loading) return (
    <div className="py-8 px-4"><div className="max-w-6xl mx-auto">
      <div className="border-2 border-black p-12 text-center animate-pulse">
        <p className="text-xl">Analyzing 227M claims for statistical outliers...</p>
        <p className="text-gray-500 mt-2">Computing z-scores across full dataset</p>
      </div>
    </div></div>
  );

  if (error) return (
    <div className="py-8 px-4"><div className="max-w-6xl mx-auto">
      <div className="border-2 border-red-500 p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    </div></div>
  );

  if (!data) return null;

  const getCurrentData = () => {
    switch (tab) {
      case 'providers': return data.providerOutliers;
      case 'hcpcs': return data.hcpcsOutliers;
      case 'cost': return data.costPerClaimOutliers;
      case 'repeat': return data.repeatProcedureOutliers;
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE);
  const paginatedData = currentData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">STATISTICAL OUTLIERS</h1>
          <p className="text-gray-600 mt-2">Extreme deviations in Medicaid spending patterns (z-score &gt; 3)</p>
        </div>

        {/* Legend */}
        <div className="border-2 border-black p-4 mb-6 bg-gray-50">
          <h3 className="font-bold mb-2">Z-Score Rarity Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-8 h-6 bg-yellow-400 rounded text-xs flex items-center justify-center font-bold">3σ</span>
              <span>1 in 741</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-6 bg-orange-500 text-white rounded text-xs flex items-center justify-center font-bold">4σ</span>
              <span>1 in 31K</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-6 bg-red-700 text-white rounded text-xs flex items-center justify-center font-bold">5σ</span>
              <span>1 in 3.5M</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-6 bg-purple-900 text-white rounded text-xs flex items-center justify-center font-bold">10σ+</span>
              <span>Astronomically rare</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => { setTab('providers'); setPage(1); }}
            className={`px-4 py-2 font-bold border-2 border-black ${tab === 'providers' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            Providers ({data.providerOutliers.length})
          </button>
          <button 
            onClick={() => { setTab('hcpcs'); setPage(1); }}
            className={`px-4 py-2 font-bold border-2 border-black ${tab === 'hcpcs' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            HCPCS Spending ({data.hcpcsOutliers.length})
          </button>
          <button 
            onClick={() => { setTab('cost'); setPage(1); }}
            className={`px-4 py-2 font-bold border-2 border-black ${tab === 'cost' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            Cost/Claim ({data.costPerClaimOutliers.length})
          </button>
          <button 
            onClick={() => { setTab('repeat'); setPage(1); }}
            className={`px-4 py-2 font-bold border-2 border-black ${tab === 'repeat' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            Repeat Procedures ({data.repeatProcedureOutliers.length})
          </button>
        </div>

        {/* Provider Outliers */}
        {tab === 'providers' && (
          <div className="border-2 border-black">
            <div className="bg-gray-50 p-4 border-b-2 border-black">
              <h2 className="font-bold">Provider Spending Outliers</h2>
              <p className="text-sm text-gray-600">Sorted by Spending Z-Score (highest first)</p>
            </div>
            <div className="divide-y divide-gray-200">
              {(paginatedData as ProviderOutlier[]).map((p, _i) => (
                <div key={p.npi} className="p-4 flex justify-between items-start hover:bg-gray-50">
                  <div className="flex-1">
                    <Link href={`/provider/${p.npi}`} className="text-lg font-mono text-blue-600 hover:underline">
                      NPI: {p.npi}
                    </Link>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Spending:</span>
                        <span className="ml-2 font-bold">{fmt(p.spending)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Claims:</span>
                        <span className="ml-2">{fmtNum(p.claims)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Beneficiaries:</span>
                        <span className="ml-2">{fmtNum(p.beneficiaries)}</span>
                      </div>
                    </div>
                    <AnalogyTooltip analogy={p.analogy} />
                  </div>
                  <ZScoreBadge z={p.spendingZScore} analogy={p.analogy} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HCPCS / Cost / Repeat Outliers */}
        {(tab === 'hcpcs' || tab === 'cost' || tab === 'repeat') && (
          <div className="border-2 border-black">
            <div className="bg-gray-50 p-4 border-b-2 border-black">
              <h2 className="font-bold">
                {tab === 'hcpcs' && 'HCPCS Code Spending Outliers'}
                {tab === 'cost' && 'High Cost-Per-Claim Procedures'}
                {tab === 'repeat' && 'High-Frequency Repeat Procedures'}
              </h2>
              <p className="text-sm text-gray-600">Sorted by Z-Score (highest first)</p>
            </div>
            <div className="divide-y divide-gray-200">
              {(paginatedData as HCPCSOutlier[]).map((h, _i) => (
                <div key={h.code} className="p-4 flex justify-between items-start hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/hcpcs/${h.code}`} className="text-lg font-mono text-blue-600 hover:underline">
                        {h.code}
                      </Link>
                      {h.definition && (
                        <span className="text-gray-600">— {h.definition}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Spending:</span>
                        <span className="ml-2 font-bold">{fmt(h.spending)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Claims:</span>
                        <span className="ml-2">{fmtNum(h.claims)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Beneficiaries:</span>
                        <span className="ml-2">{fmtNum(h.beneficiaries)}</span>
                      </div>
                    </div>
                    <AnalogyTooltip analogy={h.analogy} />
                  </div>
                  <ZScoreBadge z={h.spendingZScore} analogy={h.analogy} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border-2 border-black disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="px-4 py-2 border-2 border-black bg-gray-100">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border-2 border-black disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}

        {/* Methodology */}
        <div className="border-2 border-black p-4 mt-8 bg-gray-50">
          <h3 className="font-bold mb-2">Methodology</h3>
          <p className="text-sm text-gray-600">
            Z-score analysis across {data.metadata.totalProviders?.toLocaleString()} providers and {data.metadata.totalHCPCSCodes?.toLocaleString()} procedure codes.
            Outliers shown have z-score &gt; 3 (beyond 3 standard deviations from mean).
            Data source: Full 227M Medicaid claims (2018-2024), computed {new Date(data.metadata.computedAt).toLocaleDateString()}.
          </p>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/charts" className="border-2 border-black px-6 py-3 font-bold hover:bg-black hover:text-white">
            View Charts
          </Link>
          <Link href="/analysis" className="border-2 border-black px-6 py-3 font-bold hover:bg-black hover:text-white">
            AI Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
