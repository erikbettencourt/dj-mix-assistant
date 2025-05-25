export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  camelotKey?: string;
}

export type CompatibilityType = 
  | 'native'           // Same key or adjacent in Camelot wheel
  | 'diagonal'         // Diagonal blend (+1 and mode switch)
  | 'energy'          // Energy transition (±7 steps)
  | 'transposed'      // Compatible after transposing selected track
  | 'incompatible';   // Not compatible by any method

export interface CompatibilityDetails {
  type: CompatibilityType;
  semitoneShift: number;  // Semitone shift required (if any)
  bpmAdjustment: number;  // BPM adjustment percentage
  description: string;    // Human readable explanation
  score: number;         // Compatibility score (0-100)
}

export interface CompatibleTrack extends Track {
  originalKey: string;
  originalBpm: number;
  adjustedBpm: number;
  shiftedKey: string;
  shiftedCamelotKey: string;
  compatibility: CompatibilityDetails;
}

export interface CamelotKeyInfo {
  key: string;
  camelotKey: string;
  number: number;
  letter: 'A' | 'B';
  type: 'major' | 'minor';
}

export interface CompatibilityGroup {
  title: string;
  icon: string;
  description: string;
  tracks: CompatibleTrack[];
}