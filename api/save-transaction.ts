
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    paymentId, 
    orderId, 
    signature, 
    amount, 
    userId, 
    userEmail, 
    userUsername 
  } = req.body || {};

  if (!paymentId || !orderId || !signature) {
    return res.status(400).json({ error: 'Missing transaction identifiers' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing');
    return res.status(500).json({ error: 'Database configuration missing on server' });
  }

  try {
    // Insert the transaction into the database
    const response = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        amount: amount,
        user_id: userId,
        user_email: userEmail,
        user_username: userUsername,
        status: 'success',
        currency: 'INR'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Database Save Error:', data);
      return res.status(response.status).json({ error: 'Failed to save transaction to database' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during database sync' });
  }
}
