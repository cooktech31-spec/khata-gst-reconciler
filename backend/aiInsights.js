// =====================================================================
// supabaseAuth.js — JWT token verify karta hai
// Frontend se jo Bearer token aata hai, Supabase se verify karte hain.
// User ka ID extract karke req.user mein daalta hai — baaki routes
// req.user.id se data isolate karte hain.
// =====================================================================
const { createClient } = require('@supabase/supabase-js');
const prisma = require('../db/prismaClient');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service key — sirf backend mein use hoti hai
);

module.exports = async function supabaseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Login karke dubara try karo' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Session expire ho gaya — dobara login karo' });
    }

    // User ko apne DB mein bhi track karte hain (first login pe create hota hai)
    await prisma.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email: user.email },
      update: { email: user.email },
    });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
