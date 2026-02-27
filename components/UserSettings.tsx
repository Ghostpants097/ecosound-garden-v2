'use client';

import { useState, useEffect } from 'react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  temperatureUnit: 'celsius' | 'fahrenheit';
  notifications: {
    wateringReminders: boolean;
    criticalAlerts: boolean;
    dailySummary: boolean;
  };
  language: string;
  autoExport: boolean;
  dataRetention: 'week' | 'month' | 'year' | 'unlimited';
}

export default function UserSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'auto',
    temperatureUnit: 'celsius',
    notifications: {
      wateringReminders: true,
      criticalAlerts: true,
      dailySummary: false,
    },
    language: 'en',
    autoExport: false,
    dataRetention: 'month',
  });

  useEffect(() => {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    alert('Settings saved successfully');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-all"
        title="Settings"
      >
        ⚙
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Settings</h2>
              <button onClick={() => setIsOpen(false)} className="text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Appearance</label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              {/* Temperature Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Temperature Unit</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="celsius"
                      checked={preferences.temperatureUnit === 'celsius'}
                      onChange={(e) => setPreferences({ ...preferences, temperatureUnit: e.target.value as any })}
                    />
                    <span className="text-gray-700">Celsius (°C)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="fahrenheit"
                      checked={preferences.temperatureUnit === 'fahrenheit'}
                      onChange={(e) => setPreferences({ ...preferences, temperatureUnit: e.target.value as any })}
                    />
                    <span className="text-gray-700">Fahrenheit (°F)</span>
                  </label>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Notifications</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.wateringReminders}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, wateringReminders: e.target.checked }
                      })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-gray-700">Watering Reminders</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.criticalAlerts}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, criticalAlerts: e.target.checked }
                      })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-gray-700">Critical Alerts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.dailySummary}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, dailySummary: e.target.checked }
                      })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-gray-700">Daily Summary</span>
                  </label>
                </div>
              </div>

              {/* Data Retention */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Data Retention</label>
                <select
                  value={preferences.dataRetention}
                  onChange={(e) => setPreferences({ ...preferences, dataRetention: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                >
                  <option value="week">1 Week</option>
                  <option value="month">1 Month</option>
                  <option value="year">1 Year</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
