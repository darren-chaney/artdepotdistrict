// Art Depot District — Cloud Functions
// Matches 797 Distillery pattern

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
setGlobalOptions({ region: "us-central1" });

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

// ── Chat Proxy ────────────────────────────────────────────
exports.chat = onRequest(
  { secrets: [ANTHROPIC_API_KEY], cors: true },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { messages = [] } = req.body;
    if (!messages.length) return res.status(400).json({ error: "No messages" });

    const db = getFirestore();

    // Pull live data to ground the AI
    let businesses = [];
    let faqs       = [];

    try {
      const bizSnap = await db.collection("businesses").where("published", "==", true).get();
      businesses    = bizSnap.docs.map(d => {
        const b = d.data();
        return `${b.name} (${b.category||"business"}): ${b.summary||""} — ${b.address||""} — Hours: ${b.hours||"see website"} — Phone: ${b.phone||"N/A"} — Website: ${b.website||"N/A"}`;
      });

      const faqSnap = await db.collection("faqs").where("published", "==", true).get();
      faqs          = faqSnap.docs.map(d => {
        const f = d.data();
        return `Q: ${f.question}\nA: ${f.answer}`;
      });
    } catch (e) {
      console.error("Error loading district data:", e);
    }

    // Load depot days
    let depotInfo = "";
    try {
      const year    = new Date().getFullYear().toString();
      const ddSnap  = await db.doc(`depot_days/${year}`).get();
      if (ddSnap.exists) {
        const dd = ddSnap.data();
        depotInfo = `Depot Days ${dd.year||year}: ${dd.overview||""} Car show date: ${dd.carShowDate||"TBA"}. Vendors: ${(dd.vendors||[]).join(", ")||"TBA"}`;
      }
    } catch(e) { /* silent */ }

    // Load site config
    let siteInfo = "";
    try {
      const cfgSnap = await db.doc("site_config/main").get();
      if (cfgSnap.exists) {
        const c = cfgSnap.data();
        siteInfo = `District address: ${c.address||"Covington, TN"}. Phone: ${c.phone||"N/A"}.`;
      }
    } catch(e) { /* silent */ }

    const systemPrompt = `You are the friendly assistant for the Art Depot District in Covington, Tennessee. 
You help visitors learn about the district, its businesses, events, and the annual Depot Days festival including the car show.
Keep answers friendly, helpful, and concise. If you don't know something, say so and suggest they contact the district directly.
Stay on topic — only answer questions about the Art Depot District, its businesses, events, Depot Days, and the car show.
Do not answer unrelated questions about other topics.

DISTRICT INFO:
${siteInfo}

BUSINESSES IN THE DISTRICT:
${businesses.join("\n")}

DEPOT DAYS:
${depotInfo}

FREQUENTLY ASKED QUESTIONS:
${faqs.join("\n\n")}

HELPFUL NOTES:
- The district is also officially known as the Artesian Business District (city designation)
- Depot Days is the annual festival — the car show is part of it
- Car show pre-registration is free and available on the website
- All makes, models, and years are welcome at the car show
- Free parking is available throughout the district`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:  "POST",
        headers: {
          "Content-Type":      "application/json",
          "x-api-key":         ANTHROPIC_API_KEY.value(),
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system:     systemPrompt,
          messages:   messages.slice(-10), // last 10 for context
        }),
      });

      const data  = await response.json();
      const reply = data.content?.[0]?.text || "I'm not sure about that. Try contacting the district directly.";

      // Log to Firestore
      try {
        await db.collection("chat_logs").add({
          question:  messages[messages.length - 1]?.content || "",
          answer:    reply,
          timestamp: FieldValue.serverTimestamp(),
          sessionId: req.headers["x-session-id"] || "unknown",
        });
      } catch(e) { /* log silently */ }

      return res.json({ reply });
    } catch(e) {
      console.error("Anthropic API error:", e);
      return res.status(500).json({ reply: "Sorry, I'm having trouble right now. Please try again in a moment." });
    }
  }
);

// ── Car Show Notification (optional) ─────────────────────
// Called automatically when a new registration lands in Firestore
// Uncomment and configure if you want email notifications
//
// const { onDocumentCreated } = require("firebase-functions/v2/firestore");
// exports.carShowNotify = onDocumentCreated(
//   "car_show_registrations/{id}",
//   async (event) => {
//     const reg = event.data.data();
//     // TODO: use nodemailer or SendGrid to email admin
//     console.log("New car show registration:", reg.firstName, reg.lastName, reg.vehicleYear, reg.vehicleMake, reg.vehicleModel);
//   }
// );
