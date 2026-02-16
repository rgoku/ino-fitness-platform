import React from 'react';

interface TabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabBar({ activeTab, setActiveTab }: TabBarProps) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'reminders', icon: '🔔', label: 'Reminders' },
    { id: 'diet', icon: '🥗', label: 'Diet' },
    { id: 'progress', icon: '📊', label: 'Progress' },
    { id: 'chat', icon: '💬', label: 'Coach' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="flex bg-white border-t border-gray-200 shadow-lg">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex flex-col items-center py-3 transition-colors ${
            activeTab === tab.id
              ? 'text-blue-500 border-t-2 border-blue-500'
              : 'text-gray-500'
          }`}
        >
          <span className="text-2xl mb-1">{tab.icon}</span>
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
