import { Track } from '../types';

export const parseXmlFile = (file: File): Promise<Track[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error('Failed to read file');
        }
        
        const xmlString = event.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        
        // Try to parse as plist first
        const plistTracks = parsePlistXml(xmlDoc);
        if (plistTracks.length > 0) {
          resolve(plistTracks);
          return;
        }
        
        // If not a plist, try other formats
        const tracks = parseGenericXml(xmlDoc);
        resolve(tracks);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Parse plist-style XML (iTunes/Music library format)
const parsePlistXml = (xmlDoc: Document): Track[] => {
  const tracks: Track[] = [];
  const dictElements = xmlDoc.getElementsByTagName('dict');
  
  // Find the main tracks dictionary
  let tracksDict: Element | null = null;
  for (const dict of Array.from(dictElements)) {
    const prevKey = dict.previousElementSibling;
    if (prevKey?.tagName === 'key' && prevKey.textContent === 'Tracks') {
      tracksDict = dict;
      break;
    }
  }
  
  if (!tracksDict) return tracks;
  
  // Process each track dictionary within the tracks section
  const trackDicts = tracksDict.getElementsByTagName('dict');
  for (const dict of Array.from(trackDicts)) {
    const keys = dict.getElementsByTagName('key');
    const trackData: { [key: string]: string | number } = {};
    
    for (const key of Array.from(keys)) {
      const keyName = key.textContent;
      if (!keyName) continue;
      
      // Get the next sibling element which contains the value
      let valueElement = key.nextElementSibling;
      if (!valueElement) continue;
      
      // Extract the value based on the element type
      let value: string | number | null = null;
      
      switch (valueElement.tagName.toLowerCase()) {
        case 'string':
          value = valueElement.textContent;
          break;
        case 'integer':
          value = parseInt(valueElement.textContent || '0', 10);
          break;
        case 'real':
          value = parseFloat(valueElement.textContent || '0');
          break;
      }
      
      if (value !== null) {
        trackData[keyName] = value;
      }
    }
    
    // Check if this dict contains track data
    if (trackData['Name'] && trackData['Artist']) {
      let key = 'Unknown';
      
      // Try to extract key from Comments field (e.g., "4A - Energy 8")
      if (typeof trackData['Comments'] === 'string') {
        const keyMatch = trackData['Comments'].match(/^(\d{1,2}[AB])/);
        if (keyMatch) {
          key = keyMatch[1];
        }
      }
      
      tracks.push({
        id: `track-${trackData['Track ID'] || Date.now()}-${Date.now()}`,
        title: String(trackData['Name']),
        artist: String(trackData['Artist']),
        bpm: typeof trackData['BPM'] === 'number' ? trackData['BPM'] : 0,
        key,
      });
    }
  }
  
  return tracks;
};

// Generic parser that tries to handle different XML formats
const parseGenericXml = (xmlDoc: Document): Track[] => {
  const tracks: Track[] = [];
  let trackElements: Element[] = [];
  
  // Try different XML formats
  // Rekordbox format
  const rekordboxTracks = xmlDoc.querySelectorAll('TRACK');
  if (rekordboxTracks.length > 0) {
    trackElements = Array.from(rekordboxTracks);
    return parseRekordboxTracks(trackElements);
  }
  
  // Traktor format
  const traktorTracks = xmlDoc.querySelectorAll('ENTRY');
  if (traktorTracks.length > 0) {
    trackElements = Array.from(traktorTracks);
    return parseTraktorTracks(trackElements);
  }
  
  // Serato format
  const seratoTracks = xmlDoc.querySelectorAll('track');
  if (seratoTracks.length > 0) {
    trackElements = Array.from(seratoTracks);
    return parseSeratoTracks(trackElements);
  }
  
  // VirtualDJ format
  const vdjTracks = xmlDoc.querySelectorAll('Song');
  if (vdjTracks.length > 0) {
    trackElements = Array.from(vdjTracks);
    return parseVirtualDJTracks(trackElements);
  }
  
  // If no known format is detected, try a more generic approach
  const allPossibleTracks = xmlDoc.querySelectorAll('*');
  for (const element of allPossibleTracks) {
    // Look for elements that might contain track information
    const hasTitle = element.querySelector('*[name="title"]') || 
                     element.hasAttribute('title') || 
                     element.querySelector('title');
    
    const hasArtist = element.querySelector('*[name="artist"]') || 
                      element.hasAttribute('artist') || 
                      element.querySelector('artist');
    
    if (hasTitle && hasArtist) {
      trackElements.push(element);
    }
  }
  
  // If we've found elements that might be tracks, try to extract data
  if (trackElements.length > 0) {
    return parseGenericTracks(trackElements);
  }
  
  throw new Error('Could not identify track information in the XML file');
};

