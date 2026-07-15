import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  const { action } = req.query;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Server configuration missing.' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    if (action === 'roommates') {
      if (req.method !== 'GET') return res.status(405).end();
      const { data, error } = await supabase
        .from('roommate_requests')
        .select('*, user:profiles(username, avatar_url)')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const sanitized = (data || []).map((row: any) => {
        const user = Array.isArray(row.user) ? row.user[0] : row.user;
        return {
          id: row.id,
          user_id: row.user_id,
          location: row.location,
          budget: row.budget,
          preferences: row.preferences,
          gender_preference: row.gender_preference,
          status: row.status,
          created_at: row.created_at,
          description: row.description,
          contact_info: row.contact_info,
          user: user ? { username: user.username || 'Nexus Scholar', avatar_url: user.avatar_url } : null
        };
      });
      return res.status(200).json(sanitized);
    } 
    
    if (action === 'marketplace') {
      if (req.method !== 'GET') return res.status(405).end();
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*, seller:profiles(username, avatar_url)')
        .eq('status', 'Available')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const sanitized = (data || []).map((row: any) => {
        const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
        return {
          id: row.id,
          seller_id: row.seller_id,
          title: row.title,
          description: row.description,
          price: row.price,
          category: row.category,
          condition: row.condition,
          images: row.images,
          status: row.status,
          created_at: row.created_at,
          seller_phone: row.seller_phone,
          location: row.location,
          seller: seller ? { username: seller.username || 'Nexus Scholar', avatar_url: seller.avatar_url } : null
        };
      });
      return res.status(200).json(sanitized);
    } 
    
    if (action === 'timetables') {
      if (req.method !== 'GET') return res.status(405).end();
      const { data, error } = await supabase
        .from('community_timetables')
        .select('*, owner:profiles(username, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const sanitized = (data || []).map((row: any) => {
        const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
        return {
          id: row.id,
          owner_id: row.owner_id,
          timetable_name: row.timetable_name,
          timetable_data: row.timetable_data,
          is_public: row.is_public,
          created_at: row.created_at,
          owner: owner ? { username: owner.username || 'Nexus Scholar', avatar_url: owner.avatar_url } : null
        };
      });
      return res.status(200).json(sanitized);
    } 
    
    if (action === 'site-stats') {
      if (req.method !== 'GET') return res.status(405).end();
      
      const [regRes, metricsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('system_metrics').select('metric_key, count').eq('metric_type', 'site')
      ]);

      const registered = regRes.count || 0;
      const metrics = metricsRes.data || [];
      
      const viewsMetric = metrics.find(m => m.metric_key === 'views');
      const visitsMetric = metrics.find(m => m.metric_key === 'visits');

      const rawHits = viewsMetric ? Number(viewsMetric.count) : 0;
      const visitors = visitsMetric ? Number(visitsMetric.count) : 0;

      const pageMetricsRes = await supabase.from('system_metrics').select('count').eq('metric_type', 'page');
      const totalViews = (pageMetricsRes.data || []).reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);

      return res.status(200).json({ registered, visitors, rawHits, totalViews });
    }

    if (action === 'admin-profiles') {
      if (req.method !== 'GET') return res.status(405).end();
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return res.status(401).json({ error: "Invalid session" });

      const { data: adminCheck } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (!adminCheck || !adminCheck.is_admin) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_admin, total_xp, level, private:user_private_info(email, registration_number)')
        .order('username', { ascending: true });

      if (error) throw error;

      const result = (data || []).map((p: any) => {
        const privateInfo = Array.isArray(p.private) ? p.private[0] : p.private;
        return {
          id: p.id,
          username: p.username,
          avatar_url: p.avatar_url,
          is_admin: p.is_admin,
          total_xp: p.total_xp,
          level: p.level,
          email: privateInfo?.email || null,
          registration_number: privateInfo?.registration_number || null
        };
      });
      return res.status(200).json(result);
    }

    if (action === 'youtube-proxy') {
      if (req.method !== 'GET') return res.status(405).end();
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required.' });
      }

      try {
        const decodedUrl = decodeURIComponent(url as string);
        const parsedUrl = new URL(decodedUrl);
        const domain = parsedUrl.hostname;
        const pathname = parsedUrl.pathname;

        const isYoutubeSearch = (domain === 'youtube.com' || domain === 'www.youtube.com') && pathname === '/results';
        const isInvidiousSearch = (domain.includes('invidious') || domain.endsWith('.icu') || domain.endsWith('.coffee') || domain.endsWith('.lt') || domain.endsWith('.to')) && pathname === '/api/v1/search';
        const isInvidiousVideoDetails = (domain.includes('invidious') || domain.endsWith('.icu') || domain.endsWith('.coffee') || domain.endsWith('.lt') || domain.endsWith('.to')) && pathname.startsWith('/api/v1/videos/');

        if (!isYoutubeSearch && !isInvidiousSearch && !isInvidiousVideoDetails) {
          return res.status(400).json({ error: 'Domain or path not allowed.' });
        }

        const headers: HeadersInit = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        };

        const response = await fetch(decodedUrl, { headers });
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          const data = await response.json();
          return res.status(response.status).json(data);
        } else {
          const text = await response.text();
          res.setHeader('Content-Type', contentType || 'text/plain');
          return res.status(response.status).send(text);
        }
      } catch (proxyErr: any) {
        console.error('YouTube Proxy Error:', proxyErr);
        return res.status(500).json({ error: 'Failed to proxy request.', details: proxyErr.message });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error: any) {
    console.error(`Gateway API [${action}] Error:`, error);
    return res.status(500).json({ error: 'Internal gateway error.' });
  }
}
