/**
 * DR. PRIYADARSHINI LINGARAJ - ADMIN DASHBOARD CLIENT
 * Full interactive controller for enquiries, weekly schedule, CMS & media.
 */

// API Base URL - works whether hosted locally, with custom domain, or proxy
const API_BASE = window.location.origin;

let adminToken = localStorage.getItem('dr_priya_admin_token') || '';
let currentEnquiries = [];
let currentSchedule = null;
let currentContent = null;
let activeFilter = 'All';
let activeEnquiryForModal = null;

// DOM Elements
const loginOverlay = document.getElementById('loginOverlay');
const adminApp = document.getElementById('adminApp');
const loginForm = document.getElementById('loginForm');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Navigation & Tabs
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
const tabPanes = document.querySelectorAll('.tab-pane');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const sidebarNewCount = document.getElementById('sidebarNewCount');
const btnRefreshCurrent = document.getElementById('btnRefreshCurrent');

// Mobile Sidebar
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const adminSidebar = document.getElementById('adminSidebar');

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  setupAuthEvents();
  setupNavEvents();
  setupEnquiriesEvents();
  setupScheduleEvents();
  setupContentEvents();
  setupMediaEvents();

  // Check existing token
  if (adminToken) {
    verifySession();
  } else {
    showLogin();
  }
});

// ─────────────────────────────────────────────────────────────
// TOAST NOTIFICATION UTILITY
// ─────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'check-circle' : 'alert-circle';
  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─────────────────────────────────────────────────────────────
// AUTHENTICATION
// ─────────────────────────────────────────────────────────────
function setupAuthEvents() {
  togglePasswordBtn.addEventListener('click', () => {
    const isPass = adminPassword.type === 'password';
    adminPassword.type = isPass ? 'text' : 'password';
    togglePasswordBtn.innerHTML = `<i data-lucide="${isPass ? 'eye-off' : 'eye'}"></i>`;
    if (window.lucide) lucide.createIcons();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';

    const submitBtn = document.getElementById('loginSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Verifying...';

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.value.trim(),
          password: adminPassword.value.trim()
        })
      });
      const data = await res.json();

      if (data.success && data.token) {
        adminToken = data.token;
        localStorage.setItem('dr_priya_admin_token', adminToken);
        showToast('Welcome back, Admin!', 'success');
        hideLogin();
        loadAllData();
      } else {
        loginError.textContent = data.message || 'Invalid username or password.';
        loginError.style.display = 'block';
      }
    } catch (err) {
      loginError.textContent = 'Network or server error. Please ensure backend is running.';
      loginError.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Sign In to Admin Panel</span><i data-lucide="arrow-right"></i>';
      if (window.lucide) lucide.createIcons();
    }
  });

  logoutBtn.addEventListener('click', () => {
    adminToken = '';
    localStorage.removeItem('dr_priya_admin_token');
    showLogin();
    showToast('Signed out successfully.');
  });
}

