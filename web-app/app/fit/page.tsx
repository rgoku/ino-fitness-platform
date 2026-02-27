'use client';

import React, { useState } from 'react';
import HomeScreen from '@/components/screens/HomeScreen';
import RemindersScreen from '@/components/screens/RemindersScreen';
import DietScreen from '@/components/screens/DietScreen';
import ProgressScreen from '@/components/screens/ProgressScreen';
import ChatScreen from '@/components/screens/ChatScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import TabBar from '@/components/TabBar';

/**
 * INÖ Fit — client-facing fitness app (tabs).
 * Available at /fit. Main site (/) is INÖ Platform landing for coaches.
 */
export default function FitAppPage() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'reminders':
        return <RemindersScreen />;
      case 'diet':
        return <DietScreen />;
      case 'progress':
        return <ProgressScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-hidden">{renderScreen()}</div>
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
