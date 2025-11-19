
import React, { useState } from 'react';
import Header from './components/Header';
import ReferenceList from './components/ReferenceList';
import { verifySingleReference } from './services/geminiService';
import { ProcessingState, AnalysisResponse, ValidationStatus, ReferenceResult } from './types';
import { SAMPLE_REFERENCES } from './constants';

const splitReferences = (text: string): string[] => {
  const normalized = text.trim();
  
  // BibTeX detection (lookahead for @ at start of line or block)
  if (normalized.includes('@') && normalized.includes('{')) {
      const entries = normalized.split(/(?=^@\w+\{)/m).map(e => e.trim()).filter(e => e.length > 5);
      if (entries.length > 0) return entries;
  }
  
  // LaTeX bibitem detection
  if (normalized.includes('\\bibitem')) {
      const entries = normalized.split(/(?=\\bibitem)/g).map(e => e.trim()).filter(e => e.length > 5);
      if (entries.length > 0) return entries;
  }

  // Numbered list detection [1], 1. etc.
  if (/^\[\d+\]/m.test(normalized) || /^\d+\./m.test(normalized)) {
       const entries = normalized.split(/(?:^|\n)(?=\[\d+\]|\d+\.)/g).map(e => e.trim()).filter(e => e.length > 5);
       if (entries.length > 0) return entries;
  }
  
  // Fallback: Split by double newlines (paragraphs) or just newlines if it looks like a simple list
  const byDouble = normalized.split(/\n\s*\n/).map(e => e.trim()).filter(e => e.length > 5);
  if (byDouble.length > 1) return byDouble;

  return normalized.split(/\n/).map(e => e.trim()).filter(e => e.length > 5);
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    currentStep: '',
    progress: { current: 0, total: 0 },
    error: null,
  });

  const handleVerify = async () => {
    if (!inputText.trim()) return;

    const references = splitReferences(inputText);
    
    if (references.length === 0) {
        setState(prev => ({ ...prev, error: "No valid references found in input." }));
        return;
    }

    // Initialize results with PENDING state
    const initialResults: ReferenceResult[] = references.map((text, idx) => ({
        id: `ref-${Date.now()}-${idx}`,
        originalText: text,
        status: ValidationStatus.PENDING,
        details: "Waiting for verification...",
        alternatives: []
    }));

    setAnalysis({ results: initialResults });
    setState({
      isProcessing: true,
      currentStep: 'Initializing...',
      progress: { current: 0, total: references.length },
      error: null,
    });

    // Process one by one
    for (let i = 0; i < initialResults.length; i++) {
        const item = initialResults[i];
        
        setState(prev => ({ 
            ...prev, 
            currentStep: `Verifying reference ${i + 1} of ${references.length}...`,
            progress: { current: i + 1, total: references.length }
        }));

        try {
            const result = await verifySingleReference(item.originalText, item.id);
            
            setAnalysis(prev => {
                if (!prev) return null;
                const newResults = [...prev.results];
                newResults[i] = result;
                return { ...prev, results: newResults };
            });
        } catch (e) {
            // Handle individual failure without stopping the loop
            setAnalysis(prev => {
                if (!prev) return null;
                const newResults = [...prev.results];
                newResults[i] = {
                    ...item,
                    status: ValidationStatus.UNCERTAIN,
                    details: "Failed to verify due to connection error."
                };
                return { ...prev, results: newResults };
            });
        }
    }

    setState(prev => ({
        ...prev,
        isProcessing: false,
        currentStep: 'Completed',
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          
          {/* Left Column: Input */}
          <div className="flex flex-col h-full space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Reference Input</h2>
                <button 
                  onClick={() => setInputText(SAMPLE_REFERENCES)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Load Sample Data (BibTeX)
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-3">
                Paste your bibliography, BibTeX, or \bibitem list below.
              </p>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste references here...
Example:
@article{smith2020,
  author = {Smith, J.},
  title = {Neural Networks},
  year = {2020}
}
or
\bibitem{nist} NIST, 'Post-Quantum Cryptography', 2024."
                className="flex-grow w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-xs sm:text-sm bg-gray-50 leading-relaxed"
                spellCheck={false}
              />

              <div className="mt-4 flex items-center justify-between">
                 <span className="text-xs text-gray-400">
                   {inputText.length} chars
                 </span>
                 <button
                  onClick={handleVerify}
                  disabled={state.isProcessing || !inputText.trim()}
                  className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all duration-200 flex items-center gap-2
                    ${state.isProcessing || !inputText.trim()
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow active:transform active:scale-95'}`}
                 >
                  {state.isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing {state.progress.current}/{state.progress.total}
                    </>
                  ) : (
                    <>
                      Verify References
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </>
                  )}
                </button>
              </div>
              {state.isProcessing && (
                 <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                    <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(state.progress.current / state.progress.total) * 100}%` }}></div>
                 </div>
              )}
              {state.error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                  <strong>Error:</strong> {state.error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="flex flex-col h-full">
            {analysis ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[500px] max-h-[calc(100vh-8rem)] overflow-y-auto">
                <ReferenceList results={analysis.results} />
                
                {/* Raw text fallback is less likely needed now, but kept just in case */}
                {(analysis.results.length === 0 && analysis.rawText) && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Raw Analysis Output</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono border border-gray-300">
                      {analysis.rawText}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Ready to Verify</h3>
                <p className="text-gray-500 max-w-xs mt-2">
                  Enter your references on the left to check for hallucinations and get real alternatives.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
