/* ═══════════════════════════════════════════════════════
   SENTINEL AI — API Integration Layer
   Loaded BEFORE app.js to set up auth, API helpers, and WS
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ─── Token helpers ─── */
window.SENTINEL = window.SENTINEL || {};

SENTINEL.getToken = () => localStorage.getItem('sentinel_token');
SENTINEL.getUser  = () => { try { return JSON.parse(localStorage.getItem('sentinel_user') || '{}'); } catch(_){ return {}; } };

/* ─── API fetch wrapper ─── */
SENTINEL.api = async function(endpoint, options = {}) {
  const token   = SENTINEL.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  try {
    const res = await fetch(endpoint, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('sentinel_token');
      localStorage.removeItem('sentinel_user');
      window.location.href = '/login.html';
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('[SENTINEL API]', endpoint, err.message);
    return null;
  }
};

/* ─── Auth guard — redirect to login if no token ─── */
(function() {
  const token = SENTINEL.getToken();
  if (!token && !window.location.pathname.includes('login')) {
    window.location.href = '/login.html';
  }
})();

/* ─── Inject user info into sidebar ─── */
document.addEventListener('DOMContentLoaded', () => {
  const user = SENTINEL.getUser();
  if (!user || !user.full_name) return;

  const nameEl   = document.querySelector('.agent-name');
  const roleEl   = document.querySelector('.agent-role');
  const avatarEl = document.querySelector('.agent-avatar');
  const badgeEl  = document.querySelector('.badge-number');

  if (nameEl)   nameEl.textContent   = user.full_name;
  if (roleEl)   roleEl.textContent   = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Officer';
  if (badgeEl && user.badge_number)  badgeEl.textContent = user.badge_number;
  if (avatarEl && user.full_name) {
    const parts = user.full_name.split(' ');
    avatarEl.textContent = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  // Wire logout button
  const logoutBtns = document.querySelectorAll('[data-action="logout"]');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      try { await SENTINEL.api('/api/auth/logout', { method: 'POST' }); } catch(_) {}
      localStorage.removeItem('sentinel_token');
      localStorage.removeItem('sentinel_user');
      window.location.href = '/login.html';
    });
  });
});

/* ─── WebSocket client ─── */
SENTINEL.ws = null;
let _wsReconnectTimer = null;

SENTINEL.initWS = function() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const url   = proto + '//' + location.host + '/ws';

  try {
    SENTINEL.ws = new WebSocket(url);

    SENTINEL.ws.onopen = () => {
      clearTimeout(_wsReconnectTimer);
      console.log('[SENTINEL WS] Connected');
    };

    SENTINEL.ws.onclose = () => {
      _wsReconnectTimer = setTimeout(SENTINEL.initWS, 5000);
    };

    SENTINEL.ws.onerror = () => { SENTINEL.ws.close(); };

    SENTINEL.ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        SENTINEL.handleWSEvent(msg);
      } catch(_) {}
    };
  } catch(err) {
    console.warn('[SENTINEL WS] Could not connect:', err.message);
  }
};

SENTINEL.handleWSEvent = function(msg) {
  const $ = id => document.getElementById(id);

  switch (msg.type) {
    case 'NEW_ALERT': {
      const a = msg.alert;

      // Increment badge
      const badge = $('alertBadge');
      if (badge) badge.textContent = parseInt(badge.textContent || '0') + 1;

      // Inject into alerts feed
      const feed = $('alertsFeed');
      if (feed) {
        const div = document.createElement('div');
        div.className = 'alert-item';
        div.innerHTML =
          '<div class="alert-item-dot ' + a.level + '"></div>' +
          '<div class="alert-item-content">' +
            '<div class="alert-item-title">' + (a.title||'') + '</div>' +
            '<div class="alert-item-desc">' + (a.description||'') + '</div>' +
          '</div>' +
          '<div class="alert-item-time">Just now</div>';
        div.style.animation = 'slideIn 0.4s ease';
        feed.prepend(div);
        if (feed.children.length > 12) feed.removeChild(feed.lastChild);
      }

      // Toast notification
      if (typeof showToast === 'function') {
        const icon = a.level === 'critical' ? '🚨' : a.level === 'high' ? '⚠️' : 'ℹ️';
        const type = a.level === 'critical' ? 'error' : a.level === 'high' ? 'warning' : 'info';
        showToast(icon + ' ' + a.title, type);
      }
      break;
    }

    case 'STATS_UPDATE': {
      if (!msg.stats) break;
      const s   = msg.stats;
      const el  = $('kpiThreats');
      if (el) el.textContent = ((s.active_alerts||0) + (s.active_campaigns||0)*5).toLocaleString();

      // Update unread alert badge
      const badge = $('alertBadge');
      if (badge && s.active_alerts > 0) badge.textContent = s.active_alerts;
      break;
    }

    case 'NEW_IOC': {
      const feed = $('iocFeed');
      if (feed && msg.ioc) {
        const ioc = msg.ioc;
        const div = document.createElement('div');
        div.className = 'ioc-item';
        div.innerHTML =
          '<span class="ioc-badge ioc-' + ioc.ioc_type + '">' + ioc.ioc_type.toUpperCase() + '</span>' +
          '<code class="ioc-value">' + ioc.value + '</code>' +
          '<span class="ioc-sev sev-' + ioc.severity + '">' + ioc.severity + '</span>' +
          '<span class="ioc-src">' + (ioc.source||'AI') + '</span>';
        div.style.animation = 'slideIn 0.3s ease';
        feed.prepend(div);
        if (feed.children.length > 25) feed.removeChild(feed.lastChild);
      }
      break;
    }

    case 'PONG':
      break;
  }
};

