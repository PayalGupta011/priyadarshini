const dns = require('dns');
// Set robust public DNS servers to resolve MongoDB Atlas SRV records smoothly on Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const Enquiry = require('./models/Enquiry');
const Schedule = require('./models/Schedule');
const Content = require('./models/Content');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'priyadarshini_jwt_secret_2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@priya2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static files
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(__dirname));

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;
    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, SVG) are allowed!'));
    }
  }
});

// Admin Auth Middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin token missing.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }
}

// ─────────────────────────────────────────────────────────────
// DATABASE SEEDING HELPER
// ─────────────────────────────────────────────────────────────
async function initializeDefaults() {
  try {
    const existingSchedule = await Schedule.findOne({ key: 'clinic_schedule' });
    if (!existingSchedule) {
      console.log('Seeding default Monday-Sunday clinic schedule...');
      await Schedule.create({
        key: 'clinic_schedule',
        generalHoursText: 'Monday – Sunday: 8:30 AM – 8:30 PM',
        notice: '(For exact timing kindly connect the customer care)',
        days: [
          { day: 'Monday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
          { day: 'Tuesday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
          { day: 'Wednesday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
          { day: 'Thursday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
          { day: 'Friday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
          { day: 'Saturday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
          { day: 'Sunday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' }
        ]
      });
    }

    const existingContent = await Content.findOne({ key: 'site_content' });
    if (!existingContent) {
      console.log('Seeding default site content...');
      await Content.create({ key: 'site_content' });
    }
    console.log('Database defaults ready.');
  } catch (err) {
    console.error('Error during default initialization:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// PUBLIC APIs
// ─────────────────────────────────────────────────────────────

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Submit Enquiry / Appointment
app.post('/api/enquiries', async (req, res) => {
  try {
    const { name, phone, email, service, preferredDate, preferredTime, message, source } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required.' });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      email: email || '',
      service: service || 'General Consultation',
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || '',
      message: message || '',
      source: source || 'Website Form'
    });

    res.status(201).json({
      success: true,
      message: 'Your consultation request has been submitted successfully! We will connect with you soon.',
      enquiryId: enquiry._id
    });
  } catch (err) {
    console.error('Enquiry submission error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit enquiry. Please try again or WhatsApp directly.' });
  }
});

// Get Public Weekly Schedule
app.get('/api/schedule', async (req, res) => {
  try {
    let schedule = await Schedule.findOne({ key: 'clinic_schedule' });
    if (!schedule) {
      schedule = await Schedule.create({ key: 'clinic_schedule' });
    }
    res.json({ success: true, schedule });
  } catch (err) {
    console.error('Error fetching schedule:', err);
    res.status(500).json({ success: false, message: 'Could not load schedule' });
  }
});

// Get Public Site Content
app.get('/api/content', async (req, res) => {
  try {
    let content = await Content.findOne({ key: 'site_content' });
    if (!content) {
      content = await Content.create({ key: 'site_content' });
    }
    res.json({ success: true, content });
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ success: false, message: 'Could not load content' });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN AUTHENTICATION
// ─────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password.' });
    }

    if (username.trim() !== ADMIN_USERNAME || password.trim() !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: { username: ADMIN_USERNAME }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login error.' });
  }
});

app.get('/api/auth/verify', requireAdmin, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ─────────────────────────────────────────────────────────────
// PROTECTED ADMIN APIs
// ─────────────────────────────────────────────────────────────

// Dashboard Summary Stats
app.get('/api/admin/dashboard-stats', requireAdmin, async (req, res) => {
  try {
    const totalEnquiries = await Enquiry.countDocuments();
    const newEnquiries = await Enquiry.countDocuments({ status: 'New' });
    const contactedEnquiries = await Enquiry.countDocuments({ status: 'Contacted' });
    const confirmedEnquiries = await Enquiry.countDocuments({ status: 'Confirmed' });

    // Recent 5 enquiries
    const recentEnquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        total: totalEnquiries,
        newCount: newEnquiries,
        contacted: contactedEnquiries,
        confirmed: confirmedEnquiries
      },
      recent: recentEnquiries
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Enquiries (with search & status filter)
app.get('/api/admin/enquiries', requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { service: { $regex: q, $options: 'i' } }
      ];
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Enquiry Status or Notes
app.patch('/api/admin/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }
    res.json({ success: true, enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Enquiry
app.delete('/api/admin/enquiries/:id', requireAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }
    res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Weekly Schedule
app.put('/api/admin/schedule', requireAdmin, async (req, res) => {
  try {
    const { generalHoursText, notice, emergencyNote, days } = req.body;
    let schedule = await Schedule.findOne({ key: 'clinic_schedule' });
    if (!schedule) {
      schedule = new Schedule({ key: 'clinic_schedule' });
    }

    if (generalHoursText) schedule.generalHoursText = generalHoursText;
    if (notice !== undefined) schedule.notice = notice;
    if (emergencyNote !== undefined) schedule.emergencyNote = emergencyNote;
    if (Array.isArray(days) && days.length > 0) {
      schedule.days = days;
    }

    await schedule.save();
    res.json({ success: true, message: 'Weekly schedule updated successfully in MongoDB!', schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Site Content & Details (CMS)
app.put('/api/admin/content', requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    delete updates._id;
    delete updates.key;

    let content = await Content.findOneAndUpdate(
      { key: 'site_content' },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Site content & details updated successfully in MongoDB!', content });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Image Upload Endpoint
app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully!',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Catch-all route to serve index.html for unknown page paths
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  // If requesting a specific html file, let express static handle it, otherwise index
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─────────────────────────────────────────────────────────────
// START SERVER & CONNECT MONGODB
// ─────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://875payalgupta_db_user:Lu1IzNWzXVorvBJn@cluster0.45c447p.mongodb.net/drpriyadarshini?retryWrites=true&w=majority';

console.log('Connecting to MongoDB Atlas at:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    await initializeDefaults();
    app.listen(PORT, () => {
      console.log(`🚀 Dr. Priyadarshini Web Server running at http://localhost:${PORT}`);
      console.log(`🔑 Admin Panel available at http://localhost:${PORT}/admin.html`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    // Still start server so frontend can be accessed even during network retry
    app.listen(PORT, () => {
      console.log(`⚠️ Server running without MongoDB on port ${PORT}`);
    });
  });

module.exports = app;
