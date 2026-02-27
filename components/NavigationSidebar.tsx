'use client';

import { useState } from 'react';

export default function NavigationSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: '📊', label: 'Dashboard', section: 'dashboard' },
    { icon: '🌱', label: 'My Plants', section: 'plants' },
    { icon: '📈', label: 'Analytics', section: 'analytics' },
    { icon: '🔊', label: 'Acoustic Data', section: 'acoustic' },
    { icon: '🌡', label: 'Sensors', section: 'sensors' },
    { icon: '🎯', label: 'Plant Care', section: 'care' },
    { icon: '📚', label: 'Datasets', section: 'datasets' },
    { icon: '⚙', label: 'Settings', section: 'settings' },
    { icon: '📖', label: 'Help & Docs', section: 'help' },
  ];

  const handleScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-green-600 text-white p-2 rounded-lg"
        title="Menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-green-700 to-green-800 text-white shadow-lg transform transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-green-600">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🌿</div>
            <div>
              <h1 className="text-xl font-bold">EcoSound</h1>
              <p className="text-xs text-green-200">Garden Monitor</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.section}
              onClick={() => handleScroll(item.section)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-green-600 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-green-600 space-y-2 text-sm text-green-200">
          <p className="flex items-center justify-between">
            <span>Status:</span>
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </p>
          <p className="text-xs">Real-time plant monitoring</p>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