/* Ping to keep WS alive */
setInterval(() => {
  if (SENTINEL.ws && SENTINEL.ws.readyState === 1) {
    SENTINEL.ws.send(JSON.stringify({ type: 'PING' }));
  }
}, 30000);

/* ─── API data loaders used by modules ─── */
SENTINEL.loadDashboardStats = async function() {
  const data = await SENTINEL.api('/api/dashboard/stats');
  if (!data || !data.success) return null;
  return data.data;
};

SENTINEL.loadAlerts = async function(limit = 15) {
  const data = await SENTINEL.api('/api/threats/alerts?limit=' + limit);
  if (!data || !data.success) return [];
  return data.data;
};

SENTINEL.loadFraudNetworks = async function(limit = 20) {
  const data = await SENTINEL.api('/api/fraud/networks?limit=' + limit);
  if (!data || !data.success) return [];
  return data.data;
};

SENTINEL.loadFraudGraph = async function() {
  const data = await SENTINEL.api('/api/fraud/graph');
  if (!data || !data.success) return { nodes: [], edges: [] };
  return data.data;
};

SENTINEL.loadCases = async function(limit = 20) {
  const data = await SENTINEL.api('/api/cases?limit=' + limit);
  if (!data || !data.success) return [];
  return data.data;
};

SENTINEL.loadCampaigns = async function(limit = 20) {
  const data = await SENTINEL.api('/api/scams/campaigns?limit=' + limit);
  if (!data || !data.success) return [];
  return data.data;
};

SENTINEL.loadCounterfeitCases = async function(limit = 20) {
  const data = await SENTINEL.api('/api/counterfeit/cases?limit=' + limit);
  if (!data || !data.success) return [];
  return data.data;
};

SENTINEL.loadIOC = async function(limit = 30) {
  const data = await SENTINEL.api('/api/threats/ioc?limit=' + limit);
  if (!data || !data.success) return [];
  return data.data;
};

SENTINEL.loadActors = async function() {
  const data = await SENTINEL.api('/api/threats/actors');
  if (!data || !data.success) return [];
  return data.data;
};

SENTINEL.loadPredictions = async function() {
  const data = await SENTINEL.api('/api/analytics/predictions');
  if (!data || !data.success) return [];
  return data.data;
};

SENTINEL.submitCitizenReport = async function(body) {
  return SENTINEL.api('/api/citizen/report', { method: 'POST', body: JSON.stringify(body) });
};

SENTINEL.verifyContact = async function(contact) {
  return SENTINEL.api('/api/citizen/verify', { method: 'POST', body: JSON.stringify({ contact }) });
};

SENTINEL.selfCheck = async function(value) {
  return SENTINEL.api('/api/citizen/selfcheck', { method: 'POST', body: JSON.stringify({ value }) });
};

SENTINEL.runCounterfeitAnalysis = async function(formData) {
  const token = SENTINEL.getToken();
  const headers = {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch('/api/counterfeit/analyse', { method: 'POST', headers, body: formData });
  return res.json();
};

SENTINEL.updateCaseStatus = async function(caseId, status) {
  return SENTINEL.api('/api/cases/' + caseId, { method: 'PATCH', body: JSON.stringify({ status }) });
};

SENTINEL.takedownCampaign = async function(campaignId) {
  return SENTINEL.api('/api/scams/campaigns/' + campaignId + '/takedown', { method: 'PATCH' });
};

SENTINEL.updateNetworkStatus = async function(networkId, status) {
  return SENTINEL.api('/api/fraud/networks/' + networkId + '/status', { method: 'PATCH', body: JSON.stringify({ status }) });
};

SENTINEL.generateReport = async function(type, period) {
  return SENTINEL.api('/api/analytics/report', { method: 'POST', body: JSON.stringify({ report_type: type, period }) });
};

console.log('%c SENTINEL AI — API layer loaded ', 'background:#00d4ff;color:#050d1a;font-weight:bold;padding:2px 6px;border-radius:3px;');

/* ─── Fast Boot Sequence ─── */
window.bootPlatform = async function() {
  const screen = document.getElementById('loadingScreen');
  if (!screen) { SENTINEL.initWS(); return; }

  const statusEl = document.getElementById('loadingStatus');
  const bar = document.getElementById('loadingBar');

  if (statusEl) statusEl.textContent = 'Platform ready. Welcome.';
  if (bar) bar.style.width = '100%';

  try {
    const data = await SENTINEL.api('/api/dashboard/stats');
    if (data && data.success && typeof state !== 'undefined') {
      state.dbStats = data.data;
    }
  } catch(_) {}

  SENTINEL.initWS();

  setTimeout(() => {
    screen.style.transition = 'opacity 0.2s, transform 0.2s';
    screen.style.opacity = '0';
    screen.style.transform = 'scale(1.02)';
    setTimeout(() => { screen.style.display = 'none'; }, 200);
  }, 100);
};
