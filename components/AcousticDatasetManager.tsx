'use client';

import { useState } from 'react';
import { echoSoundAPI } from '@/lib/api-client';

export default function AcousticDatasetManager() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setError(null);
  };

  const handleAnalyzeAudio = async (file: File) => {
    try {
      console.log('[v0] Analyzing acoustic file:', file.name);
      const analysis = await echoSoundAPI.analyzeAcoustic(file);
      setResults(prev => [...(prev || []), { file: file.name, analysis }]);
    } catch (err) {
      setError(`Failed to analyze ${file.name}: ${err}`);
    }
  };

  const handleBatchAnalysis = async () => {
    if (files.length === 0) {
      setError('Please select audio files first');
      return;
    }

    setUploading(true);
    setResults([]);
    setError(null);

    try {
      for (const file of files) {
        await handleAnalyzeAudio(file);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 shadow-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Acoustic Dataset Manager</h2>

      {/* File Upload Section */}
      <div className="mb-8 bg-white rounded-lg p-6 border-2 border-dashed border-indigo-300">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Plant Audio Files</h3>
        
        <input
          type="file"
          multiple
          accept="audio/wav,audio/mp3,audio/mpeg"
          onChange={handleFileSelect}
          disabled={uploading}
          className="w-full mb-4"
        />

        {files.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Selected Files ({files.length}):</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {files.map((file, idx) => (
                <li key={idx}>• {file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleBatchAnalysis}
          disabled={files.length === 0 || uploading}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            uploading || files.length === 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {uploading ? 'Analyzing...' : 'Analyze Acoustic Patterns'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-red-800 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Results Display */}
      {results && results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Analysis Results</h3>
          
          {results.map((result: any, idx: number) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{result.file}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Acoustic Stress Level</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {result.analysis.acoustic_stress_level.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Confidence</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {result.analysis.confidence.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">Status:</p>
                <p className={`text-lg font-bold ${
                  result.analysis.stress_detected ? 'text-red-600' : 'text-green-600'
                }`}>
                  {result.analysis.stress_detected ? 'Stress Detected' : 'Healthy'}
                </p>
              </div>

              {result.analysis.recommendations.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Recommendations:</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {result.analysis.recommendations.map((rec: string, rIdx: number) => (
                      <li key={rIdx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setFiles([]);
                setResults(null);
              }}
              className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
            >
              Clear Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
