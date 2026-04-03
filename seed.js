// Art Depot District — Firestore Seeder
// Run once: node seed.js
// Seeds initial businesses, FAQs, site config, and Depot Days

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Point to your service account key JSON downloaded from Firebase Console
// Firebase Console → Project Settings → Service Accounts → Generate new private key
const serviceAccount = require("./service-account-key.json");

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  console.log("Seeding Art Depot District Firestore...\n");

  // ── Site Config ──────────────────────────────────────────
  await db.doc("site_config/main").set({
    districtName: "Art Depot District",
    address:      "Art Depot District\nCovington, TN 38019\nTipton County",
    phone:        "",
    heroTagline:  "Where creativity, community, and craft come together in the heart of Tipton County.",
    heroImage:    "",
    calendarId:   "",
    googleApiKey: "",
    socials: { facebook: "", instagram: "" },
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log("✓ site_config/main");

  // ── Depot Days ───────────────────────────────────────────
  const year = new Date().getFullYear().toString();
  await db.doc(`depot_days/${year}`).set({
    year,
    tagline:     "Covington's biggest celebration of art, community, food, and car culture.",
    overview:    "Depot Days is the Art Depot District's flagship annual festival, bringing together the Covington community for a weekend of art, music, food, local vendors, and the famous car show.",
    bannerImage: "",
    carShowDate: "Date TBA",
    carShowEntry:"Free pre-registration. Day-of details TBA.",
    vendors:     [],
    sponsors:    [],
    schedule:    [
      { time: "Morning", title: "Gates Open", description: "Festival grounds open to the public." },
      { time: "All Day",  title: "Car Show",  description: "Show your ride. All makes and models welcome." },
      { time: "All Day",  title: "Vendors",   description: "Food, craft, and art vendors throughout the district." },
    ],
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log(`✓ depot_days/${year}`);

  // ── Businesses ───────────────────────────────────────────
  const businesses = [
    {
      name:         "797 Distillery",
      slug:         "797-distillery",
      category:     "Food & Drink",
      summary:      "Handcrafted moonshines, vodka, and rum made right here in Covington, Tennessee.",
      description:  "797 Distillery produces small-batch spirits using locally sourced ingredients including corn grown in Burlison, TN. Their lineup includes Apple Pie Moonshine, Blue Razberry Moonshine, Peach Cobbler Moonshine, Whipped Cream Vodka, and White Rum.",
      address:      "425 E Pleasant Ave, Covington, TN",
      phone:        "",
      website:      "https://797distillery.com",
      hours:        "See website for current hours",
      heroImage:    "",
      districtPromo:"Visit us inside the Art Depot District — tastings available.",
      socials:      { Facebook: "https://facebook.com/797distillery", Instagram: "" },
      published:    true,
      featured:     true,
      createdAt:    FieldValue.serverTimestamp(),
      updatedAt:    FieldValue.serverTimestamp(),
    },
    {
      name:         "Liberty Vintage Art Studio",
      slug:         "liberty-vintage-art-studio",
      category:     "Art & Studio",
      summary:      "A creative art studio bringing fine art and vintage culture to the Art Depot District.",
      description:  "Liberty Vintage Art Studio is one of the anchor creative businesses in the district, offering art classes, studio space, and a gallery showcasing local artists.",
      address:      "Art Depot District, Covington, TN",
      phone:        "",
      website:      "",
      hours:        "",
      heroImage:    "",
      districtPromo:"",
      socials:      {},
      published:    true,
      featured:     true,
      createdAt:    FieldValue.serverTimestamp(),
      updatedAt:    FieldValue.serverTimestamp(),
    },
  ];

  for (const biz of businesses) {
    await db.collection("businesses").add(biz);
    console.log(`✓ businesses: ${biz.name}`);
  }

  // ── FAQs / AI Seeds ──────────────────────────────────────
  const faqs = [
    { question: "Where is the Art Depot District?", answer: "The Art Depot District is located in Covington, Tennessee — in Tipton County. It's the area officially rezoned by the city as the Artesian Business District.", category: "General", order: 1, published: true },
    { question: "What businesses are in the Art Depot District?", answer: "The district includes 797 Distillery, Liberty Vintage Art Studio, antique businesses, a seasonal farmers market, a restaurant, the University of Tennessee Extension office, and manufacturing businesses. Check the Businesses page for the full current list.", category: "Businesses", order: 2, published: true },
    { question: "What is Depot Days?", answer: "Depot Days is the Art Depot District's annual festival in Covington, TN. It features art, music, food vendors, and the famous car show. It's typically held each fall — check the Depot Days page for this year's date.", category: "Depot Days", order: 3, published: true },
    { question: "How do I register for the car show?", answer: "You can pre-register for the Depot Days Car Show for free on our website at the Car Show page. Fill out the form with your name, contact info, and vehicle details. All makes, models, and years are welcome.", category: "Car Show", order: 4, published: true },
    { question: "Is the car show free to enter?", answer: "Pre-registration for the car show is free. Check the car show page for any day-of entry details closer to the event.", category: "Car Show", order: 5, published: true },
    { question: "Where can I park?", answer: "Free parking is available throughout the Art Depot District. During Depot Days, additional overflow parking information will be posted on the Events and Visit pages.", category: "Visit / Directions", order: 6, published: true },
    { question: "What kind of spirits does 797 Distillery make?", answer: "797 Distillery makes handcrafted moonshines (Apple Pie, Blue Razberry, Peach Cobbler, Strawberry Lemonade), Whipped Cream Vodka, and White Rum. They use locally sourced ingredients including corn from Burlison, TN.", category: "Businesses", order: 7, published: true },
    { question: "Is the Art Depot District the same as the Artesian Business District?", answer: "Yes — they refer to the same area. The city of Covington officially rezoned the area as the Artesian Business District, but it is publicly known and marketed as the Art Depot District.", category: "General", order: 8, published: true },
    { question: "Is there a farmers market?", answer: "Yes, the district hosts a seasonal farmers market during the summer months. Check the Events page for current market dates and times.", category: "Events", order: 9, published: true },
    { question: "How do I get my business listed on the district website?", answer: "Contact us through the Contact page and let us know about your business. District admin will review and add you to the site.", category: "General", order: 10, published: true },
  ];

  for (const faq of faqs) {
    await db.collection("faqs").add({ ...faq, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    console.log(`✓ faq: ${faq.question.substring(0,50)}`);
  }

  console.log("\n✅ Seed complete. Art Depot District is ready.");
}

seed().catch(e => { console.error("Seed failed:", e); process.exit(1); });
