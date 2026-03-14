
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body || {};

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay keys missing in environment variables');
      return res.status(500).json({ error: 'Razorpay configuration missing on server' });
    }

    // Razorpay uses Basic Auth: base64(key_id:key_secret)
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // amount in subunits (paise)
        currency: 'INR',
        receipt: `receipt_nexus_${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Order Error:', data);
      return res.status(response.status).json({ error: data.error?.description || 'Failed to create order' });
    }

    return res.status(200).json({ ...data, keyId });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
