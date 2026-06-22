/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SENTINEL AI â€” Application Logic
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

'use strict';

// â”€â”€â”€ STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const state = {
  currentPage: 'dashboard',
  selectedEntity: null,
  selectedCase: null,
  alerts: [],
  iocFeed: [],
  analysisRunning: false,
  currentTip: 0,
  currentQuizQuestion: 0,
  networkAnimFrame: null,
  fraudNetworkAnimFrame: null,
  charts: {},
  networkNodes: [],
  networkEdges: [],
  fraudNodes: [],
  fraudEdges: [],
  selectedFraudNode: null,
};

// â”€â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ALERTS_DATA = [
  { level: 'critical', title: 'Coordinated Phishing Attack Detected', desc: '3 major banks targeted Â· 1,247 accounts at risk', time: '0m ago' },
  { level: 'critical', title: 'Mule Account Network Identified', desc: '47 accounts linked to â‚¹4.2Cr laundering ring', time: '2m ago' },
  { level: 'high', title: 'Counterfeit â‚¹500 Notes Circulation', desc: 'Mumbai district â€” 89 notes seized at 4 locations', time: '7m ago' },
  { level: 'high', title: 'Deepfake KYC Fraud Attempt', desc: 'AI-generated face detected in video verification', time: '12m ago' },
  { level: 'medium', title: 'Dark Web Credential Dump', desc: '12,400 banking credentials listed for sale', time: '18m ago' },
  { level: 'medium', title: 'SIM Swap Attack Campaign', desc: '24 telecom users targeted in 6 hours', time: '25m ago' },
  { level: 'low', title: 'New Phishing Domain Registered', desc: 'sbi-secure-login[.]net Â· WHOIS flagged', time: '31m ago' },
  { level: 'low', title: 'Investment Scam Ads Detected', desc: 'Social media scrape: 38 fraudulent ads removed', time: '45m ago' },
];

const PREDICTIONS_DATA = [
  { category: 'PHISHING', title: 'Festival Season Spike', desc: 'Predicted 340% increase in phishing attempts during Diwali weekend', confidence: '94%', risk: 87, timeframe: '72h', color: '#ff1744' },
  { category: 'COUNTERFEIT', title: 'â‚¹200 Note Surge', desc: 'New forgery batch detected â€” expect 150+ cases in western states', confidence: '89%', risk: 71, timeframe: '48h', color: '#ff6d00' },
  { category: 'MULE ACCOUNTS', title: 'Cross-Border Movement', desc: 'Hawala network likely to route â‚¹8Cr via shell entities in 3 states', confidence: '81%', risk: 78, timeframe: '36h', color: '#7c3aed' },
  { category: 'INVESTMENT SCAM', title: 'Crypto Ponzi Campaign', desc: 'New Telegram group gaining 2,000+ members/day â€” launch predicted', confidence: '76%', risk: 65, timeframe: '24h', color: '#0066ff' },
];

const FRAUD_NETWORKS = [
  { id: 'FN-2024-001', type: 'Hawala Ring', entities: 47, exposure: 'â‚¹12.3Cr', risk: 94, status: 'ACTIVE' },
  { id: 'FN-2024-002', type: 'Mule Account Network', entities: 23, exposure: 'â‚¹4.8Cr', risk: 87, status: 'DISRUPTED' },
  { id: 'FN-2024-003', type: 'Phishing Campaign', entities: 89, exposure: 'â‚¹2.1Cr', risk: 82, status: 'ACTIVE' },
  { id: 'FN-2024-004', type: 'Investment Scam', entities: 34, exposure: 'â‚¹18.7Cr', risk: 91, status: 'ACTIVE' },
  { id: 'FN-2024-005', type: 'SIM Swap Ring', entities: 12, exposure: 'â‚¹0.9Cr', risk: 74, status: 'MONITORING' },
  { id: 'FN-2024-006', type: 'Fake Job Portal', entities: 156, exposure: 'â‚¹6.2Cr', risk: 79, status: 'ACTIVE' },
];

const SCAM_TYPES = [
  { name: 'Investment / Ponzi', icon: 'ðŸ’°', count: 147, pct: 29, color: '#ff1744' },
  { name: 'Phone/SMS Scam', icon: 'ðŸ“±', count: 118, pct: 23, color: '#ff6d00' },
  { name: 'Phishing / Fake Sites', icon: 'ðŸŽ£', count: 98, pct: 19, color: '#ffd600' },
  { name: 'Job / Employment', icon: 'ðŸ’¼', count: 72, pct: 14, color: '#00d4ff' },
  { name: 'KYC / Bank Fraud', icon: 'ðŸ¦', count: 51, pct: 10, color: '#7c3aed' },
  { name: 'Counterfeit Goods', icon: 'ðŸ“¦', count: 26, pct: 5, color: '#00e676' },
];

const CAMPAIGNS_DATA = [
  { name: 'Operation Spectre', type: 'Investment Fraud', victims: 2847, exposure: 'â‚¹18.3Cr', spread: 78, status: 'critical' },
  { name: 'Mirage Network', type: 'Phishing Campaign', victims: 1204, exposure: 'â‚¹2.1Cr', spread: 61, status: 'high' },
  { name: 'SkyHook Ring', type: 'SIM Swap + OTP Fraud', victims: 847, exposure: 'â‚¹5.4Cr', spread: 44, status: 'high' },
  { name: 'TempleKey', type: 'Religious Donation Scam', victims: 3120, exposure: 'â‚¹0.9Cr', spread: 89, status: 'critical' },
  { name: 'JobBridge', type: 'Fake Employment Portal', victims: 4200, exposure: 'â‚¹6.2Cr', spread: 92, status: 'critical' },
  { name: 'CryptoPulse', type: 'Crypto Ponzi Scheme', victims: 670, exposure: 'â‚¹42.1Cr', spread: 35, status: 'medium' },
];

const IOC_TYPES = ['ip', 'domain', 'hash', 'url', 'email'];
const IOC_SAMPLES = [
  { type: 'ip', value: '185.220.101.47', sev: 'ðŸ”´ Critical' },
  { type: 'domain', value: 'sbi-secure-auth[.]net', sev: 'ðŸ”´ Critical' },
  { type: 'email', value: 'noreply@axis-kyc-verify[.]com', sev: 'ðŸŸ  High' },
  { type: 'hash', value: 'a3f4b1c2d8e9...f4a2', sev: 'ðŸŸ  High' },
  { type: 'url', value: 'http://paytm-offer.xyz/claim', sev: 'ðŸŸ¡ Medium' },
  { type: 'ip', value: '91.109.192.30', sev: 'ðŸ”´ Critical' },
  { type: 'domain', value: 'icici-update-kyc[.]info', sev: 'ðŸŸ  High' },
  { type: 'hash', value: 'e7d91a3bc642...88f1', sev: 'ðŸŸ¡ Medium' },
];

const THREAT_ACTORS = [
  { name: 'LOTUS MANTIS', alias: 'APT-LOTUS / MANGO TEAM', country: 'ðŸŒ East Asia', methods: ['Spear Phishing', 'Crypto Theft', 'RAT Deployment'], avatar: 'ðŸ¦‚' },
  { name: 'COBALT SPIDER', alias: 'FIN7 / Carbanak Group', country: 'ðŸŒ Eastern Europe', methods: ['ATM Jackpotting', 'POS Malware', 'Insider Trading'], avatar: 'ðŸ•·ï¸' },
  { name: 'SILVER JACKAL', alias: 'PINCHY SPIDER', country: 'ðŸŒ West Africa', methods: ['BEC Fraud', 'Money Mules', 'SIM Swap'], avatar: 'ðŸº' },
  { name: 'NEON VORTEX', alias: 'Unknown / Emerging', country: 'ðŸŒ Southeast Asia', methods: ['Deepfake KYC', 'Crypto Scam', 'App Cloning'], avatar: 'âš¡' },
];

