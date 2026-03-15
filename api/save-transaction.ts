
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
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Environment Variables');
    return res.status(500).json({ error: 'Database configuration missing. Check SUPABASE_URL and SUPABASE_ANON_KEY.' });
  }

  try {
    console.log('Attempting to save transaction to Supabase:', paymentId);
    
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
        amount: Number(amount), // Ensure it's a number
        user_id: userId || null,
        user_email: userEmail || null,
        user_username: userUsername || null,
        status: 'success',
        currency: 'INR'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Supabase DB Error:', data);
      return res.status(response.status).json({ 
        error: 'Failed to save transaction to database',
        details: data
      });
    }

    console.log('Successfully saved transaction:', data[0]?.id);
    return res.status(200).json({ success: true, data: data[0] });
  } catch (error: any) {
    console.error('API Handler Exception:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during database sync' });
  }
}
