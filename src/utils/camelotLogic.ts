import { CamelotKeyInfo, CompatibilityType } from '../types';

// Musical key to Camelot key mapping
const musicalToCamelot: Record<string, CamelotKeyInfo> = {
  // Major keys
  'C': { key: 'C', camelotKey: '8B', number: 8, letter: 'B', type: 'major' },
  'G': { key: 'G', camelotKey: '9B', number: 9, letter: 'B', type: 'major' },
  'D': { key: 'D', camelotKey: '10B', number: 10, letter: 'B', type: 'major' },
  'A': { key: 'A', camelotKey: '11B', number: 11, letter: 'B', type: 'major' },
  'E': { key: 'E', camelotKey: '12B', number: 12, letter: 'B', type: 'major' },
  'B': { key: 'B', camelotKey: '1B', number: 1, letter: 'B', type: 'major' },
  'F#': { key: 'F#', camelotKey: '2B', number: 2, letter: 'B', type: 'major' },
  'Gb': { key: 'Gb', camelotKey: '2B', number: 2, letter: 'B', type: 'major' },
  'Db': { key: 'Db', camelotKey: '3B', number: 3, letter: 'B', type: 'major' },
  'C#': { key: 'C#', camelotKey: '3B', number: 3, letter: 'B', type: 'major' },
  'Ab': { key: 'Ab', camelotKey: '4B', number: 4, letter: 'B', type: 'major' },
  'G#': { key: 'G#', camelotKey: '4B', number: 4, letter: 'B', type: 'major' },
  'Eb': { key: 'Eb', camelotKey: '5B', number: 5, letter: 'B', type: 'major' },
  'D#': { key: 'D#', camelotKey: '5B', number: 5, letter: 'B', type: 'major' },
  'Bb': { key: 'Bb', camelotKey: '6B', number: 6, letter: 'B', type: 'major' },
  'A#': { key: 'A#', camelotKey: '6B', number: 6, letter: 'B', type: 'major' },
  'F': { key: 'F', camelotKey: '7B', number: 7, letter: 'B', type: 'major' },
  
  // Minor keys
  'Am': { key: 'Am', camelotKey: '8A', number: 8, letter: 'A', type: 'minor' },
  'Em': { key: 'Em', camelotKey: '9A', number: 9, letter: 'A', type: 'minor' },
  'Bm': { key: 'Bm', camelotKey: '10A', number: 10, letter: 'A', type: 'minor' },
  'F#m': { key: 'F#m', camelotKey: '11A', number: 11, letter: 'A', type: 'minor' },
  'Gbm': { key: 'Gbm', camelotKey: '11A', number: 11, letter: 'A', type: 'minor' },
  'C#m': { key: 'C#m', camelotKey: '12A', number: 12, letter: 'A', type: 'minor' },
  'Dbm': { key: 'Dbm', camelotKey: '12A', number: 12, letter: 'A', type: 'minor' },
  'G#m': { key: 'G#m', camelotKey: '1A', number: 1, letter: 'A', type: 'minor' },
  'Abm': { key: 'Abm', camelotKey: '1A', number: 1, letter: 'A', type: 'minor' },
  'D#m': { key: 'D#m', camelotKey: '2A', number: 2, letter: 'A', type: 'minor' },
  'Ebm': { key: 'Ebm', camelotKey: '2A', number: 2, letter: 'A', type: 'minor' },
  'A#m': { key: 'A#m', camelotKey: '3A', number: 3, letter: 'A', type: 'minor' },
  'Bbm': { key: 'Bbm', camelotKey: '3A', number: 3, letter: 'A', type: 'minor' },
  'Fm': { key: 'Fm', camelotKey: '4A', number: 4, letter: 'A', type: 'minor' },
  'Cm': { key: 'Cm', camelotKey: '5A', number: 5, letter: 'A', type: 'minor' },
  'Gm': { key: 'Gm', camelotKey: '6A', number: 6, letter: 'A', type: 'minor' },
  'Dm': { key: 'Dm', camelotKey: '7A', number: 7, letter: 'A', type: 'minor' },
};

// Chromatic scale for pitch shifting
const chromaticScale = [
  'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'
];