const CASES_DATA = [
  { id: 'CS-2024-4721', title: 'Hawala Ring â€” Western Zone', type: 'Financial Fraud', priority: 'critical', status: 'Active', assignee: 'Inspector Sharma', date: '2024-12-01', evidence: 47, exposure: 'â‚¹12.3Cr' },
  { id: 'CS-2024-4698', title: 'Operation TempleKey Takedown', type: 'Scam Campaign', priority: 'critical', status: 'Active', assignee: 'SI Kaur', date: '2024-11-28', evidence: 23, exposure: 'â‚¹0.9Cr' },
  { id: 'CS-2024-4612', title: 'Counterfeit â‚¹500 Batch â€” Mumbai', type: 'Counterfeit Currency', priority: 'high', status: 'In Review', assignee: 'SI Patel', date: '2024-11-22', evidence: 89, exposure: 'â‚¹2.4Cr' },
  { id: 'CS-2024-4587', title: 'CryptoPulse Ponzi Investigation', type: 'Investment Fraud', priority: 'high', status: 'Active', assignee: 'ASI Mehta', date: '2024-11-19', evidence: 34, exposure: 'â‚¹42.1Cr' },
  { id: 'CS-2024-4543', title: 'JobBridge Employment Fraud Ring', type: 'Scam Campaign', priority: 'high', status: 'Active', assignee: 'Inspector Sharma', date: '2024-11-15', evidence: 156, exposure: 'â‚¹6.2Cr' },
  { id: 'CS-2024-4511', title: 'SIM Swap Gang â€” Telecom Fraud', type: 'Identity Theft', priority: 'medium', status: 'In Review', assignee: 'SI Patel', date: '2024-11-12', evidence: 18, exposure: 'â‚¹0.4Cr' },
  { id: 'CS-2024-4487', title: 'Deepfake KYC Fraud Network', type: 'Identity Theft', priority: 'high', status: 'Active', assignee: 'SI Kaur', date: '2024-11-09', evidence: 7, exposure: 'â‚¹1.8Cr' },
  { id: 'CS-2024-4441', title: 'Dark Web Credential Trade Ring', type: 'Cybercrime', priority: 'medium', status: 'Active', assignee: 'ASI Mehta', date: '2024-11-04', evidence: 12, exposure: 'â‚¹0.2Cr' },
];

const HOTSPOTS_DATA = [
  { district: 'Mumbai Metropolitan', state: 'Maharashtra', risk: 94, threat: 'Phishing + Counterfeit' },
  { district: 'NCR Delhi', state: 'Delhi', risk: 89, threat: 'Investment Scam + Mules' },
  { district: 'Bengaluru Urban', state: 'Karnataka', risk: 84, threat: 'Crypto Fraud + SIM Swap' },
  { district: 'Hyderabad', state: 'Telangana', risk: 79, threat: 'Job Fraud + BEC' },
  { district: 'Ahmedabad', state: 'Gujarat', risk: 74, threat: 'Hawala + Counterfeit' },
  { district: 'Kolkata', state: 'West Bengal', risk: 71, threat: 'Phishing + OTP Fraud' },
  { district: 'Jaipur', state: 'Rajasthan', risk: 68, threat: 'Religious Scam' },
];

const TIPS_DATA = [
  { title: 'ðŸ” Never Share OTP', content: 'No bank, government body, or company will ever ask for your OTP, ATM PIN, or CVV number. If anyone asks â€” it is a scam. Hang up immediately and report to 1930.' },
  { title: 'ðŸ” Verify Before Investing', content: 'Always verify investment platforms on SEBI SCORES (scores.sebi.gov.in) before investing. If promised returns seem too good to be true â€” they are.' },
  { title: 'ðŸ“± SIM Swap Protection', content: 'Enable SIM swap alerts with your telecom operator. If your phone loses signal unexpectedly, call your operator immediately â€” you may be under SIM swap attack.' },
  { title: 'ðŸŒ Phishing URL Check', content: 'Before entering credentials on any website, check the URL carefully. Fraudsters use domains like "sbi-secure[.]net" â€” always go to the official website directly.' },
  { title: 'ðŸ’° Advance Fee Warning', content: 'Never pay money to "unlock" a prize, job offer, or loan. This is called advance fee fraud. Legitimate offers do not ask you to pay first.' },
];

const QUIZ_DATA = [
  { q: 'A person calls saying your Aadhaar will be suspended and asks for OTP to verify. What do you do?', options: ['Give the OTP to avoid suspension', 'Hang up and call UIDAI on 1947', 'Ask for their employee ID first', 'Wait and see if Aadhaar gets suspended'], correct: 1, exp: 'UIDAI never calls asking for OTP. This is a scam â€” always hang up and call the official helpline 1947.' },
  { q: 'You receive â‚¹50,000 in your account from an unknown sender, then they ask you to forward â‚¹40,000 elsewhere. What is this?', options: ['A legitimate money transfer error', 'A mule account scam â€” report it', 'Free money you can keep', 'A bank testing your account'], correct: 1, exp: 'This is a classic money mule scam. The initial deposit is often from fraud victims. Do not transfer and report to 1930 immediately.' },
  { q: 'An investment app promises 45% monthly returns. What is the most likely scenario?', options: ['A legitimate high-yield fund', 'A Ponzi scheme â€” avoid it', 'A government savings scheme', 'A standard stock market return'], correct: 1, exp: 'Returns above 1-2% per month consistently are impossible in legitimate markets. This is almost certainly a Ponzi scheme.' },
];

const TAKEDOWN_STEPS_DATA = [
  { title: 'Intelligence Gathering', desc: 'AI models aggregating IOCs, network data, and victim reports', status: 'done', time: '2h ago' },
  { title: 'Entity Attribution', desc: 'Cross-referencing phone, bank, IP to known actor clusters', status: 'done', time: '1.5h ago' },
  { title: 'Legal Orders Filed', desc: 'Emergency injunctions filed with telecom & banking authorities', status: 'active', time: 'In progress' },
  { title: 'Account Freeze', desc: 'Coordinating with 4 banks to freeze 23 flagged accounts', status: 'pending-step', time: 'Pending' },
  { title: 'Domain Takedown', desc: 'Requesting suspension of 8 fraudulent domains via CERT-In', status: 'pending-step', time: 'Pending' },
  { title: 'Arrests & Seizure', desc: 'Field operations coordinated with 3 state police units', status: 'pending-step', time: 'Pending' },
];

// â”€â”€â”€ UTILITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randF(min, max, dec = 1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }

function lerp(a, b, t) { return a + (b - a) * t; }

function showToast(msg, type = 'info') {
  const icons = { success: 'âœ…', error: 'âŒ', warning: 'âš ï¸', info: 'â„¹ï¸' };
  const container = $('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'none'; toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// â”€â”€â”€ TIME â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function updateTime() {
  const now = new Date();
  const timeEl = $('topbarTime');
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }
}

setInterval(updateTime, 1000);
updateTime();

// â”€â”€â”€ NAVIGATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function navigateTo(page) {
  // Hide all pages
  $$('.page').forEach(p => p.classList.remove('active'));
  $$('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target
  const pageEl = $(`page-${page}`);
  const navEl = $(`nav-${page}`);
  if (pageEl) pageEl.classList.add('active');
  if (navEl) navEl.classList.add('active');

  state.currentPage = page;

  const titles = {
    dashboard: ['Command Dashboard', 'SENTINEL AI / Overview'],
    fraud: ['Fraud Network Mapper', 'SENTINEL AI / Fraud Detection'],
    counterfeit: ['Counterfeit Detector', 'SENTINEL AI / Forensics'],
    scams: ['Scam Operations', 'SENTINEL AI / Disruption'],
    threats: ['Threat Intelligence', 'SENTINEL AI / Intelligence'],
    cases: ['Case Management', 'SENTINEL AI / Operations'],
    analytics: ['Predictive Analytics', 'SENTINEL AI / Analytics'],
    citizen: ['Citizen Portal', 'SENTINEL AI / Public'],
    settings: ['Settings', 'SENTINEL AI / Configuration'],
  };

  const [title, breadcrumb] = titles[page] || ['Dashboard', 'SENTINEL AI'];
  const titleEl = $('pageTitle');
  const breadEl = $('pageBreadcrumb');
  if (titleEl) titleEl.textContent = title;
  if (breadEl) breadEl.textContent = breadcrumb;

  // Init page-specific content
  if (page === 'dashboard' && !state.charts.threatTimeline) initDashboard();
  if (page === 'fraud') initFraudPage();
  if (page === 'counterfeit') initCounterfeitPage();
  if (page === 'scams') initScamsPage();
  if (page === 'threats') initThreatsPage();
  if (page === 'cases') initCasesPage();
  if (page === 'analytics') initAnalyticsPage();
  if (page === 'citizen') initCitizenPage();
}

// Bind nav items
$$('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.page);
    if (window.innerWidth <= 900) {
      document.getElementById('sidebar').classList.remove('open');
    }
  });
});

