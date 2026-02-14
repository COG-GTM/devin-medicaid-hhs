import { NextResponse } from 'next/server';
import { 
  FMAP_DATA, 
  DISTRICT_SPENDING, 
  FEDERAL_SUMMARY,
  FEDERAL_METADATA 
} from '@/lib/federal-aggregates';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  // Sort states by FMAP rate
  const statesByFMAP = [...FMAP_DATA].sort((a, b) => b.fy2024 - a.fy2024);
  
  // Top 10 districts by spending
  const topDistricts = DISTRICT_SPENDING.slice(0, 25);
  
  // District outliers (z > 3)
  const districtOutliers = DISTRICT_SPENDING.filter(d => d.zScore > 3);
  
  // Expansion vs non-expansion comparison
  const expansionStates = FMAP_DATA.filter(f => f.expansionStatus === 'Y');
  const nonExpansionStates = FMAP_DATA.filter(f => f.expansionStatus === 'N');
  
  const avgExpansionFMAP = expansionStates.reduce((s, f) => s + f.fy2024, 0) / expansionStates.length;
  const avgNonExpansionFMAP = nonExpansionStates.reduce((s, f) => s + f.fy2024, 0) / nonExpansionStates.length;

  return NextResponse.json({
    summary: FEDERAL_SUMMARY,
    statesByFMAP,
    topDistricts,
    districtOutliers,
    expansionAnalysis: {
      expansionCount: expansionStates.length,
      nonExpansionCount: nonExpansionStates.length,
      avgExpansionFMAP: parseFloat(avgExpansionFMAP.toFixed(2)),
      avgNonExpansionFMAP: parseFloat(avgNonExpansionFMAP.toFixed(2)),
    },
    allDistricts: DISTRICT_SPENDING,
    metadata: FEDERAL_METADATA
  });
}
