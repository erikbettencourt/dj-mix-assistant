import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

interface RecommendationRequest {
  key: string;
  bpm: number;
  genre?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { key, bpm, genre } = await req.json() as RecommendationRequest;

    // Find tracks with similar BPM (within ±8%) and matching key
    const bpmRange = {
      min: bpm * 0.92, // -8%
      max: bpm * 1.08, // +8%
    };

    let query = supabase
      .from('tracks')
      .select('*')
      .gte('bpm', bpmRange.min)
      .lte('bpm', bpmRange.max)
      .eq('key', key)
      .limit(6);

    if (genre) {
      query = query.eq('genre', genre);
    }

    const { data: recommendations, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(recommendations), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});