// Hamburger
$('menuToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Alert dismiss
$('alertDismiss')?.addEventListener('click', () => {
  const banner = $('alertBanner');
  if (banner) { banner.style.display = 'none'; }
});

// â”€â”€â”€ SPARKLINES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function drawSparkline(canvasId, data, color) {
  const canvas = $(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '60');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  const lastX = w;
  const lastY = h - ((data[data.length-1] - min) / range) * h * 0.8 - h * 0.1;
  ctx.lineTo(lastX, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// â”€â”€â”€ NETWORK GRAPH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function createNetworkNodes(count, canvasW, canvasH) {
  const types = ['PERSON', 'ACCOUNT', 'DEVICE', 'IP', 'ORG'];
  const colors = { PERSON: '#00d4ff', ACCOUNT: '#ffd600', DEVICE: '#7c3aed', IP: '#ff6d00', ORG: '#00e676' };
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const type = types[rand(0, types.length - 1)];
    nodes.push({
      id: i,
      x: randF(40, canvasW - 40),
      y: randF(40, canvasH - 40),
      vx: randF(-0.3, 0.3),
      vy: randF(-0.3, 0.3),
      type,
      color: colors[type],
      size: rand(4, 10),
      risk: rand(20, 99),
      critical: Math.random() < 0.15,
      label: type === 'IP' ? `${rand(1,255)}.${rand(0,255)}.${rand(0,255)}.${rand(0,255)}` : `${type}-${rand(100,999)}`,
    });
  }
  return nodes;
}

function createNetworkEdges(nodes, density = 0.08) {
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < density) {
        edges.push({ a: i, b: j, strength: randF(0.2, 1) });
      }
    }
  }
  return edges;
}

function drawNetworkGraph(canvasId, nodes, edges, selectedId = null) {
  const canvas = $(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || canvas.width;
  const h = canvas.offsetHeight || canvas.height;
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);

  // Draw edges
  edges.forEach(edge => {
    const a = nodes[edge.a];
    const b = nodes[edge.b];
    if (!a || !b) return;
    const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    grad.addColorStop(0, a.color + '40');
    grad.addColorStop(1, b.color + '40');
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = edge.strength * 0.8;
    ctx.stroke();
  });

  // Draw nodes
  nodes.forEach(node => {
    const isSelected = node.id === selectedId;
    const r = node.size + (isSelected ? 3 : 0);

    if (node.critical) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,23,68,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Glow
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3);
    glow.addColorStop(0, node.color + '30');
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Node
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = node.critical ? '#ff1744' : node.color;
    ctx.fill();

    if (isSelected) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

function animateNetwork() {
  const canvas = $('networkCanvas');
  if (!canvas) return;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;

  if (!state.networkNodes.length) {
    state.networkNodes = createNetworkNodes(60, w, h);
    state.networkEdges = createNetworkEdges(state.networkNodes, 0.06);
  }

  // Update positions
  state.networkNodes.forEach(node => {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 20 || node.x > w - 20) node.vx *= -1;
    if (node.y < 20 || node.y > h - 20) node.vy *= -1;
  });

  drawNetworkGraph('networkCanvas', state.networkNodes, state.networkEdges);
  state.networkAnimFrame = requestAnimationFrame(animateNetwork);
}

// â”€â”€â”€ CHART.JS HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Chart.defaults.color = 'rgba(232,244,255,0.5)';
Chart.defaults.borderColor = 'rgba(0,212,255,0.06)';
Chart.defaults.font.family = "'Inter', sans-serif";

function genLabels24h() {
  const labels = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now - i * 3600000);
    labels.push(d.getHours().toString().padStart(2, '0') + ':00');
  }
  return labels;
}

function genLabels30d() {
  const labels = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    labels.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
  }
  return labels;
}

// â”€â”€â”€ DASHBOARD INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initDashboard() {
// Update dashboard with real stats
if (state.dbStats && state.dbStats.kpis) {
  const kpis = state.dbStats.kpis;
  if (document.getElementById('kpiThreats')) document.getElementById('kpiThreats').textContent = kpis.activeThreats.toLocaleString();
  if (document.getElementById('kpiFraud')) document.getElementById('kpiFraud').textContent = kpis.fraudIntercepted;
  if (document.getElementById('kpiNetworks')) document.getElementById('kpiNetworks').textContent = kpis.networksDetected.toLocaleString();
  if (document.getElementById('kpiAI')) document.getElementById('kpiAI').textContent = kpis.aiAccuracy;
  if (document.getElementById('alertBadge')) document.getElementById('alertBadge').textContent = kpis.unreadAlerts;
}
  // Sparklines
  drawSparkline('sparkline1', [120,180,140,220,190,280,247,310,290,360,320,410], '#ff1744');
  drawSparkline('sparkline2', [80,120,110,150,180,160,210,240,200,280,260,320], '#ff6d00');
  drawSparkline('sparkline3', [40,60,55,80,75,100,90,120,110,150,140,183], '#00d4ff');
  drawSparkline('sparkline4', [94,95,94.5,96,95.5,97,96.5,98,97.5,98.5,99,99.2], '#7c3aed');

  // Threat Timeline Chart
  const tlCtx = $('threatTimelineChart')?.getContext('2d');
  if (tlCtx) {
    const labels = genLabels24h();
    const detected = labels.map(() => rand(20, 180));
    const neutralised = detected.map(v => Math.floor(v * randF(0.6, 0.9)));
    const predicted = [...Array(18).fill(null), ...labels.slice(18).map(() => rand(80, 200))];

    state.charts.threatTimeline = new Chart(tlCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Threats Detected', data: detected, borderColor: '#ff6d00', backgroundColor: 'rgba(255,109,0,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true },
          { label: 'Neutralised', data: neutralised, borderColor: '#00e676', backgroundColor: 'rgba(0,230,118,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true },
          { label: 'AI Forecast', data: predicted, borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.4, borderDash: [4, 4], fill: true },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'top', labels: { boxWidth: 8, font: { size: 10 } } } },
        scales: {
          x: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { maxTicksLimit: 8, font: { size: 9 } } },
          y: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { font: { size: 9 } } },
        },
      },
    });
  }

  // Threat Distribution Doughnut
  const distCtx = $('threatDistChart')?.getContext('2d');
  if (distCtx) {
    const data = [247, 189, 134, 108, 98, 72];
    const labels = ['Investment Scam', 'Phishing', 'Counterfeit', 'SIM Swap', 'Job Fraud', 'Others'];
    const colors = ['#ff1744', '#ff6d00', '#ffd600', '#00d4ff', '#7c3aed', '#00e676'];
    state.charts.dist = new Chart(distCtx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors.map(c => c + 'cc'), borderColor: colors, borderWidth: 1, hoverOffset: 8 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw} cases` } } },
      },
    });

    // Legend
    const legend = $('distLegend');
    if (legend) {
      legend.innerHTML = labels.map((l, i) => `
        <div class="legend-item">
          <div class="legend-dot" style="background:${colors[i]}"></div>
          <span>${l}</span>
          <span class="legend-val">${data[i]}</span>
        </div>`).join('');
    }
  }

  // Alerts Feed
  renderAlertsFeed();

  // Network Graph
  animateNetwork();

  // Geo Map
  drawGeoMap();

  // Predictions
  renderPredictions();

  // Live counter animation
  animateKPICounters();
}

function renderAlertsFeed() {
  const feed = $('alertsFeed');
  if (!feed) return;
  feed.innerHTML = ALERTS_DATA.map(a => `
    <div class="alert-item">
      <div class="alert-item-dot ${a.level}"></div>
      <div class="alert-item-content">
        <div class="alert-item-title">${a.title}</div>
        <div class="alert-item-desc">${a.desc}</div>
      </div>
      <div class="alert-item-time">${a.time}</div>
    </div>`).join('');
}

function drawGeoMap() {
  const canvas = $('geoCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || 400;
  const h = canvas.offsetHeight || 240;
  canvas.width = w;
  canvas.height = h;

  // Draw simplified India map as circles (threat hotspots)
  const hotspots = [
    { x: 0.35, y: 0.35, r: 0.08, risk: 0.94, label: 'Mumbai' },
    { x: 0.55, y: 0.18, r: 0.07, risk: 0.89, label: 'Delhi' },
    { x: 0.6, y: 0.55, r: 0.065, risk: 0.84, label: 'Bengaluru' },
    { x: 0.62, y: 0.45, r: 0.06, risk: 0.79, label: 'Hyderabad' },
    { x: 0.32, y: 0.25, r: 0.055, risk: 0.74, label: 'Ahmedabad' },
    { x: 0.78, y: 0.3, r: 0.05, risk: 0.71, label: 'Kolkata' },
    { x: 0.45, y: 0.28, r: 0.045, risk: 0.65, label: 'Bhopal' },
    { x: 0.52, y: 0.22, r: 0.05, risk: 0.68, label: 'Lucknow' },
    { x: 0.42, y: 0.68, r: 0.04, risk: 0.57, label: 'Chennai' },
    { x: 0.35, y: 0.42, r: 0.04, risk: 0.61, label: 'Pune' },
  ];

  // Background grid
  ctx.fillStyle = 'rgba(0,212,255,0.03)';
  for (let gx = 0; gx < w; gx += 20) {
    for (let gy = 0; gy < h; gy += 20) {
      ctx.fillRect(gx, gy, 1, 1);
    }
  }

  hotspots.forEach(hs => {
    const cx = hs.x * w;
    const cy = hs.y * h;
    const radius = hs.r * Math.min(w, h);
    const r = Math.floor(hs.risk * 255);
    const b = Math.floor((1 - hs.risk) * 200);

    // Outer glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2);
    glow.addColorStop(0, `rgba(${r},${50},${b},0.3)`);
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Main circle
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(${r},${80},${b},0.7)`);
    grad.addColorStop(1, `rgba(${r},${30},${b},0.2)`);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Label
    ctx.fillStyle = 'rgba(232,244,255,0.7)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(hs.label, cx, cy + radius + 12);
  });
}

