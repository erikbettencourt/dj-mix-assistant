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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { key, bpm, genre } = await req.json() as RecommendationRequest;

    // Simulate API call to music service
    // In production, this would call real music APIs
    const recommendations = [
      {
        id: '1',
        title: 'Summer Nights',
        artist: 'DJ Example',
        bpm: bpm + 2,
        key: key,
        price: 1.99,
        purchaseUrl: 'https://example.com/track/1',
        previewUrl: 'https://example.com/preview/1'
      },
      {
        id: '2',
        title: 'Dancing in the Dark',
        artist: 'Producer Demo',
        bpm: bpm - 1,
        key: key,
        price: 2.99,
        purchaseUrl: 'https://example.com/track/2',
        previewUrl: 'https://example.com/preview/2'
      }
    ];

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