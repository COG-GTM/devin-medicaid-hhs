'use client';

import Link from 'next/link';

interface DataVerificationBadgeProps {
  records?: string;
  spending?: string;
  source?: string;
  compact?: boolean;
}

export default function DataVerificationBadge({ 
  records = '227M', 
  spending = '$1.09T',
  source = 'opendata.hhs.gov',
  compact = false
}: DataVerificationBadgeProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 text-xs bg-gray-100 border border-gray-300 px-2 py-1">
        <span className="font-bold text-green-700">VERIFIED</span>
        <span className="text-gray-600">{records} records | {spending} | Full data, no sampling</span>
      </div>
    );
  }

  return (
    <div className="border-2 border-green-700 bg-green-50 p-4">
      <div className="flex items-start gap-3">
        <div className="text-green-700 text-2xl font-bold">✓</div>
        <div className="flex-1">
          <h3 className="font-bold text-green-800">DATA VERIFICATION</h3>
          <p className="text-sm text-green-700 mt-1">
            This analysis uses the <strong>complete dataset</strong> — no sampling or approximations.
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <div>
              <span className="text-gray-500">Records:</span>
              <span className="font-bold ml-1">{records}</span>
            </div>
            <div>
              <span className="text-gray-500">Total Spending:</span>
              <span className="font-bold ml-1">{spending}</span>
            </div>
            <div>
              <span className="text-gray-500">Source:</span>
              <a href={`https://${source}`} target="_blank" rel="noopener noreferrer" 
                 className="font-bold ml-1 underline hover:no-underline">
                {source}
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <Link href="/sources" className="underline hover:no-underline">View all data sources</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
