'use client';

import { useState } from 'react';

interface Plant {
  id: number;
  name: string;
  emoji: string;
  status: 'healthy' | 'stressed' | 'critical';
  healthScore: number;
  image: string;
  metrics: {
    temperature: number;
    humidity: number;
    acousticPattern: string;
  };
}

interface TimelineEvent {
  date: string;
  event: string;
  healthScore: number;
}

export default function GrowthTimeline({ plants }: { plants: Plant[] }) {
  const [selectedPlant, setSelectedPlant] = useState(plants[0]);

  // Mock timeline events
  const timelineEvents: TimelineEvent[] = [
    { date: 'Today', event: 'Health check performed', healthScore: selectedPlant.healthScore },
    { date: '2 days ago', event: 'Watered successfully', healthScore: selectedPlant.healthScore + 2 },
    { date: '5 days ago', event: 'New leaf growth detected', healthScore: selectedPlant.healthScore - 1 },
    { date: '1 week ago', event: 'Started monitoring', healthScore: selectedPlant.healthScore - 5 },
  ];

  return (
    <div id="growth" className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 shadow-md border border-blue-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Growth Timeline</h2>

      {/* Plant Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Select Plant</label>
        <select
          value={selectedPlant.id}
          onChange={(e) => setSelectedPlant(plants.find(p => p.id === parseInt(e.target.value)) || plants[0])}
          className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
        >
          {plants.map(plant => (
            <option key={plant.id} value={plant.id}>
              {plant.emoji} {plant.name}
            </option>
          ))}
        </select>
      </div>

      {/* Plant Info */}
      <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Current Health</div>
            <div className="text-3xl font-bold text-blue-600">{selectedPlant.healthScore}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              selectedPlant.status === 'healthy'
                ? 'bg-green-100 text-green-800'
                : selectedPlant.status === 'stressed'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedPlant.status.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Temperature</div>
            <div className="text-2xl font-bold text-orange-600">{selectedPlant.metrics.temperature}°C</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Humidity</div>
            <div className="text-2xl font-bold text-blue-600">{selectedPlant.metrics.humidity}%</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400"></div>

        {/* Timeline events */}
        <div className="space-y-6 pl-16">
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-12 top-1 w-8 h-8 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>

              {/* Event card */}
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{event.event}</p>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-semibold">
                      {event.healthScore}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Average Health (Week)</div>
          <div className="text-3xl font-bold text-green-600">{(selectedPlant.healthScore - 2).toString()}%</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Days Since Watered</div>
          <div className="text-3xl font-bold text-blue-600">2</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
          <div className="text-3xl font-bold text-purple-600">+5%</div>
        </div>
      </div>
    </div>
  );
}
