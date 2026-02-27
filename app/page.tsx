'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatsGrid from '@/components/StatsGrid';
import PlantStatusGrid from '@/components/PlantStatusGrid';
import AlertsSection from '@/components/AlertsSection';
import SearchBar from '@/components/SearchBar';
import PlantDetailModal from '@/components/PlantDetailModal';
import ExportButton from '@/components/ExportButton';
import UnifiedDashboard from '@/components/UnifiedDashboard';
import PlantComparison from '@/components/PlantComparison';
import GrowthTimeline from '@/components/GrowthTimeline';
import EnvironmentSummary from '@/components/EnvironmentSummary';
import WateringChecklist from '@/components/WateringChecklist';
import NotificationToast from '@/components/NotificationToast';
import UserSettings from '@/components/UserSettings';
import NavigationSidebar from '@/components/NavigationSidebar';
import RealTimeSensorDashboard from '@/components/RealTimeSensorDashboard';
import Footer from '@/components/Footer';
import { plantData, alertsData } from '@/lib/data';
import { initializeModels } from '@/lib/tfModels';

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

export default function Home() {
  const [plants, setPlants] = useState(plantData);
  const [alerts] = useState(alertsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'stressed' | 'critical'>('all');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Initialize ML models on mount
  useEffect(() => {
    initializeModels().catch(err => {
      console.error('[v0] Failed to initialize ML models:', err);
    });
  }, []);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setPlants(prev => 
        prev.map(plant => ({
          ...plant,
          metrics: {
            ...plant.metrics,
            temperature: plant.metrics.temperature + (Math.random() - 0.5) * 2,
            humidity: Math.max(20, Math.min(95, plant.metrics.humidity + (Math.random() - 0.5) * 3))
          }
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-emerald-700 to-teal-600 md:pl-64">
      {/* Navigation Sidebar */}
      <NavigationSidebar />

      {/* Notification Toast System */}
      <NotificationToast />

      {/* User Settings */}
      <UserSettings />

      {/* Main Content */}
      <div className="container mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden my-6 max-w-7xl">
        <Header />
        <StatsGrid plants={plants} />
        
        <div className="p-8 space-y-8">
          {/* Search and Export Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <SearchBar 
                onSearchChange={setSearchQuery}
                onStatusFilter={setStatusFilter}
              />
            </div>
            <ExportButton plants={plants} />
          </div>

          {/* Dashboard Section */}
          <section id="dashboard">
            <UnifiedDashboard plants={plants} />
          </section>

          {/* Plant Management Sections */}
          <section id="plants">
            <PlantStatusGrid 
              plants={plants}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onPlantClick={setSelectedPlant}
            />
          </section>

          {/* Analytics Section */}
          <section id="analytics">
            <PlantComparison plants={plants} />
          </section>

          {/* Growth Tracking */}
          <section id="growth">
            <GrowthTimeline plants={plants} />
          </section>

          {/* Environment Control */}
          <section id="environment">
            <EnvironmentSummary plants={plants} />
          </section>

          {/* Care Tasks */}
          <section id="care">
            <WateringChecklist plants={plants} />
          </section>

          {/* Real-time Sensors */}
          <section id="sensors">
            <RealTimeSensorDashboard plants={plants} />
          </section>

          {/* Alerts */}
          <section id="alerts">
            <AlertsSection alerts={alerts} />
          </section>
        </div>

        <Footer />
      </div>

      {/* Plant Detail Modal */}
      <PlantDetailModal 
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
      />
    </div>
  );
}