const parseRekordboxTracks = (trackElements: Element[]): Track[] => {
  return trackElements.map((track, index) => {
    const title = track.getAttribute('Name') || track.getAttribute('title') || 'Unknown Title';
    const artist = track.getAttribute('Artist') || track.getAttribute('artist') || 'Unknown Artist';
    const bpmStr = track.getAttribute('Tempo') || track.getAttribute('bpm');
    const keyStr = track.getAttribute('Tonality') || track.getAttribute('key') || track.getAttribute('Key');
    
    const bpm = bpmStr ? parseFloat(bpmStr) : 0;
    
    return {
      id: `track-${index}-${Date.now()}`,
      title,
      artist,
      bpm,
      key: keyStr || 'Unknown',
    };
  });
};

const parseTraktorTracks = (trackElements: Element[]): Track[] => {
  return trackElements.map((track, index) => {
    const title = track.getAttribute('TITLE') || 'Unknown Title';
    const artist = track.getAttribute('ARTIST') || 'Unknown Artist';
    
    let bpm = 0;
    let key = 'Unknown';
    
    // Traktor stores some info in child elements
    const infoElement = track.querySelector('INFO');
    if (infoElement) {
      const bpmStr = infoElement.getAttribute('TEMPO');
      bpm = bpmStr ? parseFloat(bpmStr) : 0;
      key = infoElement.getAttribute('KEY') || key;
    }
    
    return {
      id: `track-${index}-${Date.now()}`,
      title,
      artist,
      bpm,
      key,
    };
  });
};

const parseSeratoTracks = (trackElements: Element[]): Track[] => {
  return trackElements.map((track, index) => {
    const titleElement = track.querySelector('title');
    const artistElement = track.querySelector('artist');
    const bpmElement = track.querySelector('bpm');
    const keyElement = track.querySelector('key');
    
    const title = titleElement ? titleElement.textContent || 'Unknown Title' : 'Unknown Title';
    const artist = artistElement ? artistElement.textContent || 'Unknown Artist' : 'Unknown Artist';
    const bpmStr = bpmElement ? bpmElement.textContent : null;
    const key = keyElement ? keyElement.textContent || 'Unknown' : 'Unknown';
    
    const bpm = bpmStr ? parseFloat(bpmStr) : 0;
    
    return {
      id: `track-${index}-${Date.now()}`,
      title,
      artist,
      bpm,
      key,
    };
  });
};

const parseVirtualDJTracks = (trackElements: Element[]): Track[] => {
  return trackElements.map((track, index) => {
    const title = track.getAttribute('title') || 'Unknown Title';
    const artist = track.getAttribute('author') || track.getAttribute('artist') || 'Unknown Artist';
    const bpmStr = track.getAttribute('bpm');
    const keyStr = track.getAttribute('songKey') || track.getAttribute('key');
    
    const bpm = bpmStr ? parseFloat(bpmStr) : 0;
    
    return {
      id: `track-${index}-${Date.now()}`,
      title,
      artist,
      bpm,
      key: keyStr || 'Unknown',
    };
  });
};

const parseGenericTracks = (trackElements: Element[]): Track[] => {
  return trackElements.map((track, index) => {
    // Try different attribute and child element combinations to find data
    let title = 'Unknown Title';
    let artist = 'Unknown Artist';
    let bpm = 0;
    let key = 'Unknown';
    
    // Check for attributes first
    for (const attr of Array.from(track.attributes)) {
      const attrName = attr.name.toLowerCase();
      const value = attr.value;
      
      if (attrName.includes('title') || attrName === 'name') {
        title = value;
      } else if (attrName.includes('artist') || attrName.includes('author')) {
        artist = value;
      } else if (attrName.includes('bpm') || attrName.includes('tempo')) {
        bpm = parseFloat(value) || 0;
      } else if (attrName.includes('key') || attrName.includes('tonality')) {
        key = value;
      }
    }
    
    // Check for child elements
    for (const child of Array.from(track.children)) {
      const tagName = child.tagName.toLowerCase();
      const value = child.textContent || '';
      
      if (tagName.includes('title') || tagName === 'name') {
        title = value;
      } else if (tagName.includes('artist') || tagName.includes('author')) {
        artist = value;
      } else if (tagName.includes('bpm') || tagName.includes('tempo')) {
        bpm = parseFloat(value) || 0;
      } else if (tagName.includes('key') || tagName.includes('tonality')) {
        key = value;
      }
    }
    
    return {
      id: `track-${index}-${Date.now()}`,
      title,
      artist,
      bpm,
      key,
    };
  });
};