// Convert any key format to Camelot notation
export const convertToCalemot = (key: string): string => {
  if (!key || key === '' || key.toLowerCase() === 'unknown') {
    return 'Unknown';
  }
  
  // Clean up the key string
  const cleanKey = key.trim()
    .replace(/\s+/g, '')  // Remove whitespace
    .replace(/maj(or)?/i, '')  // Remove "major" or "maj"
    .replace(/min(or)?/i, 'm'); // Convert "minor" or "min" to "m"
  
  // Check if the key is already in our mapping
  if (musicalToCamelot[cleanKey]) {
    return musicalToCamelot[cleanKey].camelotKey;
  }
  
  // Try to parse numeric Camelot format (e.g., "8A", "11B")
  const camelotRegex = /^(\d{1,2})([AB])$/i;
  const camelotMatch = cleanKey.match(camelotRegex);
  
  if (camelotMatch) {
    const number = parseInt(camelotMatch[1], 10);
    const letter = camelotMatch[2].toUpperCase() as 'A' | 'B';
    
    if (number >= 1 && number <= 12) {
      return `${number}${letter}`;
    }
  }
  
  return 'Unknown';
};

// Get full Camelot key information
export const getCamelotKeyInfo = (key: string): CamelotKeyInfo | null => {
  if (!key || key === 'Unknown') {
    return null;
  }
  
  if (musicalToCamelot[key]) {
    return musicalToCamelot[key];
  }
  
  const camelotKey = convertToCalemot(key);
  return musicalToCamelot[camelotKey] || null;
};

// Shift a musical key by a number of semitones
export const shiftKeyBySemitones = (key: string, semitones: number): string => {
  if (!key || key === 'Unknown') {
    return key;
  }
  
  const keyInfo = getCamelotKeyInfo(key);
  if (!keyInfo) {
    return key;
  }
  
  // Extract root note and mode
  const isMinor = keyInfo.type === 'minor';
  let rootNote = keyInfo.key.replace('m', '');
  
  // Find the root note's position in the chromatic scale
  let noteIndex = chromaticScale.findIndex(note => 
    note.split('/').some(n => n === rootNote)
  );
  
  if (noteIndex === -1) {
    return key;
  }
  
  // Calculate new position
  noteIndex = (noteIndex + semitones + 12) % 12;
  const newRoot = chromaticScale[noteIndex].split('/')[0];
  
  return isMinor ? `${newRoot}m` : newRoot;
};

// Determine compatibility between two Camelot keys
export const determineCompatibility = (
  referenceKey: string,
  trackKey: string
): { type: CompatibilityType; score: number } => {
  if (referenceKey === 'Unknown' || trackKey === 'Unknown') {
    return { type: 'incompatible', score: 0 };
  }
  
  const refInfo = getCamelotKeyInfo(referenceKey);
  const trackInfo = getCamelotKeyInfo(trackKey);
  
  if (!refInfo || !trackInfo) {
    return { type: 'incompatible', score: 0 };
  }
  
  // Exact match
  if (refInfo.camelotKey === trackInfo.camelotKey) {
    return { type: 'exact', score: 100 };
  }
  
  // Relative major/minor
  if (refInfo.number === trackInfo.number && refInfo.letter !== trackInfo.letter) {
    return refInfo.letter === 'A' 
      ? { type: 'relative-major', score: 95 }
      : { type: 'relative-minor', score: 95 };
  }
  
  // Perfect fourth/fifth
  const isOneStep = 
    Math.abs(refInfo.number - trackInfo.number) === 1 || 
    (refInfo.number === 12 && trackInfo.number === 1) ||
    (refInfo.number === 1 && trackInfo.number === 12);
  
  if (isOneStep && refInfo.letter === trackInfo.letter) {
    const isClockwise = 
      (trackInfo.number > refInfo.number && !(refInfo.number === 1 && trackInfo.number === 12)) ||
      (refInfo.number === 12 && trackInfo.number === 1);
    
    return isClockwise
      ? { type: 'perfect-fifth', score: 90 }
      : { type: 'perfect-fourth', score: 90 };
  }
  
  // Energy changes
  if (isOneStep && refInfo.letter !== trackInfo.letter) {
    const isEnergyBoost = 
      (refInfo.letter === 'A' && trackInfo.letter === 'B') ||
      (refInfo.letter === 'B' && trackInfo.number > refInfo.number);
    
    return isEnergyBoost
      ? { type: 'energy-boost', score: 85 }
      : { type: 'energy-drop', score: 85 };
  }
  
  // Other compatible moves
  const isTwoSteps = Math.abs(refInfo.number - trackInfo.number) === 2;
  if (isTwoSteps && refInfo.letter === trackInfo.letter) {
    return { type: 'compatible', score: 80 };
  }
  
  return { type: 'incompatible', score: 0 };
};