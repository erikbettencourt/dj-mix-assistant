import { Track, CompatibleTrack, CompatibilityType, CompatibilityDetails, CompatibilityGroup } from '../types';
import { calculateKeyShift, convertToCalemot, getCamelotKeyInfo, determineCompatibility } from './camelotLogic';

const MAX_BPM_ADJUSTMENT = 8; // Increased from 4 to 8% to allow more matches

export const findCompatibleTracks = (
  referenceTrack: Track,
  allTracks: Track[]
): CompatibleTrack[] => {
  if (!referenceTrack || !allTracks.length) {
    return [];
  }

  const refCamelotKey = referenceTrack.camelotKey || convertToCalemot(referenceTrack.key);
  const refKeyInfo = getCamelotKeyInfo(referenceTrack.key);

  if (!refKeyInfo) return [];

  return allTracks
    .filter(track => track.id !== referenceTrack.id)
    .flatMap(track => {
      const originalBpm = track.bpm;
      const bpmDiff = Math.abs(referenceTrack.bpm - track.bpm);
      const bpmAdjustmentPercent = (bpmDiff / track.bpm) * 100;
      
      // Skip if BPM difference is too large
      if (bpmAdjustmentPercent > MAX_BPM_ADJUSTMENT) {
        return [];
      }

      const bpmAdjustment = ((referenceTrack.bpm - track.bpm) / track.bpm) * 100;
      const trackCamelotKey = track.camelotKey || convertToCalemot(track.key);
      const trackKeyInfo = getCamelotKeyInfo(track.key);

      if (!trackKeyInfo) return [];

      const compatibleTracks: CompatibleTrack[] = [];

      // 1. Check Native Compatibility
      const nativeCompatibility = determineCompatibility(refCamelotKey, trackCamelotKey);
      if (nativeCompatibility.type === 'native') {
        compatibleTracks.push(createCompatibleTrack(track, {
          type: 'native',
          semitoneShift: 0,
          bpmAdjustment,
          description: nativeCompatibility.description,
          score: 100 - (Math.abs(bpmAdjustment) * 2)
        }, referenceTrack.bpm));
      }

      // 2. Check Diagonal Blend
      const diagonalCompatibility = checkDiagonalCompatibility(refKeyInfo, trackKeyInfo);
      if (diagonalCompatibility) {
        compatibleTracks.push(createCompatibleTrack(track, {
          type: 'diagonal',
          semitoneShift: 0,
          bpmAdjustment,
          description: diagonalCompatibility.description,
          score: 85 - (Math.abs(bpmAdjustment) * 2)
        }, referenceTrack.bpm));
      }

      // 3. Check Energy Transitions (±7 steps)
      const energyCompatibility = checkEnergyCompatibility(refKeyInfo, trackKeyInfo);
      if (energyCompatibility) {
        compatibleTracks.push(createCompatibleTrack(track, {
          type: 'energy',
          semitoneShift: energyCompatibility.semitoneShift,
          bpmAdjustment,
          description: energyCompatibility.description,
          score: 75 - (Math.abs(bpmAdjustment) * 2)
        }, referenceTrack.bpm));
      }

      // 4. Check Transposed Compatibility (±1 to ±3 semitones)
      for (let shift = -3; shift <= 3; shift++) {
        if (shift === 0) continue;

        const transposedKey = calculateKeyShift(refKeyInfo.key, shift);
        const transposedCamelotKey = convertToCalemot(transposedKey);
        const compatibility = determineCompatibility(transposedCamelotKey, trackCamelotKey);

        if (compatibility.type === 'native') {
          compatibleTracks.push(createCompatibleTrack(track, {
            type: 'transposed',
            semitoneShift: shift,
            bpmAdjustment,
            description: `Transpose ${Math.abs(shift)} semitone${Math.abs(shift) > 1 ? 's' : ''} ${shift > 0 ? 'up' : 'down'}`,
            score: 70 - (Math.abs(shift) * 5) - (Math.abs(bpmAdjustment) * 2)
          }, referenceTrack.bpm));
        }
      }

      return compatibleTracks;
    })
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
};

