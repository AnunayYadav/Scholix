import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Marketplace API: Configuration missing');
    return res.status(500).json({ error: 'Database configuration missing on server.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch marketplace items and join seller profile username/avatar
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*, seller:profiles(username, avatar_url)')
      .eq('status', 'Available')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Sanitize results: Ensure no sensitive profiles data leaks
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
        seller: seller ? {
          username: seller.username || 'Nexus Scholar',
          avatar_url: seller.avatar_url
        } : null
      };
    });

    return res.status(200).json(sanitized);

  } catch (error: any) {
    console.error('Marketplace API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch marketplace items.' });
  }
}