function renderPredictions() {
  const list = $('predictionsList');
  if (!list) return;
  list.innerHTML = PREDICTIONS_DATA.map(p => `
    <div class="prediction-item">
      <div class="pred-header">
        <span class="pred-category" style="color:${p.color}">${p.category}</span>
        <span class="pred-confidence">${p.confidence}</span>
      </div>
      <div class="pred-title">${p.title}</div>
      <div class="pred-desc">${p.desc}</div>
      <div class="pred-risk-bar"><div class="pred-risk-fill" style="width:${p.risk}%;background:${p.color}"></div></div>
      <div class="pred-meta"><span>Risk: ${p.risk}/100</span><span>â± ${p.timeframe}</span></div>
    </div>`).join('');
}

function animateKPICounters() {
  const kpis = [
    { id: 'kpiThreats', target: 2847, prefix: '', suffix: '' },
    { id: 'kpiFraud', target: 48.3, prefix: 'â‚¹ ', suffix: 'Cr' },
    { id: 'kpiNetworks', target: 183, prefix: '', suffix: '' },
    { id: 'kpiAI', target: 99.2, prefix: '', suffix: '%' },
  ];
  kpis.forEach(kpi => {
    const el = $(kpi.id);
    if (!el) return;
    let current = 0;
    const step = kpi.target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= kpi.target) { current = kpi.target; clearInterval(timer); }
      el.textContent = kpi.prefix + (Number.isInteger(kpi.target) ? Math.floor(current).toLocaleString() : current.toFixed(1)) + kpi.suffix;
    }, 16);
  });
}

// â”€â”€â”€ FRAUD PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initFraudPage() {
  // Fraud network canvas
  const canvas = $('fraudNetworkCanvas');
  if (canvas && !state.fraudNodes.length) {
    const w = canvas.offsetWidth || 600;
    const h = 460;
    state.fraudNodes = createNetworkNodes(80, w, h);
    state.fraudEdges = createNetworkEdges(state.fraudNodes, 0.05);
    animateFraudNetwork();
  }

  // Analytics chart
  const ctx = $('fraudAnalyticsChart')?.getContext('2d');
  if (ctx && !state.charts.fraudAnalytics) {
    state.charts.fraudAnalytics = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          { label: 'Networks Detected', data: [12,18,15,24,21,32,28,38,35,42,39,47], backgroundColor: 'rgba(0,212,255,0.3)', borderColor: '#00d4ff', borderWidth: 1, borderRadius: 4 },
          { label: 'Networks Neutralised', data: [8,12,10,18,16,24,22,30,28,35,32,40], backgroundColor: 'rgba(0,230,118,0.3)', borderColor: '#00e676', borderWidth: 1, borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 8, font: { size: 10 } } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 } } },
          y: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { font: { size: 9 } } },
        },
      },
    });
  }

  // Table
  const tbody = $('fraudTableBody');
  if (tbody) {
    tbody.innerHTML = FRAUD_NETWORKS.map(n => {
      const riskClass = n.risk > 90 ? 'risk-high' : n.risk > 75 ? 'risk-medium' : 'risk-low';
      const statusColor = n.status === 'ACTIVE' ? 'danger' : n.status === 'DISRUPTED' ? 'active' : 'warning';
      return `<tr>
        <td class="mono">${n.id}</td>
        <td>${n.type}</td>
        <td>${n.entities}</td>
        <td>${n.exposure}</td>
        <td class="${riskClass} mono">${n.risk}/100</td>
        <td><span class="status-badge ${statusColor}">${n.status}</span></td>
        <td><button class="btn-ghost small" onclick="showToast('Investigating ${n.id}...', 'info')">Investigate</button></td>
      </tr>`;
    }).join('');
  }
}

function animateFraudNetwork() {
  const canvas = $('fraudNetworkCanvas');
  if (!canvas) return;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight || 460;
  state.fraudNodes.forEach(node => {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 20 || node.x > w - 20) node.vx *= -1;
    if (node.y < 20 || node.y > h - 20) node.vy *= -1;
  });
  drawNetworkGraph('fraudNetworkCanvas', state.fraudNodes, state.fraudEdges, state.selectedFraudNode);
  state.fraudNetworkAnimFrame = requestAnimationFrame(animateFraudNetwork);
}

// Network click for entity detail
document.addEventListener('click', e => {
  const fraudCanvas = $('fraudNetworkCanvas');
  if (fraudCanvas && e.target === fraudCanvas) {
    const rect = fraudCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = null;
    state.fraudNodes.forEach(node => {
      const dx = node.x - mx;
      const dy = node.y - my;
      if (Math.sqrt(dx*dx + dy*dy) < node.size + 8) found = node;
    });
    if (found) {
      state.selectedFraudNode = found.id;
      showEntityDetail(found);
    }
  }
});

function showEntityDetail(node) {
  const panel = $('entityDetail');
  if (!panel) return;
  const riskColor = node.risk > 80 ? 'var(--accent-red)' : node.risk > 60 ? 'var(--accent-yellow)' : 'var(--accent-green)';
  panel.innerHTML = `
    <div class="entity-loaded">
      <div class="entity-header">
        <div class="entity-avatar">${node.type === 'PERSON' ? 'ðŸ‘¤' : node.type === 'ACCOUNT' ? 'ðŸ¦' : node.type === 'DEVICE' ? 'ðŸ“±' : node.type === 'IP' ? 'ðŸŒ' : 'ðŸ¢'}</div>
        <div>
          <div class="entity-name">${node.label}</div>
          <div class="entity-type">${node.type} ENTITY</div>
        </div>
      </div>
      <div class="entity-field"><span class="entity-field-label">Risk Score</span><span class="entity-field-value" style="color:${riskColor}">${node.risk}/100</span></div>
      <div class="entity-field"><span class="entity-field-label">Status</span><span class="entity-field-value" style="color:${node.critical ? 'var(--accent-red)' : 'var(--accent-yellow)'}">${node.critical ? 'CRITICAL' : 'FLAGGED'}</span></div>
      <div class="entity-field"><span class="entity-field-label">Connections</span><span class="entity-field-value">${state.fraudEdges.filter(e => e.a === node.id || e.b === node.id).length}</span></div>
      <div class="entity-field"><span class="entity-field-label">First Seen</span><span class="entity-field-value">${rand(1,28)}/11/2024</span></div>
      <div class="entity-field"><span class="entity-field-label">Last Activity</span><span class="entity-field-value">Today ${rand(1,12)}:${rand(10,59)}</span></div>
      <div class="entity-field"><span class="entity-field-label">Associated Cases</span><span class="entity-field-value">${rand(1,4)} cases</span></div>
      <div style="margin-top:12px;display:flex;gap:6px;">
        <button class="btn-danger" onclick="showToast('Entity flagged for investigation', 'warning')">Flag Entity</button>
        <button class="btn-ghost" onclick="showToast('Adding to watchlist...', 'info')">Watchlist</button>
      </div>
    </div>`;
}