const createCompatibleTrack = (
  track: Track,
  compatibility: CompatibilityDetails,
  targetBpm: number
): CompatibleTrack => {
  const shiftedKey = calculateKeyShift(track.key, compatibility.semitoneShift);
  
  return {
    ...track,
    originalKey: track.key,
    originalBpm: track.bpm,
    adjustedBpm: targetBpm,
    shiftedKey,
    shiftedCamelotKey: convertToCalemot(shiftedKey),
    compatibility
  };
};

const checkDiagonalCompatibility = (
  refInfo: CamelotKeyInfo,
  trackInfo: CamelotKeyInfo
) => {
  // Check for +1 number and mode switch
  const numberDiff = ((trackInfo.number - refInfo.number) + 12) % 12;
  const modeSwitch = refInfo.letter !== trackInfo.letter;

  if ((numberDiff === 1 || numberDiff === 11) && modeSwitch) {
    return {
      description: `Diagonal Blend (${refInfo.camelotKey} → ${trackInfo.camelotKey})`
    };
  }

  return null;
};

const checkEnergyCompatibility = (
  refInfo: CamelotKeyInfo,
  trackInfo: CamelotKeyInfo
) => {
  // Check for ±7 steps (energy transitions)
  const numberDiff = ((trackInfo.number - refInfo.number) + 12) % 12;
  
  if (numberDiff === 7 && refInfo.letter === trackInfo.letter) {
    return {
      semitoneShift: 1,
      description: 'Energy Boost (+7 steps)'
    };
  } else if (numberDiff === 5 && refInfo.letter === trackInfo.letter) { // -7 steps = +5 steps in the other direction
    return {
      semitoneShift: -1,
      description: 'Energy Drop (-7 steps)'
    };
  }

  return null;
};

export const groupCompatibleTracks = (
  tracks: CompatibleTrack[]
): CompatibilityGroup[] => {
  const groups: CompatibilityGroup[] = [
    {
      title: "Native Compatible Tracks",
      icon: "target",
      description: "Perfect matches using standard Camelot wheel rules. These tracks will mix together harmonically with minimal risk of clashing notes. Includes exact key matches, adjacent keys (e.g., 8A → 7A or 9A), and relative major/minor pairs.",
      tracks: tracks.filter(t => t.compatibility.type === 'native')
    },
    {
      title: "Diagonal Blends",
      icon: "shuffle",
      description: "Creative transitions using diagonal movement on the Camelot wheel. These tracks move +1 position and switch between major/minor modes. While slightly outside traditional rules, they can work well when the melodies align.",
      tracks: tracks.filter(t => t.compatibility.type === 'diagonal')
    },
    {
      title: "Energy Transitions",
      icon: "zap",
      description: "Dramatic energy shifts using ±7 step movements. These tracks are not traditionally compatible but can create powerful transitions during breakdowns or when mixing instrumental sections. Use during builds, drops, or when intentionally changing the energy level.",
      tracks: tracks.filter(t => t.compatibility.type === 'energy')
    },
    {
      title: "Transposed Options",
      icon: "sliders",
      description: "Compatible matches when transposing the selected track by ±1 to ±3 semitones. These tracks become harmonically compatible after pitch shifting the reference track. Best used in DAWs or when performing with pitch control.",
      tracks: tracks.filter(t => t.compatibility.type === 'transposed')
    }
  ];

  // Sort tracks within each group by score
  groups.forEach(group => {
    group.tracks.sort((a, b) => {
      // First by compatibility score
      if (b.compatibility.score !== a.compatibility.score) {
        return b.compatibility.score - a.compatibility.score;
      }
      // Then by BPM adjustment
      return Math.abs(a.compatibility.bpmAdjustment) - Math.abs(b.compatibility.bpmAdjustment);
    });
  });

  // Remove empty groups
  return groups.filter(group => group.tracks.length > 0);
};