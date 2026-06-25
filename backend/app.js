// =====================================================================
// checkSubscription.js — Active subscription check karta hai
// Agar user ne subscribe nahi kiya ya subscription expire ho gaya toh
// 403 return karta hai. supabaseAuth ke baad use karo.
// =====================================================================
const prisma = require('../db/prismaClient');

module.exports = async function checkSubscription(req, res, next) {
  try {
    const userId = req.user.id;

    const sub = await prisma.subscription.findUnique({ where: { userId } });

    if (!sub || sub.status !== 'active') {
      return res.status(403).json({
        error: 'SUBSCRIPTION_REQUIRED',
        message: 'Active subscription chahiye — pricing page pe jao',
      });
    }

    // Period end check
    if (sub.currentPeriodEnd && new Date() > new Date(sub.currentPeriodEnd)) {
      await prisma.subscription.update({
        where: { userId },
        data: { status: 'expired' },
      });
      return res.status(403).json({
        error: 'SUBSCRIPTION_EXPIRED',
        message: 'Subscription expire ho gaya — renew karo',
      });
    }

    req.subscription = sub;
    next();
  } catch (err) {
    console.error('Subscription check error:', err.message);
    res.status(500).json({ error: 'Subscription check failed' });
  }
};
