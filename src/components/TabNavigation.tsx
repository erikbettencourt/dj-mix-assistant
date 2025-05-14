import React from 'react';
import { BarChart2, Music2 } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'analysis' | 'key-shifting';
  onTabChange: (tab: 'analysis' | 'key-shifting') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
      <button
        onClick={() => onTabChange('analysis')}
        className={`
          flex items-center px-4 py-2 rounded-md transition-colors duration-200
          ${activeTab === 'analysis' 
            ? 'bg-primary-600 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-800'}
        `}
      >
        <BarChart2 size={18} className="mr-2" />
        <span>Song Analysis</span>
      </button>
      <button
        onClick={() => onTabChange('key-shifting')}
        className={`
          flex items-center px-4 py-2 rounded-md transition-colors duration-200
          ${activeTab === 'key-shifting' 
            ? 'bg-primary-600 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-800'}
        `}
      >
        <Music2 size={18} className="mr-2" />
        <span>BPM-Aware Key Shifting</span>
      </button>
    </div>
  );
};

export default TabNavigation;