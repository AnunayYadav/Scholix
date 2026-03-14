
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { amount } = await req.json();

    if (!amount || isNaN(amount)) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay configuration missing on server' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Razorpay uses Basic Auth: base64(key_id:key_secret)
    const auth = btoa(`${keyId}:${keySecret}`);

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
      return new Response(JSON.stringify({ error: data.error?.description || 'Failed to create order' }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ ...data, keyId }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
