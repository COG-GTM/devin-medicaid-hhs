# FEDERAL & CONGRESSIONAL DATA EXPANSION
## Engineering Specification v1.0

**Author:** COG-GTM Team  
**Date:** February 14, 2026  
**Status:** PLANNING  

---

## Executive Summary

Expand DEVIN//HHS to include federal funding analysis and congressional district-level Medicaid data. This adds two major data dimensions:
1. **Federal Funding Flow** — FMAP rates, federal vs state share, matching formulas
2. **Congressional District Analysis** — Spending, providers, and beneficiaries by CD

Both datasets will be fully ingested (no sampling), stored in Timescale, and exposed through a new "Federal" tab with the same statistical rigor as existing analysis.

---

## Phase 1: Data Source Identification

### 1.1 Federal Funding Data Sources

| Source | URL | Data Points | Format | Update Frequency |
|--------|-----|-------------|--------|------------------|
| **CMS FMAP Rates** | medicaid.gov/federal-policy-guidance/downloads/fmap-rates | FMAP by state, fiscal year | CSV/PDF | Annual (Oct 1) |
| **MACPAC Data Book** | macpac.gov/data | Federal/state spending split, enrollment | Excel | Quarterly |
| **CMS-64 Expenditure Reports** | medicaid.gov/medicaid/finance | Actual expenditures by state, category | CSV | Quarterly |
| **HHS Budget Documents** | hhs.gov/budget | Appropriations, outlays | PDF/Excel | Annual |

**Key Metrics to Extract:**
- FMAP rate by state (FY2018-2024)
- Enhanced FMAP (ACA expansion states)
- Federal share of spending ($)
- State share of spending ($)
- Administrative vs benefit spending split
- Per-beneficiary federal contribution

### 1.2 Congressional District Data Sources

| Source | URL | Data Points | Format |
|--------|-----|-------------|--------|
| **Census TIGER/Line** | census.gov/geographies/mapping-files | ZIP to CD crosswalk | Shapefile/CSV |
| **HHS HRSA Data** | data.hrsa.gov | Health center funding by CD | CSV |
| **CMS Geographic Variation** | data.cms.gov/geographic-variation | Spending by region (needs CD mapping) | CSV |
| **ProPublica Congress API** | propublica.org/datastore | Member info, committee assignments | JSON API |

**Key Metrics to Extract:**
- Medicaid spending by congressional district
- Provider count by CD
- Beneficiary count by CD
- Top HCPCS codes by CD
- Per-capita spending by CD
- Outlier analysis by CD

---

## Phase 2: Data Pipeline Architecture

### 2.1 New Database Tables

```sql
-- Federal funding by state and year
CREATE TABLE federal_funding (
  id SERIAL PRIMARY KEY,
  state_code CHAR(2) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  fmap_rate DECIMAL(5,2),           -- e.g., 50.00 to 83.00
  enhanced_fmap_rate DECIMAL(5,2),  -- ACA expansion rate
  federal_spending DECIMAL(18,2),
  state_spending DECIMAL(18,2),
  total_spending DECIMAL(18,2),
  enrollment INTEGER,
  per_beneficiary_federal DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(state_code, fiscal_year)
);

-- Congressional district reference
CREATE TABLE congressional_districts (
  id SERIAL PRIMARY KEY,
  district_code VARCHAR(10) NOT NULL UNIQUE,  -- e.g., 'CA-12'
  state_code CHAR(2) NOT NULL,
  district_number INTEGER NOT NULL,
  representative_name VARCHAR(255),
  party CHAR(1),
  committee_assignments TEXT[],
  population INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ZIP to congressional district mapping
CREATE TABLE zip_to_district (
  zip_code VARCHAR(10) NOT NULL,
  district_code VARCHAR(10) NOT NULL,
  coverage_ratio DECIMAL(5,4),  -- % of ZIP in this district
  PRIMARY KEY (zip_code, district_code)
);

-- Pre-computed district aggregates
CREATE TABLE district_spending (
  id SERIAL PRIMARY KEY,
  district_code VARCHAR(10) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  total_spending DECIMAL(18,2),
  total_claims BIGINT,
  total_beneficiaries BIGINT,
  provider_count INTEGER,
  top_hcpcs_codes JSONB,        -- [{code, spending, claims}]
  spending_z_score DECIMAL(8,2),
  per_capita DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_code, fiscal_year)
);

-- Indexes for performance
CREATE INDEX idx_federal_funding_state ON federal_funding(state_code);
CREATE INDEX idx_federal_funding_year ON federal_funding(fiscal_year);
CREATE INDEX idx_district_spending_code ON district_spending(district_code);
CREATE INDEX idx_zip_district ON zip_to_district(zip_code);
```