// â”€â”€â”€ COUNTERFEIT PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initCounterfeitPage() {
  const ctx = $('counterTrendChart')?.getContext('2d');
  if (ctx && !state.charts.counterTrend) {
    state.charts.counterTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: genLabels30d(),
        datasets: [
          { label: 'â‚¹500 Notes', data: Array.from({length:30}, () => rand(1,15)), borderColor: '#ff6d00', backgroundColor: 'rgba(255,109,0,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true },
          { label: 'â‚¹200 Notes', data: Array.from({length:30}, () => rand(0,8)), borderColor: '#ffd600', backgroundColor: 'rgba(255,214,0,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true },
          { label: 'â‚¹100 Notes', data: Array.from({length:30}, () => rand(0,5)), borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 8, font: { size: 10 } } } },
        scales: {
          x: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { maxTicksLimit: 8, font: { size: 9 } } },
          y: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { font: { size: 9 } } },
        },
      },
    });
  }

  // Cases table
  const tbody = $('counterCasesBody');
  if (tbody) {
    const locations = ['Mumbai Central', 'Delhi NCR', 'Ahmedabad', 'Bengaluru', 'Jaipur', 'Kolkata'];
    const denoms = ['â‚¹500', 'â‚¹200', 'â‚¹100', 'â‚¹2000'];
    tbody.innerHTML = Array.from({length:8}, (_, i) => {
      const conf = rand(87, 99);
      return `<tr>
        <td class="mono">CCF-${2024}-${4800 + i}</td>
        <td>${rand(1,30)}/11/2024</td>
        <td>${denoms[rand(0,3)]}</td>
        <td>${locations[rand(0,5)]}</td>
        <td class="mono ${conf > 95 ? 'risk-high' : conf > 90 ? 'risk-medium' : ''}">${conf}%</td>
        <td><span class="status-badge danger">COUNTERFEIT</span></td>
      </tr>`;
    }).join('');
  }

  // Upload button
  $('uploadBtn')?.addEventListener('click', () => $('currencyFileInput')?.click());
  $('analyzeBtn')?.addEventListener('click', runForensicAnalysis);
}

function runForensicAnalysis() {
  if (state.analysisRunning) return;
  state.analysisRunning = true;
  const panel = $('analysisPanel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="analysis-idle">
      <div class="ai-brain-anim">
        <div class="brain-ring r1"></div>
        <div class="brain-ring r2"></div>
        <div class="brain-ring r3"></div>
        <div class="brain-core">AI</div>
      </div>
      <p style="color:var(--accent-cyan)">Scanning currency image...<br><small style="color:var(--text-muted)">Running 8 forensic checks</small></p>
    </div>`;

  // Simulate feature analysis
  const features = ['feat-watermark','feat-security-thread','feat-microprint','feat-intaglio','feat-serial','feat-optvar','feat-fluorescent','feat-seeline'];
  const results = features.map(() => Math.random() < 0.15 ? 'fail' : Math.random() < 0.1 ? 'warn' : 'pass');
  const isCounterfeit = results.filter(r => r === 'fail').length >= 2;

  let delay = 400;
  features.forEach((fid, idx) => {
    setTimeout(() => {
      const el = $(fid);
      if (el) {
        const res = results[idx];
        el.className = `feature-item ${res}`;
        const status = el.querySelector('.feat-status');
        if (status) {
          status.className = `feat-status ${res}`;
          status.textContent = res === 'pass' ? 'PASS âœ“' : res === 'fail' ? 'FAIL âœ—' : 'WARN âš ';
        }
      }
    }, delay);
    delay += 300;
  });

  setTimeout(() => {
    const verdict = isCounterfeit ? 'COUNTERFEIT' : 'GENUINE';
    const confidence = isCounterfeit ? rand(91, 99) : rand(94, 99);
    const verdictColor = isCounterfeit ? 'var(--accent-red)' : 'var(--accent-green)';
    const failCount = results.filter(r => r === 'fail').length;
    const warnCount = results.filter(r => r === 'warn').length;

    panel.innerHTML = `
      <div style="padding:20px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:48px;margin-bottom:8px;">${isCounterfeit ? 'â›”' : 'âœ…'}</div>
          <div style="font-family:var(--font-display);font-size:24px;font-weight:700;color:${verdictColor}">${verdict}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:4px)">AI Confidence: <strong style="color:${verdictColor}">${confidence}%</strong></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
          <div class="overlay-stat" style="text-align:center">
            <span style="color:var(--accent-green)">${results.filter(r=>r==='pass').length}</span>
            <small>PASSED</small>
          </div>
          <div class="overlay-stat" style="text-align:center">
            <span style="color:var(--accent-yellow)">${warnCount}</span>
            <small>WARNINGS</small>
          </div>
          <div class="overlay-stat" style="text-align:center">
            <span style="color:var(--accent-red)">${failCount}</span>
            <small>FAILED</small>
          </div>
        </div>
        ${isCounterfeit ? `<div class="alert-banner" style="border-radius:8px;margin-top:0"><div class="alert-banner-inner"><span class="alert-pulse"></span><strong>ACTION REQUIRED:</strong>&nbsp;Submit to nearest police station. Reference case will be auto-created.</div></div>` : '<div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.3);border-radius:8px;padding:12px;font-size:12px;color:var(--accent-green)">âœ“ Currency appears genuine. All major security features verified.</div>'}
        <button class="btn-ghost" style="width:100%;margin-top:12px;" onclick="showToast('Case report generated', 'success')">Generate Report</button>
      </div>`;
    state.analysisRunning = false;

    if (isCounterfeit) {
      showToast('â›” Counterfeit note detected! Auto-case created.', 'error');
    } else {
      showToast('âœ… Currency verified as genuine.', 'success');
    }
  }, features.length * 300 + 800);
}

// â”€â”€â”€ SCAMS PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initScamsPage() {
  // Scam type list
  const list = $('scamTypeList');
  if (list) {
    list.innerHTML = SCAM_TYPES.map(s => `
      <div class="scam-type-item">
        <div class="scam-type-icon">${s.icon}</div>
        <div class="scam-type-info"><strong>${s.name}</strong><small>${s.count} active cases</small></div>
        <div class="scam-type-bar">
          <div class="type-bar-bg"><div class="type-bar-fill" style="width:${s.pct}%;background:${s.color}"></div></div>
          <div class="type-count">${s.pct}%</div>
        </div>
      </div>`).join('');
  }

  // Campaigns
  const campaigns = $('campaignsList');
  if (campaigns) {
    campaigns.innerHTML = CAMPAIGNS_DATA.map(c => `
      <div class="campaign-item">
        <div class="campaign-header">
          <div>
            <div class="campaign-name">${c.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${c.type}</div>
          </div>
          <span class="status-badge ${c.status === 'critical' ? 'danger' : c.status === 'high' ? 'warning' : 'info'}">${c.status.toUpperCase()}</span>
        </div>
        <div class="campaign-meta">
          <span>ðŸ‘¥ ${c.victims.toLocaleString()} victims</span>
          <span>ðŸ’¸ ${c.exposure}</span>
          <span>ðŸ“¡ ${c.spread}% reach</span>
        </div>
        <div class="campaign-progress"><div class="campaign-progress-fill" style="width:${c.spread}%"></div></div>
      </div>`).join('');
  }

  // Velocity chart
  const vCtx = $('scamVelocityChart')?.getContext('2d');
  if (vCtx && !state.charts.scamVelocity) {
    state.charts.scamVelocity = new Chart(vCtx, {
      type: 'line',
      data: {
        labels: genLabels24h(),
        datasets: [
          { label: 'New Victims/hr', data: Array.from({length:24}, () => rand(50,400)), borderColor: '#ff1744', backgroundColor: 'rgba(255,23,68,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true },
          { label: 'Takedowns/hr', data: Array.from({length:24}, () => rand(10,80)), borderColor: '#00e676', backgroundColor: 'rgba(0,230,118,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 8, font: { size: 10 } } } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 9 } } },
          y: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { font: { size: 9 } } },
        },
      },
    });
  }

  // Demographics chart
  const dCtx = $('demographicsChart')?.getContext('2d');
  if (dCtx && !state.charts.demographics) {
    state.charts.demographics = new Chart(dCtx, {
      type: 'bar',
      data: {
        labels: ['18-25', '26-35', '36-45', '46-60', '60+'],
        datasets: [{ label: 'Victims %', data: [18, 27, 24, 21, 10], backgroundColor: ['#00d4ff88','#7c3aed88','#ffd60088','#ff6d0088','#ff174488'], borderWidth: 0, borderRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 } } },
          y: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { font: { size: 9 } } },
        },
      },
    });
  }

  // Platform bars
  const pb = $('platformBars');
  if (pb) {
    const platforms = [
      { name: 'WhatsApp', pct: 38, color: '#00e676' },
      { name: 'Telegram', pct: 24, color: '#00d4ff' },
      { name: 'SMS/Call', pct: 18, color: '#ffd600' },
      { name: 'Email', pct: 12, color: '#ff6d00' },
      { name: 'Other', pct: 8, color: '#7c3aed' },
    ];
    pb.innerHTML = platforms.map(p => `
      <div class="platform-bar-item">
        <span class="platform-bar-label">${p.name}</span>
        <div class="platform-bar-track"><div class="platform-bar-fill" style="width:${p.pct}%;background:${p.color}"></div></div>
        <span class="platform-bar-val">${p.pct}%</span>
      </div>`).join('');
  }

  // Takedown
  const ts = $('takedownSteps');
  if (ts) {
    ts.innerHTML = TAKEDOWN_STEPS_DATA.map((s, i) => `
      <div class="takedown-step">
        <div class="step-num ${s.status}">${s.status === 'done' ? 'âœ“' : i + 1}</div>
        <div class="step-content">
          <div class="step-title">${s.title}</div>
          <div class="step-desc">${s.desc}</div>
          ${s.status !== 'pending-step' ? `<div class="step-time">${s.time}</div>` : ''}
        </div>
      </div>`).join('');
  }

  // Intel
  const intel = $('intelList');
  if (intel) {
    intel.innerHTML = [
      { icon: 'ðŸ“‹', title: 'Operation Spectre â€” Full Analysis', meta: 'Generated 2h ago Â· 24 pages Â· PDF', conf: 94 },
      { icon: 'ðŸ”', title: 'JobBridge Network Attribution Report', meta: 'Generated 6h ago Â· 18 pages Â· PDF', conf: 88 },
      { icon: 'ðŸŒ', title: 'Cross-Border Scam Infrastructure Map', meta: 'Generated 1d ago Â· 31 pages Â· PDF', conf: 91 },
    ].map(r => `
      <div class="intel-item">
        <div class="intel-icon">${r.icon}</div>
        <div class="intel-content">
          <div class="intel-title">${r.title}</div>
          <div class="intel-meta">${r.meta} Â· AI Conf: ${r.conf}%</div>
        </div>
        <div class="intel-actions">
          <button class="btn-ghost small" onclick="showToast('Downloading report...', 'info')">Download</button>
        </div>
      </div>`).join('');
  }

  // Bulk takedown
  $('bulkTakedownBtn')?.addEventListener('click', () => showToast('ðŸš€ Bulk takedown order initiated for 12 campaigns', 'warning'));
}

// â”€â”€â”€ THREATS PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initThreatsPage() {
  // Radar chart
  const rCtx = $('threatRadarChart')?.getContext('2d');
  if (rCtx && !state.charts.threatRadar) {
    state.charts.threatRadar = new Chart(rCtx, {
      type: 'radar',
      data: {
        labels: ['Phishing', 'Counterfeit', 'Investment Scam', 'Identity Theft', 'Mule Accounts', 'Dark Web', 'Malware', 'BEC'],
        datasets: [
          { label: 'Current Threat Level', data: [87, 65, 92, 74, 81, 58, 45, 67], borderColor: '#ff1744', backgroundColor: 'rgba(255,23,68,0.12)', borderWidth: 2, pointBackgroundColor: '#ff1744' },
          { label: '30-Day Baseline', data: [72, 55, 78, 65, 70, 48, 40, 55], borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.06)', borderWidth: 1, pointBackgroundColor: '#00d4ff' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10 } } } },
        scales: { r: { grid: { color: 'rgba(0,212,255,0.1)' }, pointLabels: { font: { size: 10 } }, angleLines: { color: 'rgba(0,212,255,0.1)' }, ticks: { display: false }, min: 0, max: 100 } },
      },
    });
  }

  // Attack vector chart
  const avCtx = $('attackVectorChart')?.getContext('2d');
  if (avCtx && !state.charts.attackVector) {
    state.charts.attackVector = new Chart(avCtx, {
      type: 'bar',
      data: {
        labels: ['Social Engineering', 'Fake Websites', 'App Cloning', 'Vishing', 'Email Phishing', 'SMS Smishing'],
        datasets: [{ data: [340, 280, 195, 167, 143, 128], backgroundColor: ['#ff1744bb','#ff6d00bb','#ffd600bb','#00d4ffbb','#7c3aedbb','#00e676bb'], borderWidth: 0, borderRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { font: { size: 9 } } }, y: { grid: { display: false }, ticks: { font: { size: 9 } } } },
      },
    });
  }

  // IOC Feed
  const iocFeed = $('iocFeed');
  if (iocFeed) {
    iocFeed.innerHTML = IOC_SAMPLES.map(ioc => `
      <div class="ioc-item">
        <span class="ioc-type ${ioc.type}">${ioc.type.toUpperCase()}</span>
        <span class="ioc-value">${ioc.value}</span>
        <span class="ioc-severity">${ioc.sev}</span>
      </div>`).join('');
  }

  // Add live IOCs every 5 seconds
  setInterval(() => {
    if (state.currentPage !== 'threats') return;
    const feed = $('iocFeed');
    if (!feed) return;
    const types = ['ip', 'domain', 'hash', 'url', 'email'];
    const type = types[rand(0, types.length - 1)];
    const sevs = ['ðŸ”´ Critical', 'ðŸŸ  High', 'ðŸŸ¡ Medium'];
    const values = {
      ip: `${rand(1,255)}.${rand(0,255)}.${rand(0,255)}.${rand(0,255)}`,
      domain: `secure-bank-${rand(100,999)}[.]net`,
      hash: `${Math.random().toString(36).substr(2,8)}...${Math.random().toString(36).substr(2,4)}`,
      url: `https://fake-kyc-${rand(10,99)}.xyz/login`,
      email: `alert@bank${rand(10,99)}-verify[.]com`,
    };
    const item = document.createElement('div');
    item.className = 'ioc-item';
    item.innerHTML = `<span class="ioc-type ${type}">${type.toUpperCase()}</span><span class="ioc-value">${values[type]}</span><span class="ioc-severity">${sevs[rand(0,2)]}</span>`;
    feed.prepend(item);
    if (feed.children.length > 20) feed.removeChild(feed.lastChild);
  }, 5000);

  // Actors
  const actors = $('actorsList');
  if (actors) {
    actors.innerHTML = THREAT_ACTORS.map(a => `
      <div class="actor-item">
        <div class="actor-avatar">${a.avatar}</div>
        <div class="actor-info">
          <div class="actor-name">${a.name}</div>
          <div class="actor-alias">${a.alias} Â· ${a.country}</div>
          <div class="actor-tags">${a.methods.map(m => `<span class="actor-tag">${m}</span>`).join('')}</div>
        </div>
        <button class="btn-ghost small" onclick="showToast('Profile loaded: ${a.name}', 'info')">Profile</button>
      </div>`).join('');
  }
}

