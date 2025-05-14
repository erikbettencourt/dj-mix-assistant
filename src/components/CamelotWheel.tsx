import React from 'react';
import { motion } from 'framer-motion';
import { CompatibleTrack, Track } from '../types';
import { getCamelotKeyInfo } from '../utils/camelotLogic';

interface CamelotWheelProps {
  referenceTrack: Track | null;
  compatibleTracks: CompatibleTrack[];
}

interface KeySegmentProps {
  camelotKey: string;
  rotation: number;
  isReference: boolean;
  compatibilityType: string | null;
  onClick: () => void;
}

const KeySegment: React.FC<KeySegmentProps> = ({
  camelotKey,
  rotation,
  isReference,
  compatibilityType,
  onClick,
}) => {
  let backgroundColor = 'bg-gray-800';
  let textColor = 'text-gray-400';
  let borderColor = 'border-gray-700';
  let scale = 1;
  
  if (isReference) {
    backgroundColor = 'bg-primary-600';
    textColor = 'text-white';
    borderColor = 'border-primary-500';
    scale = 1.1;
  } else if (compatibilityType) {
    switch (compatibilityType) {
      case 'exact':
        backgroundColor = 'bg-success-600';
        textColor = 'text-white';
        borderColor = 'border-success-500';
        scale = 1.05;
        break;
      case 'perfect-fifth':
      case 'perfect-fourth':
        backgroundColor = 'bg-success-700';
        textColor = 'text-white';
        borderColor = 'border-success-600';
        scale = 1.03;
        break;
      case 'relative-minor':
      case 'relative-major':
        backgroundColor = 'bg-accent-600';
        textColor = 'text-white';
        borderColor = 'border-accent-500';
        scale = 1.03;
        break;
      case 'energy-boost':
      case 'energy-drop':
        backgroundColor = 'bg-secondary-600';
        textColor = 'text-white';
        borderColor = 'border-secondary-500';
        scale = 1.02;
        break;
      case 'compatible':
        backgroundColor = 'bg-primary-800';
        textColor = 'text-primary-200';
        borderColor = 'border-primary-700';
        scale = 1.01;
        break;
      default:
        break;
    }
  }

  return (
    <motion.div
      className={`absolute flex items-center justify-center w-16 h-16 -ml-8 -mt-8 rounded-full border ${backgroundColor} ${textColor} ${borderColor} cursor-pointer transition-shadow duration-300 shadow-md hover:shadow-lg z-10`}
      style={{
        transform: `rotate(${rotation}deg) translate(120px) rotate(-${rotation}deg)`,
      }}
      whileHover={{ scale }}
      onClick={onClick}
    >
      {camelotKey}
    </motion.div>
  );
};

const CamelotWheel: React.FC<CamelotWheelProps> = ({ referenceTrack, compatibleTracks }) => {
  if (!referenceTrack) {
    return null;
  }

  const refCamelotKeyInfo = getCamelotKeyInfo(referenceTrack.key);
  
  if (!refCamelotKeyInfo) {
    return null;
  }

  // Create all 24 key positions (12 major, 12 minor)
  const camelotKeys = [
    // Minor keys (A)
    '1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A',
    // Major keys (B)
    '1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B',
  ];

  // Calculate the positions in a circle
  const keyPositions = camelotKeys.map((key, index) => {
    // We have 24 keys, so we distribute them evenly around the circle
    const rotation = (360 / 24) * index;
    
    // Check if this key matches the reference track
    const isReference = key === refCamelotKeyInfo.camelotKey;
    
    // Check if this key matches any compatible track
    const matchingTrack = compatibleTracks.find(track => track.shiftedCamelotKey === key);
    const compatibilityType = matchingTrack ? matchingTrack.compatibilityType : null;
    
    return { key, rotation, isReference, compatibilityType };
  });

  // Group by minor/major
  const minorKeys = keyPositions.filter(k => k.key.endsWith('A'));
  const majorKeys = keyPositions.filter(k => k.key.endsWith('B'));

  return (
    <motion.div
      className="relative w-full max-w-xl mx-auto my-8 aspect-square"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {/* Outer circle */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-700 bg-gray-900/50" />
      
      {/* Middle circle - divider between minor and major */}
      <div className="absolute inset-14 rounded-full border-2 border-gray-700" />

      {/* Center circle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center">
        <span className="text-xs text-gray-400 text-center">Camelot Wheel</span>
      </div>
      
      {/* Labels for inner (minor) and outer (major) rings */}
      <div className="absolute left-1/2 top-[15%] -translate-x-1/2 text-gray-400 text-xs font-medium">
        Minor (A)
      </div>
      <div className="absolute left-1/2 bottom-[15%] -translate-x-1/2 text-gray-400 text-xs font-medium">
        Major (B)
      </div>
      
      {/* Key positions */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 w-1 h-1">
          {/* Minor keys (inner ring) */}
          {minorKeys.map(({ key, rotation, isReference, compatibilityType }) => (
            <KeySegment
              key={key}
              camelotKey={key}
              rotation={rotation}
              isReference={isReference}
              compatibilityType={compatibilityType}
              onClick={() => {}}
            />
          ))}
          
          {/* Major keys (outer ring) */}
          {majorKeys.map(({ key, rotation, isReference, compatibilityType }) => (
            <KeySegment
              key={key}
              camelotKey={key}
              rotation={rotation}
              isReference={isReference}
              compatibilityType={compatibilityType}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CamelotWheel;