### 2.2 Data Ingestion Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA INGESTION PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FEDERAL FUNDING:                                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Download │ -> │  Parse   │ -> │ Validate │ -> │  Insert  │  │
│  │ CMS/MACPAC│   │ CSV/Excel│    │ & Clean  │    │ Timescale│  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  CONGRESSIONAL DISTRICTS:                                        │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Download │ -> │ Build    │ -> │ Join with│ -> │ Aggregate│  │
│  │ TIGER/ZIP│    │ Crosswalk│    │ Provider │    │ by CD    │  │
│  └──────────┘    └──────────┘    │ Locations│    └──────────┘  │
│                                  └──────────┘                    │
│                                                                  │
│  OUTPUT: Static TS files + DB tables                            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Aggregation Strategy

**For Congressional Districts:**
1. Load ZIP-to-CD crosswalk (Census ZCTA-CD relationship file)
2. Match provider_locations.zip_code -> congressional district
3. Aggregate spending from medicaid_provider_spending
4. Compute z-scores, per-capita, outliers
5. Store in district_spending table
6. Generate static file for instant API response

**Estimated Processing Time:**
- 8.99M provider locations to process
- ~43,000 ZIP codes to map
- 435 congressional districts (+ 6 non-voting)
- Target: < 30 minutes local processing

---

## Phase 3: API Design

### 3.1 New Endpoints

```
GET /api/federal
  - Returns federal funding overview
  - FMAP rates by state
  - Federal vs state spending breakdown
  - Year-over-year trends

GET /api/federal/states
  - Detailed state-by-state federal analysis
  - Sortable by FMAP, spending, per-capita

GET /api/federal/districts
  - Congressional district overview
  - All 441 districts ranked

GET /api/federal/districts/[code]
  - Single district deep dive
  - e.g., /api/federal/districts/CA-12

GET /api/federal/outliers
  - Statistical outliers at CD level
  - Z-score analysis
  - Human-scale analogies
```

### 3.2 Response Schema

```typescript
interface FederalOverview {
  totalFederalSpending: number;
  totalStateSpending: number;
  averageFMAP: number;
  expansionStates: number;
  nonExpansionStates: number;
  yearlyTrends: YearlyFederalData[];
  stateRankings: StateFederalData[];
}

interface DistrictData {
  districtCode: string;         // 'CA-12'
  stateName: string;
  districtNumber: number;
  representative: string;
  party: string;
  totalSpending: number;
  totalClaims: number;
  totalBeneficiaries: number;
  providerCount: number;
  perCapita: number;
  spendingZScore: number;
  topHCPCS: HCPCSAggregate[];
  analogy: ZScoreAnalogy;
}
```

---

## Phase 4: UI Implementation

### 4.1 New "Federal" Tab Structure

```
/federal (main page)
├── Overview cards (total federal $, state $, avg FMAP)
├── FMAP map (choropleth by state)
├── Federal vs State spending chart
├── Year-over-year trends
└── Links to deep dives

/federal/states (state analysis)
├── Sortable table of all states
├── FMAP rate ranking
├── Expansion status filter
└── Per-beneficiary comparison

/federal/districts (congressional analysis)
├── All 441 districts ranked
├── Search by state or representative
├── Outlier highlighting
└── Pagination (25 per page)

/federal/districts/[code] (single district)
├── Representative info
├── Spending breakdown
├── Top providers in district
├── Top HCPCS codes
├── Statistical analysis
└── Comparison to state/national average
```

### 4.2 Component Hierarchy

```
<FederalLayout>
  <FederalNav />
  <FederalOverviewCards />
  <FMAPMap />                    // Choropleth visualization
  <FederalStateChart />          // Federal vs State bar chart
  <FederalTrendsChart />         // Year-over-year line chart
  <DistrictTable />              // Paginated district list
  <DistrictOutliers />           // Z-score analysis
  <AIAnalysisSection />          // Same format as /analysis
</FederalLayout>
```

---

## Phase 5: Statistical Analysis

### 5.1 Metrics to Compute

