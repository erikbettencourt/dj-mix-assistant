export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  camelotKey?: string;
}

export type CompatibilityType = 
  | 'exact'               // Same key
  | 'adjacent'            // Next key in Camelot wheel
  | 'relative'            // Relative major/minor
  | 'pitch-shift-up'      // Compatible after shifting up
  | 'pitch-shift-down'    // Compatible after shifting down
  | 'bpm-match'          // Compatible when matching BPM without pitch lock
  | 'incompatible';      // Not compatible by any method

export interface CompatibilityDetails {
  type: CompatibilityType;
  semitoneShift: number;  // 0 for native compatibility, otherwise the shift required
  bpmAdjustment: number;  // Percentage change in BPM
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
  description: string;
  tracks: CompatibleTrack[];
}