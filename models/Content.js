const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'site_content',
    unique: true
  },
  // Basic & Contact Details
  doctorName: {
    type: String,
    default: 'Dr. Priyadarshini Lingaraj'
  },
  qualifications: {
    type: String,
    default: 'MBBS, DNB (OBG), MRCOG (UK), EFOG-EBCOG, FACOG (USA)'
  },
  designation: {
    type: String,
    default: 'Specialist Obstetrician & Gynaecologist | Laparoscopic Surgeon'
  },
  phone: {
    type: String,
    default: '+971 50 474 8567'
  },
  whatsapp: {
    type: String,
    default: '+971 50 474 8567'
  },
  email: {
    type: String,
    default: 'drpriyadharshini89@gmail.com'
  },
  hospital: {
    type: String,
    default: 'NMC Speciality Hospital, Abu Dhabi'
  },
  clinicAddress: {
    type: String,
    default: 'Zayed The First St, Near Sama Tower, Al Danah, Zone 1, Abu Dhabi, UAE'
  },
  haadLicense: {
    type: String,
    default: 'GD37938'
  },
  dhaLicense: {
    type: String,
    default: '32916603'
  },

  // Social Links
  socials: {
    instagram: {
      type: String,
      default: 'https://www.instagram.com/drpriyadarshinilingaraj/'
    },
    linkedin: {
      type: String,
      default: 'https://www.linkedin.com/in/dr-priya-darshini-42ba091a8/'
    },
    facebook: {
      type: String,
      default: 'https://www.facebook.com/drpriyadarshinilingaraj'
    },
    youtube: {
      type: String,
      default: 'https://www.youtube.com/@drpriyadarshinilingaraj'
    },
    whatsapp: {
      type: String,
      default: 'https://wa.me/971504748567'
    }
  },

  // Hero Section
  hero: {
    tagline: {
      type: String,
      default: 'Compassionate, Evidence-Based Healthcare for Women'
    },
    titleLine1: {
      type: String,
      default: 'Holistic & Advanced'
    },
    titleLine2: {
      type: String,
      default: "Women's Health Care"
    },
    description: {
      type: String,
      default: 'Specialist Obstetrician & Gynaecologist dedicated to high-risk pregnancies, advanced minimally invasive surgery, and comprehensive women’s wellness across all life stages.'
    },
    experiencePill: {
      type: String,
      default: '12+ Years Excellence'
    },
    imageUrl: {
      type: String,
      default: 'assets/dr-priya-hero-clean.png'
    }
  },

  // Key Stats
  stats: {
    stat1Val: { type: String, default: '12+' },
    stat1Label: { type: String, default: 'Years of Surgical Excellence' },
    stat2Val: { type: String, default: '15,000+' },
    stat2Label: { type: String, default: 'Satisfied Patient Consultations' },
    stat3Val: { type: String, default: '5,000+' },
    stat3Label: { type: String, default: 'Successful Deliveries Managed' },
    stat4Val: { type: String, default: '850+' },
    stat4Label: { type: String, default: 'Minimally Invasive Surgeries' }
  },

  // About Section
  about: {
    badge: { type: String, default: 'ABOUT DR. PRIYADARSHINI' },
    heading: { type: String, default: 'Dedicated to Empowering Women Through Every Stage of Life' },
    leadParagraph: { type: String, default: 'Dr. Priyadarshini Lingaraj is a renowned Specialist Obstetrician and Gynaecologist with over 12 years of clinical excellence in the UAE and India.' },
    bioParagraph: { type: String, default: 'Holding elite international fellowships including MRCOG (London), EFOG-EBCOG (Europe), and FACOG (USA), she combines surgical precision with a compassionate, patient-first approach.' },
    imageUrl: { type: String, default: 'assets/about-doctor-flawless.png' }
  },

  // MedCafe Details
  medcafe: {
    role: { type: String, default: 'Chief Executive Officer (CEO) – MedCafe' },
    description: { type: String, default: 'Leading MedCafe, a global collaborative platform for doctors, dedicated to fostering professional collaboration, medical knowledge exchange, education, and networking among healthcare professionals worldwide.' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', ContentSchema);