**Federal Funding Analysis:**
- FMAP correlation with state income
- Expansion vs non-expansion spending gap
- Federal ROI (health outcomes vs spending)
- Administrative cost ratio by state

**Congressional District Analysis:**
- Spending per capita by CD
- Provider density by CD
- Specialty care access by CD
- Urban vs rural CD comparison
- Z-score outliers (same methodology as /outliers)
- Claims per beneficiary by CD

### 5.2 AI Analysis Generation

Apply same `generateInsights()` pattern:
```typescript
function generateFederalInsights(data: FederalData): Insight[] {
  const insights: Insight[] = [];
  
  // FMAP disparity analysis
  // Expansion impact analysis
  // Congressional district outliers
  // Geographic access patterns
  // Year-over-year trend analysis
  
  return insights;
}
```

---

## Phase 6: Testing Plan

### 6.1 Unit Tests

```
src/lib/federal-aggregates.test.ts
  - FMAP calculation validation
  - ZIP-to-CD mapping accuracy
  - Z-score computation
  - Outlier detection

src/app/api/federal/route.test.ts
  - API response schema
  - Edge cases (missing districts)
  - Performance benchmarks
```

### 6.2 Integration Tests

```
- Full pipeline: CSV -> DB -> API -> UI
- Cross-reference with official CMS totals
- District spending sum = state spending
- No orphan providers (all mapped to CD)
```

### 6.3 E2E Tests

```
e2e/federal.spec.ts
  - /federal page loads
  - State table sorting works
  - District search works
  - Single district page renders
  - Outlier analogies display
```

---

## Phase 7: Implementation Timeline

| Phase | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 1 | Download FMAP data (CMS) | 30 min | None |
| 2 | Download ZIP-CD crosswalk (Census) | 30 min | None |
| 3 | Create DB tables | 15 min | None |
| 4 | Parse & ingest FMAP data | 1 hr | Phase 1,3 |
| 5 | Build ZIP-CD mapping | 1 hr | Phase 2,3 |
| 6 | Aggregate spending by CD | 2 hr | Phase 5 |
| 7 | Generate static TS files | 30 min | Phase 4,6 |
| 8 | Build API endpoints | 1 hr | Phase 7 |
| 9 | Build UI pages | 2 hr | Phase 8 |
| 10 | Add AI analysis | 1 hr | Phase 9 |
| 11 | Write tests | 1 hr | Phase 10 |
| 12 | E2E testing | 30 min | Phase 11 |
| 13 | Deploy | 15 min | Phase 12 |

**Total Estimated Time: ~12 hours**

---

## Phase 8: Data Sources (Direct Links)

### Federal Funding
1. **FMAP Rates FY2024**: https://www.federalregister.gov/documents/2022/11/29/2022-25806/federal-financial-participation-in-state-assistance-expenditures-federal-matching-shares-for
2. **MACPAC Expenditure Data**: https://www.macpac.gov/publication/medicaid-spending-by-state-category-and-source-of-funds/
3. **CMS-64 Reports**: https://www.medicaid.gov/medicaid/financial-management/state-expenditure-reporting-for-medicaid-chip/expenditure-reports-mbescbes/index.html

### Congressional Districts
1. **Census ZCTA-CD Crosswalk**: https://www.census.gov/geographies/mapping-files/time-series/geo/relationship-files.html
2. **Census CD Boundaries**: https://www.census.gov/cgi-bin/geo/shapefiles/index.php?year=2023&layergroup=Congressional+Districts
3. **ProPublica Congress API**: https://projects.propublica.org/api-docs/congress-api/

---

## Acceptance Criteria

- [ ] FMAP data for all 50 states + DC + territories (FY2018-2024)
- [ ] ZIP-to-CD mapping covers 99%+ of provider locations
- [ ] All 441 congressional districts have spending data
- [ ] Z-score outliers computed with unique analogies
- [ ] Federal tab accessible from main nav
- [ ] AI analysis generates 5+ insights
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Deployed to production

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FMAP data format changes | Low | Medium | Manual validation step |
| ZIP-CD mapping gaps | Medium | Low | Fallback to state-level |
| Processing timeout | Medium | Medium | Use static file approach |
| CD boundaries changed (redistricting) | Low | High | Use 118th Congress (current) |

---

## Sign-off

**Ready to execute?** Reply with approval and I'll begin Phase 1.

---

*Spec created: Feb 14, 2026*
*Author: COG-GTM Team*
