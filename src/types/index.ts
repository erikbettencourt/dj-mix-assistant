export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  camelotKey?: string;
}

export interface CompatibleTrack extends Track {
  originalKey: string;
  adjustedBpm: number;
  shiftedKey: string;
  shiftedCamelotKey: string;
  compatibilityType: CompatibilityType;
  compatibilityScore: number;
}

export type CompatibilityType = 
  | 'exact'
  | 'perfect-fifth'
  | 'perfect-fourth'
  | 'relative-minor'
  | 'relative-major'
  | 'energy-boost'
  | 'energy-drop'
  | 'compatible'
  | 'incompatible';

export interface CamelotKeyInfo {
  key: string;
  camelotKey: string;
  number: number;
  letter: 'A' | 'B';
  type: 'major' | 'minor';
}

export type FilterOption = 'all' | 'exact' | 'energy-change' | 'compatible' | 'relatives';