// â”€â”€â”€ CASES PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initCasesPage() {
  const list = $('casesList');
  if (list) {
    list.innerHTML = CASES_DATA.map((c, i) => `
      <div class="case-item" onclick="selectCase(${i})" id="case-item-${i}">
        <div class="case-priority-dot ${c.priority}"></div>
        <div class="case-info">
          <div class="case-id">${c.id}</div>
          <div class="case-title">${c.title}</div>
          <div class="case-meta">${c.type} Â· ${c.assignee}</div>
        </div>
        <div class="case-status-col">
          <span class="status-badge ${c.status === 'Active' ? 'danger' : c.status === 'In Review' ? 'warning' : 'info'}">${c.status}</span>
          <span style="font-size:10px;color:var(--text-muted)">${c.date}</span>
        </div>
      </div>`).join('');
  }

  // New case button
  $('newCaseBtn')?.addEventListener('click', () => {
    const modal = $('newCaseModal');
    if (modal) modal.style.display = 'flex';
  });

  $('closeNewCase')?.addEventListener('click', () => { $('newCaseModal').style.display = 'none'; });
  $('cancelNewCase')?.addEventListener('click', () => { $('newCaseModal').style.display = 'none'; });

  $('submitNewCase')?.addEventListener('click', () => {
    const title = $('newCaseTitle')?.value;
    if (!title) { showToast('Please enter a case title', 'warning'); return; }
    $('newCaseModal').style.display = 'none';
    showToast(`âœ… Case created: ${title}`, 'success');
  });
}

