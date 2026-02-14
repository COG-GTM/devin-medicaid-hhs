'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FMAPData {
  stateCode: string;
  stateName: string;
  fy2024: number;
  fy2023: number;
  fy2022: number;
  expansionStatus: 'Y' | 'N';
}

interface DistrictSpending {
  districtCode: string;
  stateCode: string;
  spending: number;
  zScore: number;
}

interface FederalData {
  summary: {
    totalStates: number;
    expansionStates: number;
    nonExpansionStates: number;
    avgFMAP: number;
    totalDistricts: number;
  };
  statesByFMAP: FMAPData[];
  topDistricts: DistrictSpending[];
  districtOutliers: DistrictSpending[];
  expansionAnalysis: {
    expansionCount: number;
    nonExpansionCount: number;
    avgExpansionFMAP: number;
    avgNonExpansionFMAP: number;
  };
}

export default function FederalPage() {
  const [data, setData] = useState<FederalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'states' | 'districts'>('overview');

  useEffect(() => {
    fetch('/api/federal')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v: number) => v >= 1e9 ? `$${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${v.toFixed(0)}`;

  if (loading) return (
    <div className="py-8 px-4"><div className="max-w-6xl mx-auto">
      <div className="border-2 border-black p-12 text-center animate-pulse">
        <p className="text-xl">Loading federal funding data...</p>
      </div>
    </div></div>
  );

  if (!data) return null;

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">FEDERAL FUNDING</h1>
          <p className="text-gray-600 mt-2">FMAP rates and congressional district analysis</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border-2 border-black p-4">
            <p className="text-sm text-gray-500">States + DC</p>
            <p className="text-2xl font-bold">{data.summary.totalStates}</p>
          </div>
          <div className="border-2 border-black p-4">
            <p className="text-sm text-gray-500">Avg FMAP (FY24)</p>
            <p className="text-2xl font-bold">{data.summary.avgFMAP}%</p>
          </div>
          <div className="border-2 border-black p-4">
            <p className="text-sm text-gray-500">Expansion States</p>
            <p className="text-2xl font-bold">{data.summary.expansionStates}</p>
          </div>
          <div className="border-2 border-black p-4">
            <p className="text-sm text-gray-500">Congressional Districts</p>
            <p className="text-2xl font-bold">{data.summary.totalDistricts}</p>
          </div>
        </div>

        {/* Expansion Analysis */}
        <div className="border-2 border-black p-6 mb-8">
          <h2 className="font-bold mb-4">MEDICAID EXPANSION ANALYSIS</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 border border-green-200">
              <p className="text-sm text-green-800">Expansion States ({data.expansionAnalysis.expansionCount})</p>
              <p className="text-2xl font-bold text-green-900">{data.expansionAnalysis.avgExpansionFMAP}% avg FMAP</p>
            </div>
            <div className="bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">Non-Expansion States ({data.expansionAnalysis.nonExpansionCount})</p>
              <p className="text-2xl font-bold text-red-900">{data.expansionAnalysis.avgNonExpansionFMAP}% avg FMAP</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setTab('overview')}
            className={`px-4 py-2 font-bold border-2 border-black ${tab === 'overview' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setTab('states')}
            className={`px-4 py-2 font-bold border-2 border-black ${tab === 'states' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            States ({data.statesByFMAP.length})
          </button>
          <button 
            onClick={() => setTab('districts')}
            className={`px-4 py-2 font-bold border-2 border-black ${tab === 'districts' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            Districts ({data.summary.totalDistricts})
          </button>
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="border-2 border-black p-6">
              <h3 className="font-bold mb-4">HIGHEST FMAP RATES (FY2024)</h3>
              <div className="space-y-2">
                {data.statesByFMAP.slice(0, 10).map((s, i) => (
                  <div key={s.stateCode} className="flex justify-between items-center border-b pb-2">
                    <span className="font-mono">{i+1}. {s.stateName}</span>
                    <span className="font-bold">{s.fy2024}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-2 border-black p-6">
              <h3 className="font-bold mb-4">TOP DISTRICTS BY SPENDING</h3>
              <div className="space-y-2">
                {data.topDistricts.slice(0, 10).map((d, i) => (
                  <div key={d.districtCode} className="flex justify-between items-center border-b pb-2">
                    <span className="font-mono">{i+1}. {d.districtCode}</span>
                    <span className="font-bold">{fmt(d.spending)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* States Tab */}
        {tab === 'states' && (
          <div className="border-2 border-black">
            <div className="bg-gray-50 p-4 border-b-2 border-black">
              <h2 className="font-bold">ALL STATES BY FMAP RATE</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-3 text-left">State</th>
                    <th className="p-3 text-right">FY2024</th>
                    <th className="p-3 text-right">FY2023</th>
                    <th className="p-3 text-right">FY2022</th>
                    <th className="p-3 text-center">Expansion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.statesByFMAP.map((s, i) => (
                    <tr key={s.stateCode} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-mono">{s.stateName}</td>
                      <td className="p-3 text-right font-bold">{s.fy2024}%</td>
                      <td className="p-3 text-right">{s.fy2023}%</td>
                      <td className="p-3 text-right">{s.fy2022}%</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${s.expansionStatus === 'Y' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {s.expansionStatus === 'Y' ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Districts Tab */}
        {tab === 'districts' && (
          <div className="border-2 border-black">
            <div className="bg-gray-50 p-4 border-b-2 border-black">
              <h2 className="font-bold">CONGRESSIONAL DISTRICTS BY SPENDING</h2>
              <p className="text-sm text-gray-600">State spending distributed proportionally across districts</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-3 text-left">District</th>
                    <th className="p-3 text-right">Spending</th>
                    <th className="p-3 text-right">Z-Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topDistricts.map((d, i) => (
                    <tr key={d.districtCode} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-mono">{d.districtCode}</td>
                      <td className="p-3 text-right font-bold">{fmt(d.spending)}</td>
                      <td className="p-3 text-right">
                        {d.zScore > 3 ? (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">{d.zScore}σ</span>
                        ) : (
                          <span>{d.zScore}σ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Methodology */}
        <div className="border-2 border-black p-4 mt-8 bg-gray-50">
          <h3 className="font-bold mb-2">Methodology</h3>
          <p className="text-sm text-gray-600">
            FMAP (Federal Medical Assistance Percentage) rates from CMS determine the federal share of Medicaid costs.
            District spending is estimated by distributing state totals proportionally across congressional districts.
            Data sources: CMS FMAP rates, Census congressional district boundaries, HHS Medicaid spending data.
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
