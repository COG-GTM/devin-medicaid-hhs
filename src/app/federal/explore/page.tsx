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

interface StateSpending {
  state: string;
  stateName: string;
  spending: number;
  population: number;
  perCapita: number;
  fmap: number;
  expansionStatus: 'Y' | 'N';
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
}

interface OutlierData {
  allStates: StateSpending[];
  summary: {
    nationalPerCapita: number;
  };
}

export default function FederalExplorePage() {
  const [fmapData, setFmapData] = useState<FederalData | null>(null);
  const [spendingData, setSpendingData] = useState<OutlierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'fmap' | 'spending' | 'perCapita' | 'population'>('fmap');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterExpansion, setFilterExpansion] = useState<'all' | 'Y' | 'N'>('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/federal').then(r => r.json()),
      fetch('/api/federal/outliers').then(r => r.json())
    ])
      .then(([federal, outliers]) => {
        setFmapData(federal);
        setSpendingData(outliers);
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v: number) => v >= 1e9 ? `$${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
  const fmtPop = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`;

  if (loading) return (
    <div className="py-8 px-4"><div className="max-w-6xl mx-auto">
      <div className="border-2 border-black p-12 text-center animate-pulse">
        <p className="text-xl">Loading federal data...</p>
      </div>
    </div></div>
  );

  if (!fmapData || !spendingData) return null;

  // Combine FMAP and spending data
  const combinedData: StateSpending[] = spendingData.allStates.map(s => {
    const fmap = fmapData.statesByFMAP.find(f => f.stateCode === s.state);
    return {
      state: s.state,
      stateName: s.stateName,
      spending: s.spending,
      population: s.population,
      perCapita: s.perCapita,
      fmap: fmap?.fy2024 || 50,
      expansionStatus: (fmap?.expansionStatus || 'N') as 'Y' | 'N'
    };
  });

  // Filter
  const filtered = combinedData.filter(s => {
    if (filterExpansion !== 'all' && s.expansionStatus !== filterExpansion) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.state.toLowerCase().includes(q) || s.stateName.toLowerCase().includes(q);
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    let aVal: number, bVal: number;
    switch (sortBy) {
      case 'fmap': aVal = a.fmap; bVal = b.fmap; break;
      case 'spending': aVal = a.spending; bVal = b.spending; break;
      case 'perCapita': aVal = a.perCapita; bVal = b.perCapita; break;
      case 'population': aVal = a.population; bVal = b.population; break;
      default: aVal = a.fmap; bVal = b.fmap;
    }
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-2">
            <Link href="/federal" className="hover:underline">Federal Funding</Link> / Explore
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">EXPLORE FEDERAL DATA</h1>
          <p className="text-gray-600 mt-2">
            Search, filter, and sort all federal Medicaid data by state
          </p>
        </div>

        {/* Filters */}
        <div className="border-2 border-black p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Search State</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g., California or CA"
                className="w-full border-2 border-black px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Expansion Status</label>
              <select
                value={filterExpansion}
                onChange={(e) => setFilterExpansion(e.target.value as 'all' | 'Y' | 'N')}
                className="w-full border-2 border-black px-3 py-2 font-mono"
              >
                <option value="all">All States</option>
                <option value="Y">Expansion Only</option>
                <option value="N">Non-Expansion Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Sort By</label>
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [col, dir] = e.target.value.split('-') as [typeof sortBy, 'asc' | 'desc'];
                  setSortBy(col);
                  setSortDir(dir);
                }}
                className="w-full border-2 border-black px-3 py-2 font-mono"
              >
                <option value="fmap-desc">FMAP (High to Low)</option>
                <option value="fmap-asc">FMAP (Low to High)</option>
                <option value="spending-desc">Spending (High to Low)</option>
                <option value="spending-asc">Spending (Low to High)</option>
                <option value="perCapita-desc">Per Capita (High to Low)</option>
                <option value="perCapita-asc">Per Capita (Low to High)</option>
                <option value="population-desc">Population (High to Low)</option>
                <option value="population-asc">Population (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filtered.length} of {combinedData.length} states
        </div>

        {/* Data Table */}
        <div className="border-2 border-black">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">State</th>
                  <th 
                    className="p-3 text-right cursor-pointer hover:bg-gray-800"
                    onClick={() => toggleSort('fmap')}
                  >
                    FMAP {sortBy === 'fmap' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="p-3 text-right cursor-pointer hover:bg-gray-800"
                    onClick={() => toggleSort('spending')}
                  >
                    Total Spending {sortBy === 'spending' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="p-3 text-right cursor-pointer hover:bg-gray-800"
                    onClick={() => toggleSort('perCapita')}
                  >
                    Per Capita {sortBy === 'perCapita' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="p-3 text-right cursor-pointer hover:bg-gray-800"
                    onClick={() => toggleSort('population')}
                  >
                    Population {sortBy === 'population' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="p-3 text-center">Expanded</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.state} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3">
                      <span className="font-bold">{s.stateName}</span>
                      <span className="text-gray-500 ml-2">({s.state})</span>
                    </td>
                    <td className="p-3 text-right font-mono">{s.fmap}%</td>
                    <td className="p-3 text-right font-mono">{fmt(s.spending)}</td>
                    <td className="p-3 text-right font-mono">${s.perCapita.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">{fmtPop(s.population)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs ${s.expansionStatus === 'Y' ? 'bg-gray-200' : 'bg-red-100'}`}>
                        {s.expansionStatus === 'Y' ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Sources */}
        <div className="border-2 border-black p-4 mt-8 bg-gray-50">
          <h3 className="font-bold mb-2">DATA SOURCES</h3>
          <div className="flex flex-wrap gap-3 text-xs">
            <a 
              href="https://www.medicaid.gov/medicaid/finance/state-financials/federal-matching-rates-and-data/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              CMS FMAP Rates (FY2024)
            </a>
            <span className="text-gray-400">|</span>
            <a 
              href="https://data.census.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Census 2020 Population
            </a>
            <span className="text-gray-400">|</span>
            <a 
              href="https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners/medicaid-provider-utilization-and-payment-data"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              HHS Provider Utilization
            </a>
            <span className="text-gray-400">|</span>
            <Link href="/sources" className="underline hover:no-underline font-bold">
              All Sources
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t-2 border-black flex flex-wrap gap-4">
          <Link href="/federal" className="hover:underline font-bold">
            Federal Overview
          </Link>
          <Link href="/federal/outliers" className="hover:underline font-bold">
            Per-Capita Outliers
          </Link>
          <Link href="/federal/analysis" className="hover:underline font-bold">
            AI Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
