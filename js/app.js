// Art Depot District — Main App JS

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, initializeFirestore, collection, getDocs, doc, getDoc, addDoc, query, where, orderBy, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Init ─────────────────────────────────────────────────
function getDB() {
  if (window.__ART_DEPOT_DB) return window.__ART_DEPOT_DB;
  const cfg = window.__ART_DEPOT_CONFIG;
  if (!cfg) { console.error('firebase-config.js not loaded'); return null; }
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  const db  = initializeFirestore(app, { experimentalForceLongPolling: true });
  window.__ART_DEPOT_DB = db;
  return db;
}

// ── Helpers ──────────────────────────────────────────────
export function formatDateParts(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    month: d.toLocaleDateString('en-US',{ month:'short' }).toUpperCase(),
    day:   d.getDate(),
  };
}

// ── Businesses ───────────────────────────────────────────
export async function getBusinesses({ featuredOnly = false } = {}) {
  try {
    const db = getDB(); if (!db) return [];
    let q = query(collection(db,'businesses'), where('published','==',true));
    if (featuredOnly) q = query(collection(db,'businesses'), where('published','==',true), where('featured','==',true));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { console.error('getBusinesses:', e); return []; }
}

export async function getBusinessBySlug(slug) {
  try {
    const db = getDB(); if (!db) return null;
    const q = query(collection(db,'businesses'), where('slug','==',slug), where('published','==',true));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch(e) { console.error('getBusinessBySlug:', e); return null; }
}

// ── Site Config ──────────────────────────────────────────
export async function getSiteConfig() {
  try {
    const db = getDB(); if (!db) return {};
    const snap = await getDoc(doc(db,'site_config','main'));
    return snap.exists() ? snap.data() : {};
  } catch(e) { console.error('getSiteConfig:', e); return {}; }
}

// ── Depot Days ───────────────────────────────────────────
export async function getDepotDays(year) {
  try {
    const db = getDB(); if (!db) return null;
    const y = year || new Date().getFullYear().toString();
    const snap = await getDoc(doc(db,'depot_days',y));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch(e) { console.error('getDepotDays:', e); return null; }
}

// ── FAQs ─────────────────────────────────────────────────
export async function getFAQs() {
  try {
    const db = getDB(); if (!db) return [];
    const q = query(collection(db,'faqs'), where('published','==',true), orderBy('order','asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { console.error('getFAQs:', e); return []; }
}

// ── Car Show Registration ────────────────────────────────
export async function submitCarShowRegistration(data) {
  try {
    const db = getDB(); if (!db) return { success: false, error: 'Not initialized' };
    const docRef = await addDoc(collection(db,'car_show_registrations'), {
      ...data, submittedAt: serverTimestamp(), status: 'new'
    });
    return { success: true, id: docRef.id };
  } catch(e) { console.error('submitCarShow:', e); return { success: false, error: e.message }; }
}

// ── Business Card HTML ───────────────────────────────────
export function renderBusinessCard(biz) {
  const img = biz.heroImage
    ? `<img src="${biz.heroImage}" alt="${biz.name}" class="business-card-img" loading="lazy">`
    : `<div class="business-card-img-placeholder">${biz.name.charAt(0)}</div>`;
  return `
    <a href="/business.html?slug=${biz.slug}" class="business-card">
      <div class="business-card-img-wrap">${img}</div>
      <div class="business-card-body">
        <div class="business-card-tag">${biz.category || 'District Business'}</div>
        <h3>${biz.name}</h3>
        <p>${biz.summary || ''}</p>
        <div class="business-card-arrow">View Business &rarr;</div>
      </div>
    </a>`;
}

// ── Event Item HTML ──────────────────────────────────────
export function renderEventItem(event) {
  const dateStr = event.start.date || event.start.dateTime?.substring(0,10);
  const parts   = formatDateParts(dateStr);
  const time    = event.start.dateTime
    ? new Date(event.start.dateTime).toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit' })
    : 'All day';
  return `
    <div class="event-item">
      <div class="event-date-block">
        <div class="event-date-month">${parts.month}</div>
        <div class="event-date-day">${parts.day}</div>
      </div>
      <div class="event-divider"></div>
      <div class="event-info">
        <h4>${event.summary || 'Untitled Event'}</h4>
        <p>${event.location || ''}</p>
      </div>
      <div class="event-time">${time}</div>
    </div>`;
}
