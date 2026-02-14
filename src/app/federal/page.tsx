'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import DataVerificationBadge from '@/components/DataVerificationBadge';

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
  expansionAnalysis: {
    expansionCount: number;
    nonExpansionCount: number;
    avgExpansionFMAP: number;
    avgNonExpansionFMAP: number;
  };
}

// State code to full name lookup
const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida',
  'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana',
  'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
  'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire',
  'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota',
  'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
  'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Parse district code to human readable
function parseDistrict(code: string): string {
  const [state, num] = code.split('-');
  const stateName = STATE_NAMES[state] || state;
  const districtNum = parseInt(num, 10);
  if (districtNum === 0 || districtNum === 1 && ['AK', 'DE', 'MT', 'ND', 'SD', 'VT', 'WY'].includes(state)) {
    return `${stateName} (At-Large)`;
  }
  return `${stateName}, ${getOrdinal(districtNum)} Congressional District`;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const COLORS = ['#000000', '#666666', '#999999', '#CCCCCC'];

export default function FederalPage() {
  const [data, setData] = useState<FederalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'districts' | 'charts'>('overview');
  const [showExplainer, setShowExplainer] = useState(true);

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

  // Prepare chart data
  const top10FMAP = data.statesByFMAP.slice(0, 10).map(s => ({
    name: s.stateCode,
    fullName: s.stateName,
    fmap: s.fy2024,
    expansion: s.expansionStatus === 'Y' ? 'Expansion' : 'Non-Expansion'
  }));

  const expansionPieData = [
    { name: 'Expansion States', value: data.expansionAnalysis.expansionCount },
    { name: 'Non-Expansion', value: data.expansionAnalysis.nonExpansionCount }
  ];

  const fmapTrendData = data.statesByFMAP.slice(0, 5).map(s => ({
    name: s.stateCode,
    'FY2022': s.fy2022,
    'FY2023': s.fy2023,
    'FY2024': s.fy2024
  }));

  const expansionComparison = [
    { name: 'Expansion States', avgFMAP: data.expansionAnalysis.avgExpansionFMAP },
    { name: 'Non-Expansion', avgFMAP: data.expansionAnalysis.avgNonExpansionFMAP }
  ];

  const top10Districts = data.topDistricts.slice(0, 10).map(d => ({
    name: d.districtCode,
    fullName: parseDistrict(d.districtCode),
    spending: d.spending / 1e9,
    zScore: d.zScore
  }));

  // FMAP distribution buckets
  const fmapDistribution = [
    { range: '50-55%', count: data.statesByFMAP.filter(s => s.fy2024 >= 50 && s.fy2024 < 55).length },
    { range: '55-60%', count: data.statesByFMAP.filter(s => s.fy2024 >= 55 && s.fy2024 < 60).length },
    { range: '60-65%', count: data.statesByFMAP.filter(s => s.fy2024 >= 60 && s.fy2024 < 65).length },
    { range: '65-70%', count: data.statesByFMAP.filter(s => s.fy2024 >= 65 && s.fy2024 < 70).length },
    { range: '70-75%', count: data.statesByFMAP.filter(s => s.fy2024 >= 70 && s.fy2024 < 75).length },
    { range: '75-80%', count: data.statesByFMAP.filter(s => s.fy2024 >= 75 && s.fy2024 < 80).length },
  ];

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">FEDERAL FUNDING</h1>
            <p className="text-gray-600 mt-2">How the federal government shares Medicaid costs with states</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/federal/explore"
              className="border-2 border-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
            >
              Explore Data
            </Link>
            <Link 
              href="/federal/outliers"
              className="border-2 border-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
            >
              Per-Capita Outliers
            </Link>
            <Link 
              href="/federal/analysis"
              className="border-2 border-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
            >
              AI Analysis
            </Link>
          </div>
        </div>

        {/* FMAP Explainer - Collapsible */}
        <div className="border-2 border-black mb-8">
          <button 
            onClick={() => setShowExplainer(!showExplainer)}
            className="w-full p-4 text-left font-bold flex justify-between items-center bg-gray-50 hover:bg-gray-100"
          >
            <span>Understanding FMAP: A Quick Guide</span>
            <span className="text-xl">{showExplainer ? '−' : '+'}</span>
          </button>
          {showExplainer && (
            <div className="p-6 space-y-4 text-sm">
              <div>
                <h3 className="font-bold text-lg mb-2">What is FMAP?</h3>
                <p className="text-gray-700">
                  <strong>FMAP (Federal Medical Assistance Percentage)</strong> is the share of Medicaid costs 
                  that the federal government pays for each state. If a state has a 70% FMAP, the federal 
                  government pays 70 cents of every dollar spent on Medicaid, and the state pays 30 cents.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 border">
                  <h4 className="font-bold mb-2">How is it calculated?</h4>
                  <p className="text-gray-600 text-xs">
                    FMAP is based on a state&apos;s per-capita income compared to the national average. 
                    <strong> Poorer states get higher federal matching</strong> (up to 83%), while 
                    wealthier states get the minimum (50%). This ensures federal support goes where 
                    it&apos;s needed most.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 border">
                  <h4 className="font-bold mb-2">What does &quot;Expansion&quot; mean?</h4>
                  <p className="text-gray-600 text-xs">
                    Under the Affordable Care Act, states can <strong>expand Medicaid</strong> to cover 
                    more low-income adults. The federal government pays 90% of costs for this expanded 
                    population. <strong>41 states have expanded</strong>; 10 have not.
                  </p>
                </div>
              </div>

              <div className="bg-black text-white p-4">
                <h4 className="font-bold mb-2">Key Insight</h4>
                <p className="text-sm">
                  Mississippi has the highest FMAP at 78.82% — meaning the federal government pays nearly 
                  80% of their Medicaid costs. Meanwhile, wealthy states like California, New York, and 
                  Massachusetts are at the 50% floor and must fund half their Medicaid programs themselves.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Data Verification */}
        <div className="mb-6">
          <DataVerificationBadge records="227M" spending="$1.09T" compact />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="border-2 border-black p-4 group relative">
            <p className="text-sm text-gray-500">States + DC</p>
            <p className="text-2xl font-bold">{data.summary.totalStates}</p>
            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs w-48 z-10">
              All 50 states plus Washington D.C. and territories
            </div>
          </div>
          <div className="border-2 border-black p-4 group relative">
            <p className="text-sm text-gray-500">Avg FMAP</p>
            <p className="text-2xl font-bold">{data.summary.avgFMAP}%</p>
            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs w-48 z-10">
              On average, the federal government pays {data.summary.avgFMAP}% of state Medicaid costs
            </div>
          </div>
          <div className="border-2 border-black p-4 group relative">
            <p className="text-sm text-gray-500">Expansion</p>
            <p className="text-2xl font-bold">{data.summary.expansionStates}</p>
            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs w-48 z-10">
              States that expanded Medicaid under the ACA to cover more low-income adults
            </div>
          </div>
          <div className="border-2 border-black p-4 group relative">
            <p className="text-sm text-gray-500">Non-Expansion</p>
            <p className="text-2xl font-bold">{data.summary.nonExpansionStates}</p>
            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs w-48 z-10">
              States that have not expanded Medicaid, leaving a &quot;coverage gap&quot; for some residents
            </div>
          </div>
          <div className="border-2 border-black p-4 group relative">
            <p className="text-sm text-gray-500">Districts</p>
            <p className="text-2xl font-bold">{data.summary.totalDistricts}</p>
            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs w-48 z-10">
              Congressional districts — each represents ~760,000 people and has one House representative
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['overview', 'charts', 'states', 'districts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-bold border-2 border-black ${activeTab === tab ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Expansion Analysis */}
            <div className="border-2 border-black p-6">
              <h2 className="font-bold mb-2">MEDICAID EXPANSION ANALYSIS</h2>
              <p className="text-sm text-gray-600 mb-4">
                Comparing states that expanded Medicaid coverage vs. those that did not
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-100 p-4 border border-gray-300">
                  <p className="text-sm text-gray-700">Expansion States ({data.expansionAnalysis.expansionCount})</p>
                  <p className="text-2xl font-bold">{data.expansionAnalysis.avgExpansionFMAP.toFixed(1)}% avg FMAP</p>
                  <p className="text-xs text-gray-500 mt-1">Federal govt pays this share of costs</p>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-300">
                  <p className="text-sm text-gray-700">Non-Expansion States ({data.expansionAnalysis.nonExpansionCount})</p>
                  <p className="text-2xl font-bold">{data.expansionAnalysis.avgNonExpansionFMAP.toFixed(1)}% avg FMAP</p>
                  <p className="text-xs text-gray-500 mt-1">Federal govt pays this share of costs</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-black p-6">
                <h3 className="font-bold mb-2">STATES WITH HIGHEST FEDERAL SUPPORT</h3>
                <p className="text-xs text-gray-500 mb-4">These states receive the largest federal share of Medicaid costs</p>
                <div className="space-y-2">
                  {data.statesByFMAP.slice(0, 5).map((s, i) => (
                    <div key={s.stateCode} className="flex justify-between items-center border-b pb-2 group relative">
                      <span className="font-mono">{i+1}. {s.stateName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 ${s.expansionStatus === 'Y' ? 'bg-gray-200' : 'bg-gray-100'}`}>
                          {s.expansionStatus === 'Y' ? 'Expanded' : 'Not Expanded'}
                        </span>
                        <span className="font-bold">{s.fy2024}%</span>
                      </div>
                      <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs w-64 z-10">
                        Federal govt pays {s.fy2024}% of {s.stateName}&apos;s Medicaid costs. The state pays {(100 - s.fy2024).toFixed(1)}%.
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-2 border-black p-6">
                <h3 className="font-bold mb-2">TOP CONGRESSIONAL DISTRICTS BY SPENDING</h3>
                <p className="text-xs text-gray-500 mb-4">Estimated Medicaid spending by House district</p>
                <div className="space-y-2">
                  {data.topDistricts.slice(0, 5).map((d, i) => (
                    <div key={d.districtCode} className="flex justify-between items-center border-b pb-2 group relative">
                      <span className="font-mono">{i+1}. {d.districtCode}</span>
                      <span className="font-bold">{fmt(d.spending)}</span>
                      <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs w-64 z-10">
                        <strong>{parseDistrict(d.districtCode)}</strong><br/>
                        Estimated ${(d.spending / 1e9).toFixed(2)} billion in Medicaid spending
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-8">
            {/* Row 1: FMAP Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top 10 FMAP */}
              <div className="border-2 border-black p-6">
                <h3 className="font-bold mb-2">TOP 10 STATES BY FEDERAL SUPPORT</h3>
                <p className="text-xs text-gray-500 mb-4">Higher % = federal govt pays more of the costs</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top10FMAP} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[50, 80]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip 
                      formatter={(v) => v != null ? `${v}%` : ""} 
                      labelFormatter={(label) => {
                        const item = top10FMAP.find(d => d.name === label);
                        return item ? item.fullName : label;
                      }}
                    />
                    <Bar dataKey="fmap" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Expansion Pie */}
              <div className="border-2 border-black p-6">
                <h3 className="font-bold mb-2">MEDICAID EXPANSION STATUS</h3>
                <p className="text-xs text-gray-500 mb-4">How many states expanded coverage under the ACA</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expansionPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#000"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {expansionPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 2: Trend and Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* FMAP Trend */}
              <div className="border-2 border-black p-6">
                <h3 className="font-bold mb-2">FMAP CHANGES OVER TIME</h3>
                <p className="text-xs text-gray-500 mb-4">How federal support has shifted for top states</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fmapTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[70, 82]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => v != null ? `${v}%` : ""} />
                    <Legend />
                    <Line type="monotone" dataKey="FY2022" stroke="#999999" strokeWidth={2} />
                    <Line type="monotone" dataKey="FY2023" stroke="#666666" strokeWidth={2} />
                    <Line type="monotone" dataKey="FY2024" stroke="#000000" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Expansion Comparison */}
              <div className="border-2 border-black p-6">
                <h3 className="font-bold mb-2">EXPANSION VS NON-EXPANSION</h3>
                <p className="text-xs text-gray-500 mb-4">Average federal support by expansion status</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expansionComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[50, 75]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => v != null ? `${Number(v).toFixed(1)}%` : ""} />
                    <Bar dataKey="avgFMAP" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 3: Distribution and Districts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* FMAP Distribution */}
              <div className="border-2 border-black p-6">
                <h3 className="font-bold mb-2">HOW STATES ARE DISTRIBUTED</h3>
                <p className="text-xs text-gray-500 mb-4">Number of states in each FMAP range</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fmapDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Districts */}
              <div className="border-2 border-black p-6">
                <h3 className="font-bold mb-2">TOP CONGRESSIONAL DISTRICTS</h3>
                <p className="text-xs text-gray-500 mb-4">Highest estimated Medicaid spending by House district</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top10Districts} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `$${v}B`} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip 
                      formatter={(v) => v != null ? `$${Number(v).toFixed(2)}B` : ""}
                      labelFormatter={(label) => {
                        const item = top10Districts.find(d => d.name === label);
                        return item ? item.fullName : label;
                      }}
                    />
                    <Bar dataKey="spending" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* States Tab */}
        {activeTab === 'states' && (
          <div className="border-2 border-black">
            <div className="bg-gray-50 p-4 border-b-2 border-black">
              <h2 className="font-bold">ALL STATES BY FEDERAL SUPPORT</h2>
              <p className="text-xs text-gray-500">Higher FMAP = federal govt pays more of Medicaid costs</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-3 text-left">State</th>
                    <th className="p-3 text-right">FY2024 FMAP</th>
                    <th className="p-3 text-right">FY2023</th>
                    <th className="p-3 text-right">FY2022</th>
                    <th className="p-3 text-center">Expanded</th>
                  </tr>
                </thead>
                <tbody>
                  {data.statesByFMAP.map((s, i) => (
                    <tr key={s.stateCode} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} group relative`}>
                      <td className="p-3 font-mono">{s.stateName}</td>
                      <td className="p-3 text-right font-bold">{s.fy2024}%</td>
                      <td className="p-3 text-right">{s.fy2023}%</td>
                      <td className="p-3 text-right">{s.fy2022}%</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs ${s.expansionStatus === 'Y' ? 'bg-gray-200' : 'bg-gray-100'}`}>
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
        {activeTab === 'districts' && (
          <div className="border-2 border-black">
            <div className="bg-gray-50 p-4 border-b-2 border-black">
              <h2 className="font-bold">CONGRESSIONAL DISTRICTS BY SPENDING</h2>
              <p className="text-xs text-gray-500">
                Each district has one House representative. Spending is estimated by distributing state totals proportionally.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Code</th>
                    <th className="p-3 text-left">District</th>
                    <th className="p-3 text-right">Est. Spending</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topDistricts.slice(0, 50).map((d, i) => (
                    <tr key={d.districtCode} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3 font-mono">{d.districtCode}</td>
                      <td className="p-3 text-gray-600">{parseDistrict(d.districtCode)}</td>
                      <td className="p-3 text-right font-bold">{fmt(d.spending)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Methodology */}
        <div className="border-2 border-black p-4 mt-8 bg-gray-50">
          <h3 className="font-bold mb-2">How to Read This Data</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>FMAP</strong> rates determine how Medicaid costs are split between federal and state governments. 
              A 70% FMAP means Washington pays 70 cents and the state pays 30 cents of every Medicaid dollar.
            </p>
            <p>
              <strong>Congressional district spending</strong> is estimated by dividing each state&apos;s total Medicaid 
              spending across its House districts. This shows where federal healthcare dollars flow geographically.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h4 className="font-bold text-sm mb-2">DATA SOURCES (Click to verify)</h4>
            <div className="flex flex-wrap gap-3 text-xs">
              <a 
                href="https://www.medicaid.gov/medicaid/finance/state-financials/federal-matching-rates-and-data/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                CMS FMAP Rates
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
              <a 
                href="https://www.kff.org/medicaid/issue-brief/status-of-state-medicaid-expansion-decisions-interactive-map/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                KFF Expansion Status
              </a>
              <span className="text-gray-400">|</span>
              <Link href="/sources" className="underline hover:no-underline font-bold">
                All Sources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
