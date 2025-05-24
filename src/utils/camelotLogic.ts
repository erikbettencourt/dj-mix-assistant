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
  
  // Open key format (already in Camelot notation)
  '1A': { key: 'G#m/Abm', camelotKey: '1A', number: 1, letter: 'A', type: 'minor' },
  '2A': { key: 'D#m/Ebm', camelotKey: '2A', number: 2, letter: 'A', type: 'minor' },
  '3A': { key: 'A#m/Bbm', camelotKey: '3A', number: 3, letter: 'A', type: 'minor' },
  '4A': { key: 'Fm', camelotKey: '4A', number: 4, letter: 'A', type: 'minor' },
  '5A': { key: 'Cm', camelotKey: '5A', number: 5, letter: 'A', type: 'minor' },
  '6A': { key: 'Gm', camelotKey: '6A', number: 6, letter: 'A', type: 'minor' },
  '7A': { key: 'Dm', camelotKey: '7A', number: 7, letter: 'A', type: 'minor' },
  '8A': { key: 'Am', camelotKey: '8A', number: 8, letter: 'A', type: 'minor' },
  '9A': { key: 'Em', camelotKey: '9A', number: 9, letter: 'A', type: 'minor' },
  '10A': { key: 'Bm', camelotKey: '10A', number: 10, letter: 'A', type: 'minor' },
  '11A': { key: 'F#m/Gbm', camelotKey: '11A', number: 11, letter: 'A', type: 'minor' },
  '12A': { key: 'C#m/Dbm', camelotKey: '12A', number: 12, letter: 'A', type: 'minor' },
  '1B': { key: 'B', camelotKey: '1B', number: 1, letter: 'B', type: 'major' },
  '2B': { key: 'F#/Gb', camelotKey: '2B', number: 2, letter: 'B', type: 'major' },
  '3B': { key: 'C#/Db', camelotKey: '3B', number: 3, letter: 'B', type: 'major' },
  '4B': { key: 'G#/Ab', camelotKey: '4B', number: 4, letter: 'B', type: 'major' },
  '5B': { key: 'D#/Eb', camelotKey: '5B', number: 5, letter: 'B', type: 'major' },
  '6B': { key: 'A#/Bb', camelotKey: '6B', number: 6, letter: 'B', type: 'major' },
  '7B': { key: 'F', camelotKey: '7B', number: 7, letter: 'B', type: 'major' },
  '8B': { key: 'C', camelotKey: '8B', number: 8, letter: 'B', type: 'major' },
  '9B': { key: 'G', camelotKey: '9B', number: 9, letter: 'B', type: 'major' },
  '10B': { key: 'D', camelotKey: '10B', number: 10, letter: 'B', type: 'major' },
  '11B': { key: 'A', camelotKey: '11B', number: 11, letter: 'B', type: 'major' },
  '12B': { key: 'E', camelotKey: '12B', number: 12, letter: 'B', type: 'major' },
};

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
    
    // Validate the Camelot number is between 1 and 12
    if (number >= 1 && number <= 12) {
      return `${number}${letter}`;
    }
  }
  
  // Handle other notations or return unknown if not recognized
  return 'Unknown';
};

// Get full Camelot key information
export const getCamelotKeyInfo = (key: string): CamelotKeyInfo | null => {
  if (!key || key === 'Unknown') {
    return null;
  }
  
  // If it's already a Camelot key, look it up directly
  if (musicalToCamelot[key]) {
    return musicalToCamelot[key];
  }
  
  // Convert to Camelot and then get the info
  const camelotKey = convertToCalemot(key);
  
  // Return the info for the Camelot key
  return musicalToCamelot[camelotKey] || null;
};

// Calculate key shift based on semitone change
export const calculateKeyShift = (key: string, semitoneShift: number): string => {
  if (key === 'Unknown' || semitoneShift === 0) {
    return key;
  }

  const keyInfo = getCamelotKeyInfo(key);
  if (!keyInfo) {
    return key;
  }

  // Calculate new position in Camelot wheel
  let newNumber = keyInfo.number;
  const direction = semitoneShift > 0 ? 1 : -1;

  // Each semitone is equivalent to moving 7 steps in the Camelot wheel
  for (let i = 0; i < Math.abs(semitoneShift); i++) {
    newNumber = ((newNumber + (direction * 7) - 1 + 12) % 12) + 1;
  }

  const newCamelotKey = `${newNumber}${keyInfo.letter}`;

  // Find the matching musical key
  for (const [key, info] of Object.entries(musicalToCamelot)) {
    if (info.camelotKey === newCamelotKey) {
      return key;
    }
  }

  return key;
};

// Helper function to normalize Camelot number
const normalizeCamelotNumber = (num: number): number => {
  if (num <= 0) return num + 12;
  if (num > 12) return num - 12;
  return num;
};

// Determine compatibility between two Camelot keys
export const determineCompatibility = (
  referenceKey: string,
  trackKey: string
) => {
  if (referenceKey === 'Unknown' || trackKey === 'Unknown') {
    return { type: 'incompatible' as CompatibilityType, description: 'Incompatible', score: 0 };
  }

  const refInfo = getCamelotKeyInfo(referenceKey);
  const trackInfo = getCamelotKeyInfo(trackKey);

  if (!refInfo || !trackInfo) {
    return { type: 'incompatible' as CompatibilityType, description: 'Incompatible', score: 0 };
  }

  // Exact match
  if (refInfo.camelotKey === trackInfo.camelotKey) {
    return { type: 'exact' as CompatibilityType, description: 'Perfect Match', score: 100 };
  }

  // Adjacent keys (perfect fifth/fourth)
  if (refInfo.letter === trackInfo.letter) {
    const diff = Math.abs(refInfo.number - trackInfo.number);
    if (diff === 1 || diff === 11) {
      return { type: 'adjacent' as CompatibilityType, description: 'Perfect Fifth/Fourth', score: 90 };
    }
  }

  // Relative major/minor
  if (refInfo.number === trackInfo.number && refInfo.letter !== trackInfo.letter) {
    return { type: 'relative' as CompatibilityType, description: 'Relative Major/Minor', score: 85 };
  }

  return { type: 'incompatible' as CompatibilityType, description: 'Incompatible', score: 0 };
};