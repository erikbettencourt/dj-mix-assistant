import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

interface RecommendationRequest {
  key: string;
  bpm: number;
  genre?: string;
}

interface BeatportTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  bpm: number;
  key: { standard: string };
  price: { value: number };
  images: { small: string };
  preview: { mp3: string };
  genres: Array<{ name: string }>;
  sub_genres: Array<{ name: string }>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const BEATPORT_API_KEY = Deno.env.get('BEATPORT_API_KEY') ?? '';
const BEATPORT_API_URL = 'https://api.beatport.com/v4/catalog/tracks';

async function fetchBeatportTracks(key: string, bpm: number): Promise<BeatportTrack[]> {
  // Calculate BPM range (±8%)
  const minBpm = Math.floor(bpm * 0.92);
  const maxBpm = Math.ceil(bpm * 1.08);

  const params = new URLSearchParams({
    key: key,
    bpm_from: minBpm.toString(),
    bpm_to: maxBpm.toString(),
    per_page: '6',
    sort: 'popularity'
  });

  const response = await fetch(`${BEATPORT_API_URL}?${params}`, {
    headers: {
      'Authorization': `Bearer ${BEATPORT_API_KEY}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from Beatport API');
  }

  const data = await response.json();
  return data.results;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { key, bpm } = await req.json() as RecommendationRequest;

    // Fetch tracks from Beatport
    const beatportTracks = await fetchBeatportTracks(key, bpm);

    // Transform Beatport tracks to our format
    const recommendations = beatportTracks.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      bpm: track.bpm,
      key: track.key.standard,
      price: track.price.value,
      purchase_url: `https://www.beatport.com/track/${track.id}`,
      preview_url: track.preview.mp3,
      genre: track.genres[0]?.name,
      sub_genre: track.sub_genres[0]?.name
    }));

    return new Response(JSON.stringify(recommendations), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error:', error);
    
    // Fallback to database if Beatport API fails
    try {
      const { key, bpm } = await req.json() as RecommendationRequest;
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const bpmRange = {
        min: bpm * 0.92,
        max: bpm * 1.08,
      };

      const { data: recommendations, error: dbError } = await supabase
        .from('tracks')
        .select('*')
        .eq('key', key)
        .gte('bpm', bpmRange.min)
        .lte('bpm', bpmRange.max)
        .limit(6);

      if (dbError) throw dbError;

      return new Response(JSON.stringify(recommendations), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (fallbackError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch recommendations',
        details: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
});