window.selectCase = function(idx) {
  $$('.case-item').forEach(el => el.classList.remove('selected'));
  $(`case-item-${idx}`)?.classList.add('selected');
  const c = CASES_DATA[idx];
  if (!c) return;
  const detail = $('caseDetailPanel');
  if (detail) {
    detail.innerHTML = `
      <div style="padding:0">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);margin-bottom:4px">${c.id}</div>
            <div style="font-size:16px;font-weight:700;margin-bottom:4px">${c.title}</div>
            <div style="font-size:11px;color:var(--text-muted)">${c.type} Â· Opened ${c.date}</div>
          </div>
          <span class="status-badge ${c.priority === 'critical' ? 'danger' : c.priority === 'high' ? 'warning' : 'info'}">${c.priority.toUpperCase()}</span>
        </div>
        <div style="padding:16px 20px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            ${[['Assigned To', c.assignee], ['Status', c.status], ['Evidence Items', c.evidence], ['Financial Exposure', c.exposure]].map(([l,v]) => `
              <div class="overlay-stat" style="text-align:left;padding:10px 14px">
                <span style="font-size:13px;font-weight:700;color:var(--text-primary);font-family:initial">${v}</span>
                <small>${l}</small>
              </div>`).join('')}
          </div>
          <div style="margin-bottom:12px">
            <div style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:1px;margin-bottom:8px">AI SUMMARY</div>
            <div style="font-size:12px;color:var(--text-secondary);line-height:1.7;background:rgba(0,0,0,0.15);border-radius:8px;padding:12px;border:1px solid var(--border)">
              AI analysis has identified ${rand(3,8)} entities of interest across ${rand(2,4)} states. Transaction graph shows layered structuring with ${rand(5,15)} mule accounts. Intelligence confidence: <strong style="color:var(--accent-green)">${rand(82,96)}%</strong>. Recommended action: Immediate account freeze + field investigation.
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn-primary" onclick="showToast('Opening case workspace...', 'info')">Open Case</button>
            <button class="btn-ghost" onclick="showToast('Generating court-ready report...', 'info')">Generate Report</button>
            <button class="btn-danger" onclick="showToast('Escalated to senior officer', 'warning')">Escalate</button>
          </div>
        </div>
      </div>`;
  }
};

// â”€â”€â”€ ANALYTICS PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initAnalyticsPage() {
  // Forecast chart
  const fCtx = $('forecastChart')?.getContext('2d');
  if (fCtx && !state.charts.forecast) {
    const labels = genLabels30d();
    const historical = Array.from({length:20}, () => rand(40,200));
    const forecast = [...historical, ...Array.from({length:10}, (_, i) => rand(60 + i*8, 220 + i*10))];
    const upper = forecast.map(v => v * 1.2);
    const lower = forecast.map(v => v * 0.8);
    state.charts.forecast = new Chart(fCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Historical', data: [...historical, ...Array(10).fill(null)], borderColor: '#00d4ff', borderWidth: 2, pointRadius: 0, tension: 0.4, backgroundColor: 'rgba(0,212,255,0.06)', fill: true },
          { label: 'AI Forecast', data: [...Array(19).fill(null), ...forecast.slice(19)], borderColor: '#7c3aed', borderWidth: 2, pointRadius: 0, tension: 0.4, borderDash: [5,5], backgroundColor: 'rgba(124,58,237,0.06)', fill: true },
          { label: 'Upper Bound', data: [...Array(19).fill(null), ...upper.slice(19)], borderColor: 'rgba(124,58,237,0.3)', borderWidth: 1, pointRadius: 0, tension: 0.4, borderDash: [2,4], fill: false },
          { label: 'Lower Bound', data: [...Array(19).fill(null), ...lower.slice(19)], borderColor: 'rgba(124,58,237,0.3)', borderWidth: 1, pointRadius: 0, tension: 0.4, borderDash: [2,4], fill: '-1', backgroundColor: 'rgba(124,58,237,0.04)' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 8, font: { size: 10 } } } },
        scales: {
          x: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { maxTicksLimit: 8, font: { size: 9 } } },
          y: { grid: { color: 'rgba(0,212,255,0.04)' }, ticks: { font: { size: 9 } } },
        },
      },
    });
  }

  // Hotspots
  const hotspots = $('hotspotsList');
  if (hotspots) {
    hotspots.innerHTML = HOTSPOTS_DATA.map((h, i) => {
      const riskColor = h.risk > 85 ? 'var(--accent-red)' : h.risk > 75 ? 'var(--accent-orange)' : 'var(--accent-yellow)';
      return `<div class="hotspot-item">
        <div class="hotspot-rank">${i+1}</div>
        <div class="hotspot-info"><strong>${h.district}</strong><small>${h.state} Â· ${h.threat}</small></div>
        <div class="hotspot-risk" style="color:${riskColor}">${h.risk}</div>
      </div>`;
    }).join('');
  }

  // Models
  const models = $('modelsList');
  if (models) {
    const modelData = [
      { name: 'Fraud Detection Ensemble', acc: 96.8, version: 'v4.1.2', updated: '2d ago' },
      { name: 'Network Graph Classifier', acc: 94.2, version: 'v3.2.1', updated: '5d ago' },
      { name: 'Counterfeit CNN', acc: 99.2, version: 'v2.8.0', updated: '7d ago' },
      { name: 'Scam NLP Classifier', acc: 91.4, version: 'v5.0.1', updated: '1d ago' },
    ];
    models.innerHTML = modelData.map(m => `
      <div class="model-item">
        <div class="model-header"><span class="model-name">${m.name}</span><span class="model-acc">${m.acc}%</span></div>
        <div class="model-bar-bg"><div class="model-bar-fill" style="width:${m.acc}%"></div></div>
        <div class="model-meta"><span>${m.version}</span><span>Updated ${m.updated}</span></div>
      </div>`).join('');
  }

  // Correlation chart
  const corrCtx = $('correlationChart')?.getContext('2d');
  if (corrCtx && !state.charts.correlation) {
    state.charts.correlation = new Chart(corrCtx, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Threat Correlations',
          data: [
            { x: 0.85, y: 0.72, r: 14, label: 'Phishingâ†”Mule' },
            { x: 0.63, y: 0.89, r: 18, label: 'Investmentâ†”Crypto' },
            { x: 0.41, y: 0.54, r: 8, label: 'Counterfeitâ†”Hawala' },
            { x: 0.78, y: 0.33, r: 12, label: 'SIM Swapâ†”OTP Fraud' },
            { x: 0.22, y: 0.71, r: 6, label: 'Job Fraudâ†”KYC' },
          ],
          backgroundColor: ['rgba(255,23,68,0.6)','rgba(255,109,0,0.6)','rgba(255,214,0,0.6)','rgba(0,212,255,0.6)','rgba(124,58,237,0.6)'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ctx.raw.label } } },
        scales: {
          x: { grid: { color: 'rgba(0,212,255,0.04)' }, title: { display: true, text: 'Correlation Strength', font: { size: 10 } }, min: 0, max: 1 },
          y: { grid: { color: 'rgba(0,212,255,0.04)' }, title: { display: true, text: 'Temporal Proximity', font: { size: 10 } }, min: 0, max: 1 },
        },
      },
    });
  }

  // District risk
  const dCtx = $('districtRiskChart')?.getContext('2d');
  if (dCtx && !state.charts.districtRisk) {
    state.charts.districtRisk = new Chart(dCtx, {
      type: 'bar',
      data: {
        labels: HOTSPOTS_DATA.map(h => h.district.split(' ')[0]),
        datasets: [{ label: 'Risk Score', data: HOTSPOTS_DATA.map(h => h.risk), backgroundColor: HOTSPOTS_DATA.map(h => h.risk > 85 ? 'rgba(255,23,68,0.7)' : h.risk > 75 ? 'rgba(255,109,0,0.7)' : 'rgba(255,214,0,0.7)'), borderWidth: 0, borderRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 9 } } }, y: { grid: { color: 'rgba(0,212,255,0.04)' }, min: 0, max: 100, ticks: { font: { size: 9 } } } },
      },
    });
  }

  // Report gen
  $('generateAnalyticsReport')?.addEventListener('click', () => {
    showToast('ðŸš€ AI report generation started...', 'info');
    setTimeout(() => showToast('âœ… Report ready for download', 'success'), 2500);
  });

  // Format chips
  $$('#fmt-pdf,#fmt-docx,#fmt-json,#fmt-csv').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#fmt-pdf,#fmt-docx,#fmt-json,#fmt-csv').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// â”€â”€â”€ CITIZEN PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initCitizenPage() {
  // Tips carousel
  const carousel = $('tipsCarousel');
  const dots = $('tipDots');
  if (carousel) {
    carousel.innerHTML = TIPS_DATA.map((t, i) => `
      <div class="tip-card ${i === 0 ? 'active' : ''}">
        <h4>${t.title}</h4>
        <p>${t.content}</p>
      </div>`).join('');

    if (dots) {
      dots.innerHTML = TIPS_DATA.map((_, i) => `<div class="tip-dot ${i === 0 ? 'active' : ''}"></div>`).join('');
    }
  }

  function showTip(idx) {
    state.currentTip = (idx + TIPS_DATA.length) % TIPS_DATA.length;
    $$('.tip-card').forEach((c, i) => c.classList.toggle('active', i === state.currentTip));
    $$('.tip-dot').forEach((d, i) => d.classList.toggle('active', i === state.currentTip));
  }

  $('tipPrev')?.addEventListener('click', () => showTip(state.currentTip - 1));
  $('tipNext')?.addEventListener('click', () => showTip(state.currentTip + 1));

  // Auto-advance
  setInterval(() => { if (state.currentPage === 'citizen') showTip(state.currentTip + 1); }, 6000);

  // Verify contact
  $('verifyBtn')?.addEventListener('click', () => {
    const val = $('verifyInput')?.value?.trim();
    if (!val) { showToast('Please enter a contact to verify', 'warning'); return; }
    const result = $('verifyResult');
    if (!result) return;
    result.innerHTML = `<div class="ai-brain-anim"><div class="brain-ring r1"></div><div class="brain-ring r2"></div><div class="brain-ring r3"></div><div class="brain-core">AI</div></div>`;
    setTimeout(() => {
      const isFraud = Math.random() < 0.4;
      const risk = isFraud ? rand(72, 98) : rand(2, 25);
      const riskColor = isFraud ? 'var(--accent-red)' : 'var(--accent-green)';
      result.innerHTML = `
        <div style="text-align:center;padding:20px">
          <div style="font-size:36px;margin-bottom:8px">${isFraud ? 'âš ï¸' : 'âœ…'}</div>
          <div style="font-family:var(--font-display);font-size:18px;font-weight:700;color:${riskColor}">${isFraud ? 'HIGH RISK' : 'APPEARS SAFE'}</div>
          <div style="font-size:12px;color:var(--text-muted);margin:8px 0">${val}</div>
          <div style="font-size:13px;color:var(--text-secondary)">Risk Score: <strong style="color:${riskColor}">${risk}/100</strong></div>
          ${isFraud ? '<div style="margin-top:12px;font-size:12px;color:var(--accent-red)">âš ï¸ This contact appears in fraud databases. Do NOT share personal information.</div>' : '<div style="margin-top:12px;font-size:12px;color:var(--accent-green)">âœ“ No fraud reports found for this contact. Stay vigilant.</div>'}
        </div>`;
    }, 1500);
  });

  // Self check
  $('selfCheckBtn')?.addEventListener('click', () => {
    const val = $('selfCheckInput')?.value?.trim();
    if (!val) { showToast('Please enter your contact to check', 'warning'); return; }
    const result = $('selfCheckResult');
    if (!result) return;
    result.innerHTML = '<div style="text-align:center;padding:12px;font-size:12px;color:var(--text-muted)">Checking databases...</div>';
    setTimeout(() => {
      const breaches = rand(0, 3);
      result.innerHTML = breaches > 0
        ? `<div style="background:rgba(255,23,68,0.08);border:1px solid rgba(255,23,68,0.3);border-radius:8px;padding:12px;font-size:12px"><strong style="color:var(--accent-red)">âš ï¸ Found in ${breaches} breach(es)</strong><br><span style="color:var(--text-secondary)">Your contact appears in ${breaches} known fraud/breach database(s). Change passwords and enable 2FA immediately.</span></div>`
        : `<div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.3);border-radius:8px;padding:12px;font-size:12px"><strong style="color:var(--accent-green)">âœ… No breaches found</strong><br><span style="color:var(--text-secondary)">Your contact is not found in our fraud databases. Continue to stay vigilant.</span></div>`;
    }, 1800);
  });

  // Report form
  $('scamReportForm')?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('âœ… Report submitted! Reference: CYB-2024-' + rand(10000, 99999), 'success');
    e.target.reset();
  });

  // Quiz
  renderQuiz();
}