async function verifySession() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/verify`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      hideLogin();
      loadAllData();
    } else {
      showLogin();
    }
  } catch (err) {
    showLogin();
  }
}

function showLogin() {
  loginOverlay.style.display = 'flex';
  adminApp.style.display = 'none';
}

function hideLogin() {
  loginOverlay.style.display = 'none';
  adminApp.style.display = 'flex';
}

// ─────────────────────────────────────────────────────────────
// NAVIGATION & TABS
// ─────────────────────────────────────────────────────────────
const tabTitles = {
  'tab-enquiries': {
    title: 'Patient Enquiries & Consultations',
    subtitle: 'Real-time consultation submissions stored directly in MongoDB Atlas'
  },
  'tab-schedule': {
    title: 'Weekly Clinic Timings (Mon–Sun)',
    subtitle: 'Manage daily open/close hours, emergency coverage, and appointment notes'
  },
  'tab-content': {
    title: 'Website Content & Details CMS',
    subtitle: 'Edit doctor credentials, phone numbers, addresses, stats, and text'
  },
  'tab-images': {
    title: 'Website Images & Media Manager',
    subtitle: 'Upload and replace portraits of Dr. Priyadarshini and clinic facilities'
  }
};

function setupNavEvents() {
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (!targetTab) return;

      navItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === targetTab) {
          pane.classList.add('active');
        }
      });

      if (tabTitles[targetTab]) {
        pageTitle.textContent = tabTitles[targetTab].title;
        pageSubtitle.textContent = tabTitles[targetTab].subtitle;
      }

      // Close mobile sidebar if open
      if (adminSidebar.classList.contains('open')) {
        adminSidebar.classList.remove('open');
      }
    });
  });

  openSidebarBtn.addEventListener('click', () => adminSidebar.classList.add('open'));
  closeSidebarBtn.addEventListener('click', () => adminSidebar.classList.remove('open'));

  btnRefreshCurrent.addEventListener('click', () => {
    btnRefreshCurrent.disabled = true;
    loadAllData().then(() => {
      btnRefreshCurrent.disabled = false;
      showToast('Dashboard refreshed with latest MongoDB data.');
    });
  });
}

function loadAllData() {
  return Promise.all([
    fetchEnquiries(),
    fetchSchedule(),
    fetchContent()
  ]);
}

// ─────────────────────────────────────────────────────────────
// 1. ENQUIRIES TAB (MONGODB)
// ─────────────────────────────────────────────────────────────
function setupEnquiriesEvents() {
  // Status filter pills
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-filter');
      renderEnquiries();
    });
  });

  // Search box
  const searchInput = document.getElementById('searchEnquiries');
  searchInput.addEventListener('input', () => {
    renderEnquiries();
  });

  // Export CSV
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);

  // Modal events
  const enquiryModal = document.getElementById('enquiryModal');
  const closeEnquiryModalBtn = document.getElementById('closeEnquiryModalBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalSaveNotesBtn = document.getElementById('modalSaveNotesBtn');

  closeEnquiryModalBtn.addEventListener('click', () => enquiryModal.style.display = 'none');
  modalCloseBtn.addEventListener('click', () => enquiryModal.style.display = 'none');

  modalSaveNotesBtn.addEventListener('click', async () => {
    if (!activeEnquiryForModal) return;
    const newStatus = document.getElementById('modalStatusSelect').value;
    const newNotes = document.getElementById('modalNotesTextarea').value;

    try {
      const res = await fetch(`${API_BASE}/api/admin/enquiries/${activeEnquiryForModal._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus, notes: newNotes })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Enquiry updated successfully.');
        enquiryModal.style.display = 'none';
        fetchEnquiries();
      } else {
        showToast(data.message || 'Error updating enquiry', 'error');
      }
    } catch (err) {
      showToast('Failed to save notes.', 'error');
    }
  });
}

