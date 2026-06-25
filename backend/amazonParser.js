// =====================================================================
// aiInsights.js — Claude API se Hinglish mein human-readable summary
// =====================================================================
// Yeh wahi AI layer hai jo is tool ko competitors (gstr1calculator.in,
// okaygst.com waghera) se alag banata hai — woh sab sirf Excel/JSON
// nikal dete hain, koi bhi tujhe seedhe seedhe shabdon mein nahi batata
// "kya galat hai aur kya karna hai". Yeh function woh gap bharta hai.
// =====================================================================

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateInsights(reconciliationResult, companyContext) {
  const { summary, flaggedItems, platformBreakdown } = reconciliationResult;

  // Hum poora raw data AI ko nahi bhejte — sirf computed summary bhejte hain.
  // Isse (a) tokens bachte hain (b) AI ko khud se calculation nahi karni
  // padti, woh sirf explain karta hai jo humara engine already nikal chuka hai.
  const condensedFlags = flaggedItems.slice(0, 25).map((f) => ({
    platform: f.platform,
    orderId: f.orderId,
    issues: f.flags.map((fl) => fl.type),
  }));

  const prompt = `Tu ek GST compliance assistant hai jo Indian e-commerce sellers ko unki monthly reconciliation samjhata hai. Neeche di gayi computed summary padhke, seller ke liye ek chhota, practical, Hinglish (Hindi-English mix, Roman script) summary likh — jaisa koi knowledgeable dost samjhaye, formal CA-language bilkul nahi.

Company: ${companyContext.legalName} (GSTIN: ${companyContext.gstin})

Summary:
${JSON.stringify(summary, null, 2)}

Platform-wise breakdown:
${JSON.stringify(platformBreakdown, null, 2)}

Top data-quality issues (max 25 shown):
${JSON.stringify(condensedFlags, null, 2)}

Apna jawab is structure mein de (plain text, no markdown headers):
1. Pehle 2-3 line mein overall picture (kitna sales hua, TCS match hua ya nahi)
2. Sabse zaroori 3-4 action items, priority order mein, har ek ek line mein
3. Agar TCS mismatch hai, uska possible reason bata (returns, ya koi platform ne kam TCS report kiya)

Bahut lamba mat likh — max 150 words, seedhi practical baat.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock ? textBlock.text : null;
  } catch (err) {
    console.error("AI insight generation failed:", err.message);
    // AI fail ho jaaye tab bhi tool kaam karta rahe — graceful fallback
    return buildFallbackInsight(summary);
  }
}

function buildFallbackInsight(summary) {
  const lines = [
    `Is period mein total ${summary.totalOrders} orders deliver hue, taxable value ₹${summary.totalTaxableValue} ka.`,
  ];
  if (summary.tcsMismatch) {
    lines.push(
      `TCS mismatch mila hai: expected ₹${summary.expectedTcs} tha, platforms ne total ₹${summary.reportedTcs} report kiya — difference ₹${Math.abs(summary.tcsDiff)} ka hai. Returns/cancellations ki wajah se ho sakta hai, ek baar GSTR-2A se cross-check kar lena.`
    );
  }
  if (summary.mismatchCount > 0) {
    lines.push(`${summary.mismatchCount} orders mein data-quality issues mile hain (missing HSN, purana slab rate, ya duplicate) — neeche flagged items list dekho.`);
  }
  return lines.join(" ");
}

module.exports = { generateInsights };
