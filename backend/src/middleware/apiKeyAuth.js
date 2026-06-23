// =====================================================================
// apiKeyAuth.js — simple shared-secret protection
// =====================================================================
// Yeh ek single-user tool hai (tere apne business ke liye), isliye
// poora login/signup system banana overkill hai. Bas ek API_KEY env
// variable set kar dena, aur frontend usi key ko har request ke saath
// bhejega.
//
// AGAR AAGE CHALKE ISKO MULTI-USER SAAS BANANA HO (doosre sellers ko
// bhi bechna ho), tab is file ko Supabase Auth se replace karna —
// SETUP.md mein "Scaling to multi-tenant" section mein steps diye hain.
// =====================================================================

function apiKeyAuth(req, res, next) {
  const providedKey = req.headers["x-api-key"];
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    console.warn("WARNING: API_KEY env variable set nahi hai — auth disabled hai. Production mein zaroor set karo.");
    return next();
  }

  if (providedKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized — invalid ya missing API key." });
  }

  next();
}

module.exports = { apiKeyAuth };
