
import React, { useState } from 'react';
import { ReferenceResult, ValidationStatus } from '../types';

interface ReferenceListProps {
  results: ReferenceResult[];
}

const StatusBadge: React.FC<{ status: ValidationStatus }> = ({ status }) => {
  switch (status) {
    case ValidationStatus.VALID:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          Verified Real
        </span>
      );
    case ValidationStatus.INVALID:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <svg className="mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          Likely Fake / Incorrect
        </span>
      );
    case ValidationStatus.PENDING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <svg className="animate-spin mr-1.5 h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </span>
        );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <svg className="mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          Uncertain
        </span>
      );
  }
};

const ReferenceList: React.FC<ReferenceListProps> = ({ results }) => {
  const [copied, setCopied] = useState(false);

  if (results.length === 0) return null;

  const handleCopyReport = async () => {
    const processed = results.filter(r => r.status !== ValidationStatus.PENDING);
    if (processed.length === 0) return;

    const reportItems = processed.map((res, idx) => {
      let section = `Reference ${idx + 1}: ${res.status}\n`;
      section += `Original Input: ${res.originalText}\n`;

      if (res.status === ValidationStatus.VALID) {
         if (res.correctedCitation) {
             section += `Corrected Citation: ${res.correctedCitation}\n`;
         } else {
             section += `Status: Correct.\n`;
         }
         section += `Details: ${res.details}\n`;
      } else if (res.status === ValidationStatus.INVALID) {
         section += `Analysis: This reference appears to be hallucinated or significantly incorrect.\n`;
         if (res.alternatives && res.alternatives.length > 0) {
             section += `Suggested Real Alternatives:\n`;
             res.alternatives.forEach(alt => section += `- ${alt}\n`);
         }
      } else {
         section += `Analysis: Verification was inconclusive.\n`;
      }
      return section;
    });

    const promptHeader = "I have analyzed my bibliography using a verification tool. Please help me correct my references based on the following report:\n\n";
    const finalReport = promptHeader + reportItems.join('\n----------------------------------------\n\n');
    
    try {
      await navigator.clipboard.writeText(finalReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center justify-between sticky top-0 bg-white z-10 pt-2">
        <span className="flex items-center gap-2">
            Analysis Results
            {results.some(r => r.status === ValidationStatus.PENDING) && (
                 <span className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                 </span>
            )}
        </span>
        <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 font-normal hidden sm:inline-block">
                {results.filter(r => r.status !== ValidationStatus.PENDING).length} / {results.length} processed
            </span>
            <button 
               onClick={handleCopyReport}
               disabled={results.every(r => r.status === ValidationStatus.PENDING)}
               className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 shadow-sm border 
                 ${copied 
                   ? 'bg-green-50 text-green-700 border-green-200' 
                   : 'bg-white text-indigo-600 border-gray-200 hover:bg-gray-50 hover:text-indigo-700'
                 }
                 ${results.every(r => r.status === ValidationStatus.PENDING) ? 'opacity-50 cursor-not-allowed' : ''}
                 `}
            >
               {copied ? (
                   <>
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     Copied Report
                   </>
               ) : (
                   <>
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                     Copy for AI
                   </>
               )}
            </button>
        </div>
      </h2>
      <div className="space-y-4">
        {results.map((result) => (
          <div 
            key={result.id} 
            className={`rounded-lg border p-5 transition-all duration-200 ${
              result.status === ValidationStatus.INVALID 
                ? 'border-red-200 bg-red-50' 
                : result.status === ValidationStatus.VALID 
                  ? 'border-green-200 bg-green-50'
                  : result.status === ValidationStatus.PENDING
                    ? 'border-blue-100 bg-white shadow-sm'
                    : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge status={result.status} />
                  {result.sourceUrl && (
                     <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                       Source Found
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                     </a>
                  )}
                </div>
                
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Input</p>
                  <p className={`font-serif text-sm leading-relaxed ${result.status === ValidationStatus.PENDING ? 'text-gray-400' : 'text-gray-800'}`}>
                    {result.originalText}
                  </p>
                </div>

                {result.status === ValidationStatus.VALID && result.correctedCitation && result.correctedCitation !== result.originalText && (
                   <div className="mt-3 bg-white bg-opacity-60 p-3 rounded border border-green-100">
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Suggested Correction</p>
                      <p className="font-serif text-gray-900 text-sm">{result.correctedCitation}</p>
                   </div>
                )}

                {result.status !== ValidationStatus.PENDING && (
                    <p className="text-sm text-gray-600 mt-2"><span className="font-medium text-gray-700">Analysis:</span> {result.details}</p>
                )}
              </div>
            </div>

            {result.status === ValidationStatus.INVALID && result.alternatives.length > 0 && (
              <div className="mt-4 border-t border-red-100 pt-3">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Suggested Real Alternatives
                </p>
                <ul className="space-y-2">
                  {result.alternatives.map((alt, idx) => (
                    <li key={idx} className="text-sm text-gray-800 font-serif bg-white p-2 rounded border border-red-100 shadow-sm">
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferenceList;
