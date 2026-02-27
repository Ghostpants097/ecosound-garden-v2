
'use client';

import { useState } from 'react';
import { publicDatasets, getPublicDatasetSamples, getDatasetDownloadInstructions, type PublicDatasetInfo } from '@/lib/publicDatasets';

export default function DatasetBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<'acoustic' | 'plant-health' | 'environmental'>('acoustic');
  const [selectedDataset, setSelectedDataset] = useState<PublicDatasetInfo | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const categoryDatasets = publicDatasets.filter(d => d.category === selectedCategory);
  const samples = selectedDataset ? getPublicDatasetSamples(selectedCategory) : [];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-orange-50 rounded-xl p-8 shadow-md border border-indigo-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Public Plant Health Datasets</h2>

      {/* Category Tabs */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {['acoustic', 'plant-health', 'environmental'].map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat as any);
              setSelectedDataset(null);
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-600'
            }`}
          >
            {cat === 'acoustic' ? 'Acoustic Data' : cat === 'plant-health' ? 'Plant Health' : 'Environmental'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dataset List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Available Datasets</h3>
          <div className="space-y-3">
            {categoryDatasets.map(dataset => (
              <button
                key={dataset.name}
                onClick={() => setSelectedDataset(dataset)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedDataset?.name === dataset.name
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-900 hover:border-indigo-600'
                }`}
              >
                <div className="font-semibold">{dataset.name}</div>
                <div className={`text-sm mt-1 ${selectedDataset?.name === dataset.name ? 'text-indigo-100' : 'text-gray-600'}`}>
                  {dataset.samples.toLocaleString()} samples
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dataset Details */}
        <div className="lg:col-span-2">
          {selectedDataset ? (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedDataset.name}</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Source</label>
                  <a
                    href={selectedDataset.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline break-all text-sm"
                  >
                    {selectedDataset.source}
                  </a>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Description</label>
                  <p className="text-gray-700 mt-1">{selectedDataset.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Total Samples</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedDataset.samples.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Category</div>
                    <div className="text-lg font-bold text-gray-900 capitalize">{selectedDataset.category}</div>
                  </div>
                </div>
              </div>

              {/* Sample Data */}
              {samples.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Sample Data</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {samples.slice(0, 5).map((sample, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{sample.datasetName}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            sample.label === 'healthy' ? 'bg-green-100 text-green-800' :
                            sample.label === 'critical' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sample.label}
                          </span>
                        </div>
                        <div className="text-gray-600 text-xs">
                          Confidence: {(sample.confidence * 100).toFixed(0)}% | Features: {sample.features.length}D
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href={selectedDataset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all text-center font-semibold"
                >
                  Download Dataset
                </a>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  {showInstructions ? 'Hide' : 'Show'} Instructions
                </button>
              </div>

              {showInstructions && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {getDatasetDownloadInstructions(selectedDataset)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <p className="text-gray-600 text-lg">Select a dataset to view details and download instructions</p>
            </div>
          )}
        </div>
      </div>

      {/* Integration Info */}
      <div className="mt-8 bg-indigo-50 rounded-lg p-6 border border-indigo-200">
        <h3 className="font-semibold text-gray-900 mb-3">How to Use These Datasets</h3>
        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
          <li>Select a dataset category (Acoustic, Plant Health, or Environmental)</li>
          <li>Click a dataset to view details and sample data</li>
          <li>Click "Download Dataset" to access the full dataset</li>
          <li>Follow the instructions to extract features and upload to your system</li>
          <li>The ML models will use this real data for training and validation</li>
        </ol>
      </div>
    </div>
  );
}
