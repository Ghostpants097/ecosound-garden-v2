'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { playPlantSound } from '@/lib/plantSoundGenerator';

interface Plant {
  id: number;
  name: string;
  emoji: string;
  status: 'healthy' | 'stressed' | 'critical';
  healthScore: number;
  image: string;
  musicUrl: string;
  metrics: {
    temperature: number;
    humidity: number;
    acousticPattern: string;
  };
}

interface PlantStatusGridProps {
  plants: Plant[];
  searchQuery?: string;
  statusFilter?: 'all' | 'healthy' | 'stressed' | 'critical';
  onPlantClick?: (plant: Plant) => void;
}

export default function PlantStatusGrid({ 
  plants, 
  searchQuery = '', 
  statusFilter = 'all',
  onPlantClick 
}: PlantStatusGridProps) {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSource | null>(null);

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          badge: 'bg-green-100 text-green-800',
          score: 'text-green-600'
        };
      case 'stressed':
        return {
          badge: 'bg-yellow-100 text-yellow-800',
          score: 'text-yellow-600'
        };
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-800',
          score: 'text-red-600'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          score: 'text-gray-600'
        };
    }
  };

  const handlePlayMusic = async (plantId: number, plantName: string) => {
    if (playingId === plantId) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setPlayingId(null);
      return;
    }

    // Stop previous sound
    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    // Extract plant type from URL
    const plantType = plantName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace('deliciosa', '')
      .replace('fig', 'fig')
      .trim();

    console.log('[v0] Playing plant sound:', plantType);
    
    setPlayingId(plantId);
    
    try {
      await playPlantSound(plantType, () => {
        setPlayingId(null);
      });
    } catch (err) {
      console.log('[v0] Plant sound generation failed:', err);
      setPlayingId(null);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Plant Status Overview ({filteredPlants.length})</h3>
      {filteredPlants.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <p className="text-gray-500 text-lg">No plants found matching your search.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlants.map(plant => {
          const colors = getStatusColor(plant.status);
          const displayTemp = Math.round(plant.metrics.temperature * 10) / 10;
          const displayHumidity = Math.round(plant.metrics.humidity);
          const isPlaying = playingId === plant.id;

          return (
            <div
              key={plant.id}
              onClick={() => onPlantClick?.(plant)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
            >
              {/* Plant Image */}
              <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                <Image
                  src={plant.image}
                  alt={plant.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {plant.emoji} {plant.name}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colors.badge}`}
                  >
                    {plant.status}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className={`text-xl font-bold ${colors.score}`}>
                      {plant.healthScore}%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Health Score</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {displayTemp}°C
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Temperature</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {displayHumidity}%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Humidity</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-gray-900">
                      {plant.metrics.acousticPattern}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Acoustic</div>
                  </div>
                </div>

                {/* Music Button */}
                <button
                  onClick={() => handlePlayMusic(plant.id, plant.name)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isPlaying
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  <span className="text-lg">
                    {isPlaying ? '⏸' : '▶'}
                  </span>
                  {isPlaying ? 'Stop Acoustic' : 'Play Plant Acoustic'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
