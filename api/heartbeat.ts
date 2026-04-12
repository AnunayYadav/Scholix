
export const config = {
  runtime: 'edge',
};

/**
 * Scholix Heartbeat
 * Triggered daily via Vercel Crons to prevent Supabase from pausing.
 */
export default async function handler() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Heartbeat failed: Environment parameters missing.');
    return new Response('Configuration missing', { status: 500 });
  }

  try {
    // Perform a minimal REST query to the Supabase PostgREST interface.
    // This triggers database activity without the overhead of the full SDK.
    const response = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return new Response('Scholix heartbeat successful: Activity registered.', { status: 200 });
    } else {
      const errorText = await response.text();
      console.error('Heartbeat rejected by registry:', errorText);
      return new Response('Activity signal rejected', { status: 502 });
    }
  } catch (error) {
    console.error('Heartbeat terminal error:', error);
    return new Response('Signal transmission failure', { status: 500 });
  }
}
