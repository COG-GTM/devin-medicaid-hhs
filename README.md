# DEVIN//HHS

Full transparency into Medicaid provider spending across the United States.

**Live:** https://devin-hhs.vercel.app

## Overview

DEVIN//HHS provides unprecedented transparency into Medicaid provider spending, transforming 227 million healthcare spending records into accessible, searchable information for researchers, policymakers, and the public.

## Features

### Provider Analysis
- **227M+ Records** - Complete Medicaid provider utilization data (2018-2024)
- **Provider Search** - Look up any provider by NPI
- **HCPCS Analysis** - Procedure code breakdowns with spending trends
- **Outlier Detection** - Statistical identification of unusual spending patterns

### Federal Funding
- **FMAP Rates** - Federal Medical Assistance Percentage for all 51 states/territories
- **Expansion Analysis** - Comparison of expansion vs non-expansion states
- **Congressional Districts** - Spending estimates for 436 districts
- **AI Insights** - Policy implications and economist-grade analysis

### Visualizations
- 15+ interactive charts powered by Recharts
- Geographic distribution analysis
- Time series trends
- Cost efficiency metrics

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Database:** TimescaleDB (PostgreSQL)
- **Deployment:** Vercel
- **Data Source:** [opendata.hhs.gov](https://opendata.hhs.gov)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Configuration

All environment variables are configured via Vercel dashboard:

```bash
# Connect to Vercel project
vercel link

# Pull environment variables for local development
vercel env pull .env.local
```

**No credentials are stored in this repository.**

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── federal/       # Federal funding pages
│   ├── charts/        # Visualization page
│   ├── explore/       # Data exploration
│   ├── outliers/      # Statistical outliers
│   └── analysis/      # AI-generated insights
├── lib/
│   ├── aggregates.ts  # Pre-computed provider data
│   ├── federal-aggregates.ts  # FMAP and district data
│   └── hcpcs-definitions.ts   # Procedure code definitions
└── components/
    └── ProviderSearch.tsx
```

## Data Sources

- **Provider Spending:** HHS Open Data - Medicaid Provider Utilization
- **FMAP Rates:** CMS Federal Medical Assistance Percentage (FY2022-2024)
- **Congressional Districts:** Census Bureau
- **Provider Registry:** NPPES (National Plan and Provider Enumeration System)

## Built With

This transparency platform was built using **Devin CLI** — demonstrating AI-assisted development for complex, data-intensive applications.

## License

This project provides transparency into public data. The underlying data is from [opendata.hhs.gov](https://opendata.hhs.gov) and is in the public domain.