async function fetchEnquiries() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/enquiries`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      currentEnquiries = data.enquiries || [];
      updateStats();
      renderEnquiries();
    }
  } catch (err) {
    console.error('Error loading enquiries:', err);
  }
}

function updateStats() {
  const total = currentEnquiries.length;
  const newCount = currentEnquiries.filter(e => e.status === 'New').length;
  const contacted = currentEnquiries.filter(e => e.status === 'Contacted').length;
  const confirmed = currentEnquiries.filter(e => e.status === 'Confirmed').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statNew').textContent = newCount;
  document.getElementById('statContacted').textContent = contacted;
  document.getElementById('statConfirmed').textContent = confirmed;

  sidebarNewCount.textContent = newCount;
  sidebarNewCount.style.display = newCount > 0 ? 'inline-block' : 'none';
}

function renderEnquiries() {
  const tbody = document.getElementById('enquiriesTableBody');
  const search = document.getElementById('searchEnquiries').value.toLowerCase().trim();

  let filtered = currentEnquiries;
  if (activeFilter !== 'All') {
    filtered = filtered.filter(e => e.status === activeFilter);
  }
  if (search) {
    filtered = filtered.filter(e => 
      (e.name && e.name.toLowerCase().includes(search)) ||
      (e.phone && e.phone.toLowerCase().includes(search)) ||
      (e.email && e.email.toLowerCase().includes(search)) ||
      (e.service && e.service.toLowerCase().includes(search))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No consultation enquiries found in MongoDB for this filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(enq => {
    const cleanPhone = enq.phone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hello ${enq.name}, thank you for contacting Dr. Priyadarshini Lingaraj regarding ${enq.service}. How can we assist you with scheduling your consultation?`);
    const waLink = `https://wa.me/${cleanPhone}?text=${waText}`;
    const dateFormatted = new Date(enq.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const statusBadgeClass = `badge-${enq.status.toLowerCase()}`;

    return `
      <tr>
        <td>
          <div class="patient-info">
            <span class="patient-name">${escapeHtml(enq.name)}</span>
            <div class="patient-contact">
              <span><i data-lucide="phone" style="width:12px;height:12px;"></i> ${escapeHtml(enq.phone)}</span>
              ${enq.email ? `<span><i data-lucide="mail" style="width:12px;height:12px;"></i> ${escapeHtml(enq.email)}</span>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 600; color: var(--primary-teal);">${escapeHtml(enq.service || 'General Consultation')}</span>
        </td>
        <td>
          <div style="font-size: 0.85rem;">
            <div><strong>${enq.preferredDate || 'Flexible / Any'}</strong></div>
            <div style="color: var(--text-muted);">${enq.preferredTime || 'Standard Hours'}</div>
          </div>
        </td>
        <td>
          <select class="status-select status-badge ${statusBadgeClass}" onchange="changeEnquiryStatus('${enq._id}', this.value)" style="border:none; cursor:pointer; font-weight:700;">
            <option value="New" ${enq.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Contacted" ${enq.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Confirmed" ${enq.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Completed" ${enq.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Cancelled" ${enq.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${dateFormatted}</td>
        <td>
          <div class="action-btns">
            <a href="${waLink}" target="_blank" rel="noopener" class="btn-icon btn-whatsapp-action" title="Send WhatsApp Message">
              <i data-lucide="message-circle"></i>
            </a>
            <a href="tel:${enq.phone}" class="btn-icon btn-call-action" title="Call Patient">
              <i data-lucide="phone-call"></i>
            </a>
            <button class="btn-icon" onclick="openEnquiryModal('${enq._id}')" title="View Details & Notes">
              <i data-lucide="eye"></i>
            </button>
            <button class="btn-icon btn-delete-action" onclick="deleteEnquiry('${enq._id}')" title="Delete">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

window.changeEnquiryStatus = async function(id, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Status updated to ${newStatus}`);
      fetchEnquiries();
    }
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
};

window.openEnquiryModal = function(id) {
  const enq = currentEnquiries.find(e => e._id === id);
  if (!enq) return;
  activeEnquiryForModal = enq;

  document.getElementById('modalPatientName').textContent = `Enquiry: ${enq.name}`;
  const modalContent = document.getElementById('modalEnquiryContent');
  modalContent.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem;">
      <div><strong>Patient Name:</strong> ${escapeHtml(enq.name)}</div>
      <div><strong>Phone / WhatsApp:</strong> <a href="tel:${enq.phone}">${escapeHtml(enq.phone)}</a></div>
      <div><strong>Email:</strong> ${enq.email ? `<a href="mailto:${enq.email}">${escapeHtml(enq.email)}</a>` : 'Not provided'}</div>
      <div><strong>Service:</strong> ${escapeHtml(enq.service)}</div>
      <div><strong>Preferred Schedule:</strong> ${enq.preferredDate || 'Flexible'} (${enq.preferredTime || 'Any time'})</div>
      <div><strong>Patient Message:</strong></div>
      <div style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0; font-style: italic;">
        ${escapeHtml(enq.message || 'No additional notes provided by patient.')}
      </div>
      
      <div style="margin-top: 10px;">
        <label style="font-weight: 600; display: block; margin-bottom: 6px;">Update Status:</label>
        <select id="modalStatusSelect" style="width: 100%; padding: 8px; border-radius: 6px; border: 1.5px solid #E2E8F0;">
          <option value="New" ${enq.status === 'New' ? 'selected' : ''}>New</option>
          <option value="Contacted" ${enq.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
          <option value="Confirmed" ${enq.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Completed" ${enq.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Cancelled" ${enq.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </div>

      <div>
        <label style="font-weight: 600; display: block; margin-bottom: 6px;">Doctor / Clinic Internal Notes:</label>
        <textarea id="modalNotesTextarea" rows="3" placeholder="Add follow-up notes, patient history, or clinical appointment details..." style="width: 100%; padding: 8px; border-radius: 6px; border: 1.5px solid #E2E8F0; font-family: inherit;">${escapeHtml(enq.notes || '')}</textarea>
      </div>
    </div>
  `;

  document.getElementById('enquiryModal').style.display = 'flex';
};

window.deleteEnquiry = async function(id) {
  if (!confirm('Are you sure you want to permanently delete this enquiry from MongoDB?')) {
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/admin/enquiries/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('Enquiry deleted successfully.');
      fetchEnquiries();
    }
  } catch (err) {
    showToast('Failed to delete enquiry.', 'error');
  }
};

function exportToCsv() {
  if (!currentEnquiries || currentEnquiries.length === 0) {
    showToast('No enquiries to export.', 'error');
    return;
  }

  const headers = ['Patient Name', 'Phone', 'Email', 'Service', 'Preferred Date', 'Preferred Time', 'Status', 'Date Received', 'Message', 'Notes'];
  const rows = currentEnquiries.map(e => [
    `"${(e.name || '').replace(/"/g, '""')}"`,
    `"${(e.phone || '').replace(/"/g, '""')}"`,
    `"${(e.email || '').replace(/"/g, '""')}"`,
    `"${(e.service || '').replace(/"/g, '""')}"`,
    `"${(e.preferredDate || '').replace(/"/g, '""')}"`,
    `"${(e.preferredTime || '').replace(/"/g, '""')}"`,
    `"${(e.status || '').replace(/"/g, '""')}"`,
    `"${new Date(e.createdAt).toISOString()}"`,
    `"${(e.message || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Dr_Priya_Enquiries_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// ─────────────────────────────────────────────────────────────
// 2. WEEKLY SCHEDULE MANAGER (MON–SUN)
// ─────────────────────────────────────────────────────────────
const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function setupScheduleEvents() {
  document.getElementById('btnSaveSchedule').addEventListener('click', saveSchedule);
}

async function fetchSchedule() {
  try {
    const res = await fetch(`${API_BASE}/api/schedule`);
    const data = await res.json();
    if (data.success && data.schedule) {
      currentSchedule = data.schedule;
      renderScheduleForm();
    }
  } catch (err) {
    console.error('Error fetching schedule:', err);
  }
}

function renderScheduleForm() {
  if (!currentSchedule) return;

  document.getElementById('schedGeneralHours').value = currentSchedule.generalHoursText || 'Monday – Sunday: 8:30 AM – 8:30 PM';
  document.getElementById('schedNotice').value = currentSchedule.notice || '(For exact timing kindly connect the customer care)';

  const container = document.getElementById('scheduleDaysList');
  const daysMap = {};
  (currentSchedule.days || []).forEach(d => { daysMap[d.day] = d; });

  container.innerHTML = DAYS_ORDER.map(dayName => {
    const dayData = daysMap[dayName] || {
      day: dayName,
      isOpen: true,
      openTime: '08:30 AM',
      closeTime: '08:30 PM',
      statusText: 'Open',
      customNote: ''
    };

    return `
      <div class="schedule-day-row" data-day="${dayName}">
        <div class="day-identity">
          <label class="switch">
            <input type="checkbox" class="day-open-toggle" ${dayData.isOpen ? 'checked' : ''} onchange="toggleDayRow('${dayName}', this.checked)" />
            <span class="slider"></span>
          </label>
          <span class="day-title">${dayName}</span>
        </div>

        <div class="day-timing-controls" id="timingControls_${dayName}" style="${dayData.isOpen ? '' : 'opacity: 0.5; pointer-events: none;'}">
          <div class="time-input-group">
            <label>From:</label>
            <input type="text" class="day-open-time" value="${escapeHtml(dayData.openTime || '08:30 AM')}" placeholder="08:30 AM" />
          </div>
          <div class="time-input-group">
            <label>To:</label>
            <input type="text" class="day-close-time" value="${escapeHtml(dayData.closeTime || '08:30 PM')}" placeholder="08:30 PM" />
          </div>
          <div class="time-input-group">
            <label>Status:</label>
            <input type="text" class="day-status-text" value="${escapeHtml(dayData.statusText || 'Open')}" placeholder="Open / By Appt" style="width: 130px;" />
          </div>
          <div class="day-custom-note">
            <input type="text" class="day-note" value="${escapeHtml(dayData.customNote || '')}" placeholder="Optional note for this day..." />
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.toggleDayRow = function(dayName, isChecked) {
  const controls = document.getElementById(`timingControls_${dayName}`);
  if (controls) {
    controls.style.opacity = isChecked ? '1' : '0.5';
    controls.style.pointerEvents = isChecked ? 'auto' : 'none';
  }
};

async function saveSchedule() {
  const saveBtn = document.getElementById('btnSaveSchedule');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> Saving to MongoDB...';

  const generalHoursText = document.getElementById('schedGeneralHours').value.trim();
  const notice = document.getElementById('schedNotice').value.trim();

  const dayRows = document.querySelectorAll('.schedule-day-row');
  const days = [];

  dayRows.forEach(row => {
    const day = row.getAttribute('data-day');
    const isOpen = row.querySelector('.day-open-toggle').checked;
    const openTime = row.querySelector('.day-open-time').value.trim();
    const closeTime = row.querySelector('.day-close-time').value.trim();
    const statusText = row.querySelector('.day-status-text').value.trim();
    const customNote = row.querySelector('.day-note').value.trim();

    days.push({ day, isOpen, openTime, closeTime, statusText, customNote });
  });

  try {
    const res = await fetch(`${API_BASE}/api/admin/schedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ generalHoursText, notice, days })
    });
    const data = await res.json();
    if (data.success) {
      currentSchedule = data.schedule;
      showToast('Weekly schedule updated successfully in MongoDB Atlas!');
    } else {
      showToast(data.message || 'Error saving schedule', 'error');
    }
  } catch (err) {
    showToast('Failed to save schedule.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i data-lucide="save"></i> <span>Save Weekly Schedule</span>';
    if (window.lucide) lucide.createIcons();
  }
}

// ─────────────────────────────────────────────────────────────
// 3. CONTENT CMS
// ─────────────────────────────────────────────────────────────
function setupContentEvents() {
  document.getElementById('btnSaveContent').addEventListener('click', saveContent);
}

async function fetchContent() {
  try {
    const res = await fetch(`${API_BASE}/api/content`);
    const data = await res.json();
    if (data.success && data.content) {
      currentContent = data.content;
      populateContentFields();
    }
  } catch (err) {
    console.error('Error fetching content:', err);
  }
}

function populateContentFields() {
  if (!currentContent) return;
  const c = currentContent;

  // Contact
  setVal('cmsPhone', c.phone);
  setVal('cmsWhatsapp', c.whatsapp);
  setVal('cmsEmail', c.email);
  setVal('cmsHospital', c.hospital);
  setVal('cmsHaad', c.haadLicense);
  setVal('cmsDha', c.dhaLicense);
  setVal('cmsAddress', c.clinicAddress);

  // Socials
  if (c.socials) {
    setVal('cmsInstagram', c.socials.instagram);
    setVal('cmsLinkedin', c.socials.linkedin);
    setVal('cmsFacebook', c.socials.facebook);
    setVal('cmsYoutube', c.socials.youtube);
  }

  // Hero
  if (c.hero) {
    setVal('cmsHeroTagline', c.hero.tagline);
    setVal('cmsHeroTitle1', c.hero.titleLine1);
    setVal('cmsHeroTitle2', c.hero.titleLine2);
    setVal('cmsHeroDesc', c.hero.description);
    setVal('cmsHeroExpBadge', c.hero.experiencePill);
    if (c.hero.imageUrl) {
      document.getElementById('previewHeroImage').src = c.hero.imageUrl;
      setVal('heroImagePathInput', c.hero.imageUrl);
    }
  }

  // Stats
  if (c.stats) {
    setVal('cmsStat1Val', c.stats.stat1Val);
    setVal('cmsStat1Label', c.stats.stat1Label);
    setVal('cmsStat2Val', c.stats.stat2Val);
    setVal('cmsStat2Label', c.stats.stat2Label);
    setVal('cmsStat3Val', c.stats.stat3Val);
    setVal('cmsStat3Label', c.stats.stat3Label);
    setVal('cmsStat4Val', c.stats.stat4Val);
    setVal('cmsStat4Label', c.stats.stat4Label);
  }

  // About Image
  if (c.about && c.about.imageUrl) {
    document.getElementById('previewAboutImage').src = c.about.imageUrl;
    setVal('aboutImagePathInput', c.about.imageUrl);
  }

  // Medcafe
  if (c.medcafe) {
    setVal('cmsMedcafeRole', c.medcafe.role);
    setVal('cmsMedcafeDesc', c.medcafe.description);
  }
}

async function saveContent() {
  const saveBtn = document.getElementById('btnSaveContent');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> Saving to MongoDB...';

  const updates = {
    phone: getVal('cmsPhone'),
    whatsapp: getVal('cmsWhatsapp'),
    email: getVal('cmsEmail'),
    hospital: getVal('cmsHospital'),
    haadLicense: getVal('cmsHaad'),
    dhaLicense: getVal('cmsDha'),
    clinicAddress: getVal('cmsAddress'),
    socials: {
      instagram: getVal('cmsInstagram'),
      linkedin: getVal('cmsLinkedin'),
      facebook: getVal('cmsFacebook'),
      youtube: getVal('cmsYoutube'),
      whatsapp: `https://wa.me/${getVal('cmsWhatsapp').replace(/[^0-9]/g, '')}`
    },
    hero: {
      tagline: getVal('cmsHeroTagline'),
      titleLine1: getVal('cmsHeroTitle1'),
      titleLine2: getVal('cmsHeroTitle2'),
      description: getVal('cmsHeroDesc'),
      experiencePill: getVal('cmsHeroExpBadge'),
      imageUrl: getVal('heroImagePathInput')
    },
    stats: {
      stat1Val: getVal('cmsStat1Val'),
      stat1Label: getVal('cmsStat1Label'),
      stat2Val: getVal('cmsStat2Val'),
      stat2Label: getVal('cmsStat2Label'),
      stat3Val: getVal('cmsStat3Val'),
      stat3Label: getVal('cmsStat3Label'),
      stat4Val: getVal('cmsStat4Val'),
      stat4Label: getVal('cmsStat4Label')
    },
    about: {
      imageUrl: getVal('aboutImagePathInput')
    },
    medcafe: {
      role: getVal('cmsMedcafeRole'),
      description: getVal('cmsMedcafeDesc')
    }
  };

  try {
    const res = await fetch(`${API_BASE}/api/admin/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (data.success) {
      currentContent = data.content;
      showToast('All website content updated successfully in MongoDB Atlas!');
    } else {
      showToast(data.message || 'Error saving content', 'error');
    }
  } catch (err) {
    showToast('Failed to save content.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i data-lucide="save"></i> <span>Save All Content</span>';
    if (window.lucide) lucide.createIcons();
  }
}

// ─────────────────────────────────────────────────────────────
// 4. IMAGE UPLOADS & MEDIA
// ─────────────────────────────────────────────────────────────
function setupMediaEvents() {
  // File inputs for hero and about images
  const fileInputs = document.querySelectorAll('.file-input-hidden');
  fileInputs.forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const targetInputId = input.getAttribute('data-target-input');
      const targetPreviewId = input.getAttribute('data-target-preview');

      const formData = new FormData();
      formData.append('image', file);

      showToast('Uploading image to server...', 'success');

      try {
        const res = await fetch(`${API_BASE}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          body: formData
        });
        const data = await res.json();
        if (data.success && data.url) {
          document.getElementById(targetInputId).value = data.url;
          document.getElementById(targetPreviewId).src = data.url;
          showToast('Image uploaded successfully! Remember to click Save.');
        } else {
          showToast(data.message || 'Upload failed', 'error');
        }
      } catch (err) {
        showToast('Image upload error.', 'error');
      }
    });
  });

  // Gallery choices
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const target = prompt('Set this image for:\nType "1" for Hero Photo\nType "2" for About Photo\nType "3" for Both', '1');
      if (target === '1' || target === '3') {
        document.getElementById('previewHeroImage').src = src;
        document.getElementById('heroImagePathInput').value = src;
      }
      if (target === '2' || target === '3') {
        document.getElementById('previewAboutImage').src = src;
        document.getElementById('aboutImagePathInput').value = src;
      }
      showToast(`Selected "${src}". Remember to save in Website Content CMS!`);
    });
  });
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) {
    el.value = val;
  }
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
