
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // CORS Headers for secure cross-origin streaming
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing protocol path parameter." });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Use Service Role Key for server-side bypass of storage restrictions
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Gateway configuration failure: Environment handshake failed." });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the file directly as a blob/stream
    const { data, error } = await supabase.storage.from('nexus-documents').download(path);

    if (error) {
      console.error("Storage download error:", error);
      return res.status(404).json({ error: "File not found in secure vault." });
    }

    // Set appropriate headers to hide origin and prevent direct browser download/exec
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Convert Blob to Buffer and send
    const buffer = Buffer.from(await data.arrayBuffer());
    res.status(200).send(buffer);

  } catch (err: any) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Secure Tunneling Interrupted." });
  }
}