function renderQuiz() {
  const panel = $('quizPanel');
  if (!panel) return;
  const q = QUIZ_DATA[state.currentQuizQuestion];
  panel.innerHTML = `
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `<button class="quiz-option" onclick="answerQuiz(${i})">${opt}</button>`).join('')}
    </div>
    <div style="font-size:10px;color:var(--text-muted);margin-top:8px">Question ${state.currentQuizQuestion + 1} of ${QUIZ_DATA.length}</div>`;
}

window.answerQuiz = function(idx) {
  const q = QUIZ_DATA[state.currentQuizQuestion];
  $$('.quiz-option').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === idx && idx !== q.correct) btn.classList.add('incorrect');
  });
  const panel = $('quizPanel');
  const exp = document.createElement('div');
  exp.style.cssText = 'margin-top:12px;font-size:12px;background:rgba(0,0,0,0.2);border-radius:8px;padding:10px;color:var(--text-secondary)';
  exp.textContent = 'ðŸ’¡ ' + q.exp;
  panel.appendChild(exp);

  const next = document.createElement('button');
  next.className = 'btn-primary quiz-next';
  next.style.marginTop = '12px';
  next.textContent = state.currentQuizQuestion < QUIZ_DATA.length - 1 ? 'Next Question â†’' : 'Restart Quiz';
  next.onclick = () => {
    state.currentQuizQuestion = state.currentQuizQuestion < QUIZ_DATA.length - 1 ? state.currentQuizQuestion + 1 : 0;
    renderQuiz();
  };
  panel.appendChild(next);

  if (idx === q.correct) showToast('âœ… Correct answer!', 'success');
  else showToast('âŒ Wrong â€” check the explanation', 'error');
};

// â”€â”€â”€ LIVE KPI UPDATES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
setInterval(() => {
  if (state.currentPage !== 'dashboard') return;
  // Animate threat count
  const el = $('kpiThreats');
  if (el) {
    const current = parseInt(el.textContent.replace(/,/g, ''));
    const change = rand(-5, 15);
    const next = Math.max(2800, current + change);
    el.textContent = next.toLocaleString();
  }
  // Update alert badge
  const badge = $('alertBadge');
  if (badge) {
    badge.textContent = rand(4, 12);
  }
  // Rotate live alert
  const alertTexts = [
    'Coordinated phishing campaign detected targeting 3 major banks â€” 1,247 accounts at risk.',
    'New mule account cluster identified â€” 23 accounts linked across 4 states.',
    'Counterfeit â‚¹500 notes reported at 3 ATM locations in Mumbai.',
    'Dark web listing: 8,200 banking credentials from recent breach.',
    'AI model flagged 89 new suspicious IPs from botnet C2 infrastructure.',
  ];
  const alertTextEl = $('alertText');
  if (alertTextEl) alertTextEl.textContent = alertTexts[rand(0, alertTexts.length - 1)];
}, 8000);

// â”€â”€â”€ GLOBAL SEARCH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
$('globalSearch')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = e.target.value.trim();
    if (val) {
      showToast(`ðŸ” Searching: "${val}" across all modules...`, 'info');
      e.target.value = '';
    }
  }
});

// â”€â”€â”€ SLIDER VALUES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
['fraudAlertThresh', 'clusterSizeThresh', 'confThresh'].forEach(id => {
  const slider = $(id);
  if (!slider) return;
  slider.addEventListener('input', () => {
    const val = slider.nextElementSibling;
    if (val) val.textContent = id === 'confThresh' ? slider.value + '%' : slider.value;
  });
});

// â”€â”€â”€ CHIP EXCLUSIVITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function makeChipGroup(selector) {
  const chips = $$(selector);
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

makeChipGroup('.denom-chips .chip');
makeChipGroup('.filter-chips');

// â”€â”€â”€ GENERATE REPORT BTN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
$('generateReportBtn')?.addEventListener('click', () => {
  showToast('ðŸ“‹ Generating intelligence report...', 'info');
  setTimeout(() => showToast('âœ… Report ready for download', 'success'), 2200);
});

$('exportNetworkBtn')?.addEventListener('click', () => showToast('ðŸ“¤ Exporting network graph as SVG...', 'info'));
$('flagNetworkBtn')?.addEventListener('click', () => showToast('ðŸš¨ Network flagged for priority investigation', 'warning'));
$('exportFraudTable')?.addEventListener('click', () => showToast('ðŸ“Š Exporting fraud network data as CSV...', 'info'));
$('exportCounterCases')?.addEventListener('click', () => showToast('ðŸ“„ Exporting counterfeit cases report...', 'info'));
$('exportFraudTable')?.addEventListener('click', () => showToast('ðŸ“Š Exporting data...', 'info'));

// â”€â”€â”€ INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Start dashboard
navigateTo('dashboard');

// Live threat counter animations
setInterval(() => {
  const nodeCount = $('nodeCount');
  const edgeCount = $('edgeCount');
  if (nodeCount) nodeCount.textContent = rand(138, 146);
  if (edgeCount) edgeCount.textContent = rand(384, 396);
}, 3000);

// Global keyboard shortcut
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    $('globalSearch')?.focus();
  }
});

console.log('%c SENTINEL AI â€” Digital Public Safety Intelligence Platform ', 'background:#00d4ff;color:#050d1a;font-weight:bold;padding:4px 8px;border-radius:4px;');
console.log('%c Protecting citizens Â· Disrupting fraud Â· Neutralising threats ', 'color:#7c3aed;font-size:11px');

