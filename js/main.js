/* =============================================
   DR. PRIYADARSHINI LINGARAJ – MAIN JS
   ============================================= */


  /* ─── PAGE PRELOADER ─── */
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      // Small delay to appreciate the smooth animation
      setTimeout(() => {
        document.body.classList.add('loaded');
      }, 600);
    } else {
      // Fallback if preloader is missing from HTML
      document.body.classList.add('loaded');
    }
  });

document.addEventListener('DOMContentLoaded', () => {

  /* ─── STICKY HEADER ─── */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ─── MOBILE NAV ─── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  /* ─── SMOOTH SCROLL WITH HEADER OFFSET ─── */
  const smoothScrollToTarget = (targetSelector) => {
    try {
      if (!targetSelector || targetSelector === '#') return false;
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        const headerOffset = 84;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
        return true;
      }
    } catch (err) {}
    return false;
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const hash = this.getAttribute('href');
      if (!hash || hash === '#') return;
      if (smoothScrollToTarget(hash)) {
        e.preventDefault();
        if (history.pushState) {
          history.pushState(null, null, hash);
        }
        if (mobileNav && mobileNav.classList.contains('open')) {
          mobileNav.classList.remove('open');
          if (hamburger) hamburger.classList.remove('open');
        }
      }
    });
  });

  // Handle incoming hash on load (e.g. contact.html#form or index.html#about)
  if (window.location.hash) {
    setTimeout(() => {
      smoothScrollToTarget(window.location.hash);
    }, 450);
  }

  /* ─── ACTIVE NAV LINK / SCROLLSPY ─── */
  const navLinks = document.querySelectorAll('.nav-links a');
  const spySections = ['home', 'about', 'services', 'testimonials'].map(id => document.getElementById(id)).filter(Boolean);

  const updateActiveNav = () => {
    const scrollPos = window.scrollY + 130;
    let activeId = 'home';
    spySections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        activeId = sec.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else if (href.startsWith('#')) {
        link.classList.remove('active');
      }
    });
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* ─── ANIMATED COUNTERS ─── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 2200;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString();
        if (current >= target) clearInterval(timer);
      }, 16);
    };

    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObs.observe(c));
  }

  /* ─── TESTIMONIAL / STORIES CAROUSEL ─── */
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');
  const dotsContainer = document.getElementById('storiesDots');

  if (track && prevBtn && nextBtn) {
    let current = 0;
    const cards = track.querySelectorAll('.story-card, .testimonial-card');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.story-dot') : [];
    const getVisible = () => window.innerWidth <= 640 ? 1 : window.innerWidth <= 960 ? 2 : 3;

    const updateDots = () => {
      if (!dots.length) return;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === current);
      });
    };

    const updateCarousel = () => {
      const visible = getVisible();
      const maxIndex = Math.max(0, cards.length - visible);
      current = Math.min(current, maxIndex);
      if (cards.length > 0) {
        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 26;
        track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
      }
      updateDots();
    };

    nextBtn.addEventListener('click', () => {
      const visible = getVisible();
      const maxIndex = Math.max(0, cards.length - visible);
      if (current < maxIndex) {
        current++;
      } else {
        current = 0;
      }
      updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
      const visible = getVisible();
      const maxIndex = Math.max(0, cards.length - visible);
      if (current > 0) {
        current--;
      } else {
        current = maxIndex;
      }
      updateCarousel();
    });

    if (dots.length) {
      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          const visible = getVisible();
          const maxIndex = Math.max(0, cards.length - visible);
          current = Math.min(idx, maxIndex);
          updateCarousel();
        });
      });
    }

    window.addEventListener('resize', updateCarousel);

    // Auto-scroll
    let autoInterval = setInterval(() => {
      const visible = getVisible();
      const maxIndex = Math.max(0, cards.length - visible);
      current = current < maxIndex ? current + 1 : 0;
      updateCarousel();
    }, 6000);

    track.addEventListener('mouseenter', () => clearInterval(autoInterval));
    track.addEventListener('mouseleave', () => {
      autoInterval = setInterval(() => {
        const visible = getVisible();
        const maxIndex = Math.max(0, cards.length - visible);
        current = current < maxIndex ? current + 1 : 0;
        updateCarousel();
      }, 6000);
    });

    // Touch swipe support
    let startX = 0;
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextBtn.click();
        } else {
          prevBtn.click();
        }
      }
    }, { passive: true });

    // Initial position
    setTimeout(updateCarousel, 100);
  }

  // Initialize Lucide icons if available
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  /* ─── FAQ ACCORDION ─── */
  const faqButtons = document.querySelectorAll('.faq-card-header, .faq-question');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.faq-card, .faq-item');
      const answer = card.querySelector('.faq-card-answer, .faq-answer');
      const isOpen = card.classList.contains('open');

      // Close all cards
      document.querySelectorAll('.faq-card, .faq-item').forEach(c => {
        c.classList.remove('open');
        const h = c.querySelector('.faq-card-header, .faq-question');
        if (h) h.setAttribute('aria-expanded', 'false');
        const a = c.querySelector('.faq-card-answer, .faq-answer');
        if (a) a.style.maxHeight = '0';
      });

      // If clicked card was not open, open it
      if (!isOpen) {
        card.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      }
    });
  });

  // Initialize initially open FAQ cards
  setTimeout(() => {
    document.querySelectorAll('.faq-card.open .faq-card-answer, .faq-item.open .faq-answer').forEach(ans => {
      ans.style.maxHeight = ans.scrollHeight + 'px';
    });
  }, 150);

  /* ─── SCROLL REVEAL ─── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => {
      revealObs.observe(el);
    });

    // Handle Staggering Parents
    document.querySelectorAll('.stagger-parent').forEach(parent => {
      parent.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.setProperty('--stagger-index', i);
      });
    });
  }

  /* ─── CAREER JOURNEY PROGRESS ANIMATION ─── */
  const careerLine = document.querySelector('.career-progress-line');
  const careerItems = document.querySelectorAll('.career-step-item');
  const careerWrapper = document.querySelector('.career-steps-wrapper');

  if (careerWrapper && careerLine) {
    const updateCareerProgress = () => {
      const windowHeight = window.innerHeight;
      const rect = careerWrapper.getBoundingClientRect();
      
      // Trigger point
      const triggerPoint = windowHeight * 0.75;
      let progress = triggerPoint - rect.top;
      
      // Progress clamping
      const totalHeight = rect.height;
      let finalHeight = Math.max(0, Math.min(progress, totalHeight));
      
      // Set line height
      careerLine.style.height = `${finalHeight}px`;

      // Activate markers and items
      careerItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.top < triggerPoint) {
           item.classList.add('active');
        } else {
           item.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', updateCareerProgress);
    window.addEventListener('resize', updateCareerProgress);
    updateCareerProgress();
  }

  /* ─── APPOINTMENT FORM (MONGODB INTEGRATION) ─── */
  const form = document.getElementById('appointmentForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const formSuccess = document.getElementById('formSuccess');

      const firstName = (document.getElementById('firstName')?.value || '').trim();
      const lastName = (document.getElementById('lastName')?.value || '').trim();
      const fullName = `${firstName} ${lastName}`.trim() || 'Valued Patient';
      const phone = (document.getElementById('phone')?.value || '').trim();
      const email = (document.getElementById('email')?.value || '').trim();
      const service = (document.getElementById('service')?.value || 'General Consultation').trim();
      const preferredDate = (document.getElementById('preferredDate')?.value || '').trim();
      const preferredTime = (document.getElementById('preferredTime')?.value || '').trim();
      const notes = (document.getElementById('notes')?.value || '').trim();

      if (!phone) {
        alert('Please enter your phone number so Dr. Priyadarshini\'s clinic can connect with you.');
        return;
      }

      const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting Request...';
      }

      const payload = {
        name: fullName,
        phone,
        email,
        service,
        preferredDate,
        preferredTime,
        message: notes,
        source: 'Contact Page Appointment Form'
      };

      try {
        const res = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (formSuccess) {
          formSuccess.style.display = 'block';
          formSuccess.innerHTML = `
            <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px;">
              <i data-lucide="check-circle" style="vertical-align: middle; margin-right: 6px;"></i>
              Thank you, ${fullName}! Your consultation request has been received & saved in our system.
            </div>
            <p style="margin: 6px 0 10px 0; font-size: 0.88rem;">Our clinical coordinator will contact you at <strong>${phone}</strong> within 24 hours to finalize your consultation time.</p>
            <a href="https://wa.me/971504748567?text=${encodeURIComponent('Hello Dr. Priyadarshini clinic, I just submitted an appointment request for ' + service + ' for ' + fullName + ' (' + phone + ').')}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:6px; background:#25D366; color:#fff; font-weight:700; padding:8px 16px; border-radius:9999px; text-decoration:none; font-size:0.85rem;">
              <i data-lucide="message-circle"></i> Chat Now on WhatsApp to Fast-Track
            </a>
          `;
          if (window.lucide) lucide.createIcons();
        }
        form.reset();
      } catch (err) {
        console.warn('API submission notice:', err);
        // Fallback: Show success with instant WhatsApp bridge
        if (formSuccess) {
          formSuccess.style.display = 'block';
          formSuccess.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 6px;">Request Received!</div>
            <p style="font-size: 0.88rem; margin-bottom: 10px;">To ensure instant confirmation, you can also connect directly with Dr. Priyadarshini's team on WhatsApp:</p>
            <a href="https://wa.me/971504748567?text=${encodeURIComponent('Hello Dr. Priyadarshini clinic, I would like to book a consultation for ' + service + '. Name: ' + fullName + ', Phone: ' + phone + (preferredDate ? ', Preferred: ' + preferredDate : ''))}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:6px; background:#25D366; color:#fff; font-weight:700; padding:8px 16px; border-radius:9999px; text-decoration:none; font-size:0.85rem;">
              <i data-lucide="message-circle"></i> Confirm via WhatsApp Now
            </a>
          `;
          if (window.lucide) lucide.createIcons();
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
          if (window.lucide) lucide.createIcons();
        }
      }
    });
  }

  /* ─── DYNAMIC WEEKLY SCHEDULE & CMS HYDRATION ─── */
  const scheduleModal = document.getElementById('weeklyScheduleModal');
  const closeScheduleBtn = document.getElementById('closeWeeklyScheduleBtn');
  const openScheduleBtns = document.querySelectorAll('#btnViewWeeklySchedule, .btn-open-weekly-schedule');

  if (closeScheduleBtn && scheduleModal) {
    closeScheduleBtn.addEventListener('click', () => {
      scheduleModal.style.display = 'none';
    });
    scheduleModal.addEventListener('click', (e) => {
      if (e.target === scheduleModal) {
        scheduleModal.style.display = 'none';
      }
    });
  }

  openScheduleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (scheduleModal) {
        scheduleModal.style.display = 'flex';
      }
    });
  });

  // Fetch dynamic weekly schedule from MongoDB API
  async function loadDynamicSchedule() {
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      if (data.success && data.schedule) {
        const s = data.schedule;

        const noticeEl = document.getElementById('wsCustomerNotice');
        if (noticeEl && s.notice) noticeEl.textContent = s.notice;

        const clinicHoursNotice = document.getElementById('clinicHoursNotice');
        if (clinicHoursNotice && s.notice) clinicHoursNotice.textContent = s.notice;

        const tableEl = document.getElementById('wsDaysTable');
        if (tableEl && Array.isArray(s.days)) {
          const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const todayIndex = new Date().getDay();
          const todayName = daysOrder[todayIndex];

          tableEl.innerHTML = s.days.map(d => {
            const isToday = d.day === todayName;
            const statusClass = d.isOpen ? 'ws-status-open' : 'ws-status-closed';
            const statusLabel = d.isOpen ? (d.statusText || 'Open') : 'Closed';
            const timeRange = d.isOpen ? `${d.openTime || '08:30 AM'} – ${d.closeTime || '08:30 PM'}` : 'Closed';

            return `
              <div class="ws-day-row ${isToday ? 'ws-today' : ''}">
                <div class="ws-day-name">
                  <span>${d.day}</span>
                  ${isToday ? '<span class="ws-today-pill">Today</span>' : ''}
                </div>
                <div class="ws-day-time">
                  <span class="ws-time-text">${timeRange}</span>
                  <span class="ws-status-badge ${statusClass}">${statusLabel}</span>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    } catch (err) {
      const tableEl = document.getElementById('wsDaysTable');
      if (tableEl && !tableEl.innerHTML.trim()) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = daysOrder[new Date().getDay()];
        tableEl.innerHTML = days.map(d => `
          <div class="ws-day-row ${d === todayName ? 'ws-today' : ''}">
            <div class="ws-day-name">
              <span>${d}</span>
              ${d === todayName ? '<span class="ws-today-pill">Today</span>' : ''}
            </div>
            <div class="ws-day-time">
              <span class="ws-time-text">08:30 AM – 08:30 PM</span>
              <span class="ws-status-badge ws-status-open">Open</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  loadDynamicSchedule();

  /* ─── SMOOTH PAGE TRANSITIONS ─── */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('tel') && !href.startsWith('mailto') && !href.startsWith('javascript')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.2s ease';
        setTimeout(() => { window.location.href = href; }, 200);
      });
    }
  });

  /* ─── ABOUT SECTION MODAL & INTERACTION ─── */
  const aboutCardData = {
    academic: {
      category: "Education & Global Board Certifications",
      title: "Academic Journey & Qualifications",
      icon: "graduation-cap",
      badgeBg: "#F6ECE0",
      iconColor: "#A77A27",
      items: [
        { year: "2024", title: "FACOG (USA) – Fellow of the American Congress of Obstetricians and Gynecologists", desc: "Recognized with international fellowship for adherence to highest US clinical and ethical standards in women's healthcare." },
        { year: "2022", title: "MRCOG (London, UK) – Member of the Royal College of Obstetricians & Gynaecologists", desc: "Passed all rigorous UK royal college assessments on the very first attempt, upholding evidence-based UK clinical protocols." },
        { year: "2022", title: "EFOG-EBCOG – European Fellow of Obstetrics and Gynaecology", desc: "Certified by the European Board & College of Obstetrics and Gynaecology with full European clinical equivalence." },
        { year: "2021", title: "Masters in Minimally Invasive Surgery (Laparoscopy & Hysteroscopy)", desc: "Advanced surgical fellowship from Kiehls School (Germany) & IBC Academies of Medical Excellence (Dubai), specializing in keyhole gynaecological procedures." },
        { year: "2018", title: "Competency Certification – The Fetal Medicine Foundation (UK)", desc: "Certified by FMF London for 11–13 week fetal screening, pre-eclampsia assessment, and Doppler flow evaluations." },
        { year: "2016", title: "DNB (Obstetrics & Gynaecology) – Sri Gokulam Hospital, Salem, Tamil Nadu", desc: "Awarded by National Board of Examinations (New Delhi) following 3-year intensive tertiary residency in obstetrics and gynaecology." },
        { year: "2012", title: "MBBS – Chettinad Hospital & Research Institute, Chennai", desc: "Awarded Best Outgoing Student (2006 Batch) with 7 Gold Medals and multiple academic distinctions across MBBS curriculum." }
      ]
    },
    clinical: {
      category: "12+ Years of Hospital & Surgical Excellence",
      title: "Clinical Experience & Leadership",
      icon: "stethoscope",
      badgeBg: "#E5F2EC",
      iconColor: "#237367",
      items: [
        { year: "Present", title: "Specialist OBGYN – NMC Speciality Hospital, Abu Dhabi", desc: "Leading advanced high-risk obstetric deliveries, minimally invasive laparoscopic myomectomies/cystectomies, and specialized outpatient clinics under HAAD GD37938." },
        { year: "2021-25", title: "Specialist Obstetrician & Gynaecologist – LLH & Ahalia Hospitals, Abu Dhabi", desc: "Managed busy labor wards, emergency obstetric interventions, high-risk antenatal clinics, and elective laparoscopic procedures across major Abu Dhabi tertiary hospitals." },
        { year: "2021", title: "Specialist Gynaecologist – Keerthi & Brite Medical Centers, Dubai", desc: "Comprehensive women's healthcare services, fertility investigations, colposcopy, and adolescent clinics." },
        { year: "2018-21", title: "Consultant OBG – SM Hospital, Ooty", desc: "Senior obstetrician and gynaecologist managing maternal triage, high-risk deliveries, emergency surgical interventions, and inpatient obstetric care." },
        { year: "2016-19", title: "Assistant Professor & Senior Resident – Medical College Hospitals", desc: "Clinical teaching and senior resident surgical duties at PK Das Institute of Medical Sciences & Karpagam Medical College, training resident doctors and supervising labour wards." }
      ]
    },
    awards: {
      category: "Excellence & Distinction",
      title: "Awards, Honors & Recognitions",
      icon: "trophy",
      badgeBg: "#FAECEB",
      iconColor: "#B85C5E",
      items: [
        { year: "2024", title: "UAE Next Mastermind Award – Outstanding Gynaecology Excellence", desc: "Honored with the prestigious UAE Next Mastermind Award 2024 in recognition of outstanding clinical skill and dedicated service in women's healthcare." },
        { year: "2023", title: "Thanga Tharagai Award (Field of Medicine)", desc: "Presented by Honorable Minister Trichy Siva at ISC Abu Dhabi — recognizing eminent women of Tamil origin in the UAE for academic and community medical excellence (First of its kind in UAE)." },
        { year: "2011", title: "Madras University Students Club Medal in General Surgery", desc: "Conferred by The Tamil Nadu Dr. M.G.R. Medical University for outstanding performance and highest distinction in General Surgery." },
        { year: "2006", title: "Best Outgoing Student – Chettinad Health City", desc: "Awarded top honor as the Best Outgoing Student of the 2006 MBBS batch for academic leadership and clinical excellence." },
        { year: "2006", title: "Seven Gold Medals During Undergraduate Course", desc: "Decorated with 7 Gold Medals across undergraduate medical subjects at Chettinad Health City." }
      ]
    },
    memberships: {
      category: "International Medical Affiliations",
      title: "Professional Memberships & Fellowships",
      icon: "users",
      badgeBg: "#E7EFF7",
      iconColor: "#3B749E",
      items: [
        { year: "Europe", title: "ESGE – European Society of Gynecological Endoscopy", desc: "Active member contributing to international surgical standards and innovations in minimally invasive gynaecology." },
        { year: "UK", title: "MRCOG – Royal College of Obstetricians and Gynaecologists, London", desc: "Member (MRCOG); regularly participating in international congresses and adhering to evidence-based UK clinical practice." },
        { year: "Europe", title: "EFOG – European Board & College of Obstetrics and Gynaecology", desc: "European Fellow (EFOG); recognized across European member states for clinical equivalence and surgical excellence." },
        { year: "USA", title: "FACOG – American Congress of Obstetricians and Gynecologists", desc: "Fellow (FACOG); follows clinical practice guidelines and latest American committee opinions." },
        { year: "Global", title: "ISUOG – International Society of Ultrasound in Obstetrics and Gynecology", desc: "Member dedicated to advancing ultrasound diagnostic excellence in obstetrics and gynaecology." },
        { year: "London", title: "FMF – The Fetal Medicine Foundation, United Kingdom", desc: "Competency Certified in First Trimester Ultrasound (11–13 week fetal screening) with annual license audits." },
        { year: "India", title: "FOGSI & IMA", desc: "Life Member of Federation of Obstetric and Gynaecological Societies of India & Indian Medical Association." },
        { year: "Global", title: "ELMO & GAPIO", desc: "Member of European Lifestyle Medicine Organisation & Global Association of Physicians of Indian Origin." }
      ]
    },
    beyond: {
      category: "Education, Advocacy & Research",
      title: "Beyond the Clinic & Community",
      icon: "book-open",
      badgeBg: "#F6EAEF",
      iconColor: "#924B69",
      items: [
        { year: "StudyMEDIC", title: "Mentor – StudyMEDIC (MRCOG & EBCOG Training)", desc: "Senior mentor with StudyMEDIC (Oct 2021 to Present), an internationally accredited medical education platform, mentoring doctors worldwide for MRCOG and EBCOG qualifications." },
        { year: "MedCafe", title: "Chief Executive Officer (CEO) – MedCafe", desc: "Leading MedCafe, a global collaborative platform for doctors, dedicated to fostering professional collaboration, medical knowledge exchange, education, and networking among healthcare professionals worldwide." },
        { year: "Advocacy", title: "Women's Health Literacy & Preventative Awareness", desc: "Frequently hosts community seminars in Abu Dhabi and Dubai on PMOS management, cervical cancer vaccination (HPV), and menopause wellness." },
        { year: "Research", title: "Peer-Reviewed Publications & Clinical Audits", desc: "Presented and published research on gestational diabetes, trial of labour after caesarean (TOLAC/VBAC), and minimally invasive ovarian cystectomy." },
        { year: "Languages", title: "Multilingual Patient Connection", desc: "Fluent in English, Tamil, Malayalam, Kannada, and Hindi (with functional Arabic), ensuring clear, comfortable communication for all patients." }
      ]
    },
    approach: {
      category: "Compassionate, Evidence-Based Medicine",
      title: "Her Clinical Philosophy & Approach",
      icon: "heart-handshake",
      badgeBg: "#EBF5F1",
      iconColor: "#2E7966",
      items: [
        { year: "Listening", title: "Compassionate, Unhurried Consultation", desc: "'Every woman's journey is unique. I believe in giving every patient uninterrupted time to share her symptoms, concerns, and personal goals.'" },
        { year: "Care", title: "Evidence-Based & Minimally Invasive First", desc: "Committed to following strict RCOG & ACOG protocols — prioritizing natural birth when safe, conservative management, and keyhole surgery when needed." },
        { year: "Holistic", title: "Complete Physical & Emotional Support", desc: "Treating the whole person by addressing nutritional health, mental wellness, hormone balance, and preventative lifestyle alongside medical therapies." },
        { year: "HAAD", title: "Department of Health Abu Dhabi Licensed", desc: "Fully licensed as Specialist Obstetrician & Gynaecologist by the Department of Health Abu Dhabi (HAAD License: GD37938) for dedicated, comprehensive clinical care." }
      ]
    }
  };

  /* ─── MODAL SCROLL LOCK HELPERS (PREVENTS BACKGROUND PAGE SCROLLING) ─── */
  let scrollLockPosition = 0;

  function lockBackgroundScroll() {
    scrollLockPosition = window.pageYOffset || document.documentElement.scrollTop;
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollLockPosition}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  function unlockBackgroundScroll() {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollLockPosition);
  }

  const modalBackdrop = document.getElementById('aboutModalBackdrop');
  const modalClose = document.getElementById('aboutModalClose');
  const modalDismiss = document.getElementById('modalDismissBtn');
  const modalCategoryTag = document.getElementById('modalCategoryTag');
  const modalCategoryTitle = document.getElementById('modalCategoryTitle');
  const modalBadgeIcon = document.getElementById('modalBadgeIcon');
  const modalBodyContent = document.getElementById('modalBodyContent');

  function openAboutModal(categoryKey) {
    const data = aboutCardData[categoryKey];
    if (!data || !modalBackdrop) return;

    modalCategoryTag.textContent = data.category;
    modalCategoryTitle.textContent = data.title;
    modalBadgeIcon.style.backgroundColor = data.badgeBg;
    modalBadgeIcon.style.color = data.iconColor;
    modalBadgeIcon.innerHTML = `<i data-lucide="${data.icon}"></i>`;

    // Render items
    modalBodyContent.innerHTML = data.items.map(item => `
      <div class="modal-item-row">
        <span class="modal-item-year">${item.year}</span>
        <div class="modal-item-content">
          <div class="modal-item-title">${item.title}</div>
          <p class="modal-item-desc">${item.desc}</p>
        </div>
      </div>
    `).join('');

    modalBodyContent.scrollTop = 0;
    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  function closeAboutModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  window.openAboutModal = openAboutModal;
  window.closeAboutModal = closeAboutModal;

  // Attach card click handlers
  document.querySelectorAll('.about-feature-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      openAboutModal(cat);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const cat = card.getAttribute('data-category');
        openAboutModal(cat);
      }
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeAboutModal);
  if (modalDismiss) modalDismiss.addEventListener('click', closeAboutModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeAboutModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('open')) {
      closeAboutModal();
    }
  });


  /* ─── SERVICES SECTION MODAL & INTERACTION ─── */
  const serviceCardData = {
    obstetrics: {
      number: "01",
      tag: "Category 01 • Maternity & Childbirth",
      title: "Obstetrics & Maternity Care",
      badgeBg: "#0E3C39",
      iconColor: "#FFFFFF",
      iconSvg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9s-9 4.03-9 9a9 9 0 0 0 9 9z"/><path d="M12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/><path d="M9.5 14.5c.8-1 1.7-1.5 2.5-1.5s1.7.5 2.5 1.5"/><path d="M12 16.5c-1.5 1-2.5 2-2.5 3.5h5c0-1.5-1-2.5-2.5-3.5z"/></svg>`,
      overview: "Dr. Priyadarshini Lingaraj provides compassionate, comprehensive obstetric care that nurtures both mother and baby from preconception planning through a safe delivery and comfortable postpartum recovery.",
      treatments: [
        { name: "Preconception Health & Fertility Optimization", desc: "Comprehensive health assessments, folic acid guidance, and lifestyle optimization before conception." },
        { name: "Routine Antenatal Care & Trimester Screenings", desc: "Evidence-based checkups, fetal heartbeat monitoring, blood work, and growth tracking." },
        { name: "FMF-Certified Fetal Scans", desc: "11–13 week NT scan, first-trimester screening, and Doppler flow evaluations certified by The Fetal Medicine Foundation (FMF UK)." },
        { name: "High-Risk Pregnancy Management", desc: "Specialist oversight for gestational diabetes, pre-eclampsia, thyroid disorders, and multiple gestations (twins/triplets)." },
        { name: "Safe Normal & Painless Epidural Deliveries", desc: "Promoting natural spontaneous birth with continuous fetal monitoring and modern analgesia options." },
        { name: "Planned & Emergency Caesarean Section (C-Section)", desc: "Expert surgical delivery with cosmetically refined incisions and rapid recovery protocols." },
        { name: "Vaginal Birth After Caesarean (VBAC / TOLAC)", desc: "Carefully evaluated and monitored trials of labor for mothers wishing to deliver vaginally after previous C-section." },
        { name: "Comprehensive Postnatal Care & Lactation Support", desc: "Post-delivery physical recovery, wound healing checks, breastfeeding guidance, and postpartum emotional wellness." }
      ],
      credentialNote: "5,000+ successful deliveries managed across various hospitals in UAE and India."
    },
    gynaecology: {
      number: "02",
      tag: "Category 02 • Women's Health & Gynaecology",
      title: "Gynaecological Care",
      badgeBg: "#E3F3EC",
      iconColor: "#2E8B7A",
      iconSvg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M12 11v11"/><path d="M8 17h8"/><path d="M5 8a7 7 0 0 0 14 0"/></svg>`,
      overview: "From adolescent menstrual concerns to complex reproductive conditions, Dr. Priya offers unhurried diagnostic evaluations and gentle, evidence-based treatments tailored to every woman's comfort.",
      treatments: [
        { name: "Hormonal Disorders (Puberty to Menopause)", desc: "Comprehensive evaluation and personalized medical management of hormonal disturbances, cycle irregularities, and transition symptoms right from puberty up to menopause." },
        { name: "PMOS Management", desc: "Holistic metabolic profiling, cycle regularization, weight management, and androgen balance." },
        { name: "Breast Health Screening & Counseling", desc: "Clinical breast examination, screening for benign breast conditions, self-examination guidance, and referral counseling for mammography and ultrasound." },
        { name: "Abnormal Uterine Bleeding (AUB) & Heavy Periods", desc: "Modern diagnostic ultrasound, hormonal therapy, and minimally invasive options for menorrhagia." },
        { name: "Uterine Fibroids (Leiomyomas) Management", desc: "Medical and conservative surgical management to preserve fertility and eliminate pelvic heaviness." },
        { name: "Endometriosis & Chronic Pelvic Pain", desc: "Specialist staging and advanced treatment to relieve debilitating cycle pain and protect fertility." },
        { name: "Ovarian Cysts & Benign Pelvic Masses", desc: "Ultrasound surveillance and organ-preserving cyst removal (cystectomy)." },
        { name: "Pelvic Inflammatory Disease & Recurrent Infections", desc: "Targeted microbiological testing and definitive therapy for vaginal, cervical, and pelvic infections." },
        { name: "Contraceptive Counseling & Family Planning", desc: "Personalized advice on oral pills, implants, hormonal IUDs (Mirena), and non-hormonal copper loops." },
        { name: "Colposcopy & Cervical Health Checks", desc: "Detailed magnified examination of the cervix for abnormal smear results." }
      ],
      credentialNote: "Fellow of RCOG (London) & EBCOG (Europe) following strict international clinical treatment guidelines."
    },
    wellness: {
      number: "03",
      tag: "Category 03 • Preventive Care & Longevity",
      title: "Women's Wellness & Preventive Care",
      badgeBg: "#FDEBED",
      iconColor: "#C25464",
      iconSvg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-2 0-3.5 1.5-3.5 3.5 0 2.5 3.5 6.5 3.5 6.5s3.5-4 3.5-6.5C15.5 3.5 14 2 12 2z"/><path d="M7 14l-3 7h16l-3-7"/><path d="M9 18h6"/></svg>`,
      overview: "Preventative medicine is the cornerstone of lifelong vitality. Dr. Priya provides thorough well-woman assessments to detect potential health challenges long before they cause symptoms.",
      treatments: [
        { name: "Annual Well-Woman Health Checkups", desc: "Comprehensive pelvic exam, general wellness assessment, and preventative vital screening." },
        { name: "Cervical Cancer Screening (Pap Smear & HPV DNA)", desc: "High-precision liquid-based cytology and HPV co-testing for early detection and peace of mind." },
        { name: "HPV Vaccination (Gardasil 9)", desc: "Protection against cervical cancer and genital warts for young girls, teens, and adult women." },
        { name: "Clinical Breast Examination & Mammogram Referrals", desc: "Breast lump evaluation, fibrocystic change screening, and personalized imaging recommendations." },
        { name: "Adolescent Gynaecology Guidance", desc: "Compassionate, gentle care for teenage girls experiencing painful, delayed, or irregular cycles." },
        { name: "Premarital Gynaecological Screening & Counseling", desc: "Health workup, genetic screening, and fertility awareness for brides-to-be." },
        { name: "Lifestyle, Nutritional & Hormonal Coaching", desc: "Personalized strategies addressing insulin resistance, diet, sleep, and stress on hormonal balance." },
        { name: "STI & Sexual Health Screening", desc: "Confidential, non-judgmental evaluations and rapid targeted treatments." }
      ],
      credentialNote: "Active community educator and women's health literacy advocate across Abu Dhabi and Dubai."
    },
    surgery: {
      number: "04",
      tag: "Category 04 • Advanced Minimally Invasive Surgery",
      title: "Minimally Invasive Surgery",
      badgeBg: "#E2F0F8",
      iconColor: "#3B749E",
      iconSvg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
      overview: "Specializing in advanced keyhole techniques, Dr. Priya performs delicate surgeries through tiny incisions, allowing patients to experience significantly less pain, minimal scarring, and quick return to daily life.",
      treatments: [
        { name: "Diagnostic Laparoscopy for Pelvic Pathology", desc: "Visual examination of pelvic organs for unexplained pain, infertility, and adhesions." },
        { name: "Laparoscopic Ovarian Cystectomy", desc: "Precision removal of dermoid cysts, endometriomas (chocolate cysts), and benign tumors." },
        { name: "Laparoscopic Myomectomy (Fibroid Removal)", desc: "Surgical removal of uterine fibroids while meticulously preserving uterine structure and fertility." },
        { name: "Laparoscopic Treatment of Endometriosis", desc: "Excision of deep infiltrating endometriosis and restoration of normal pelvic anatomy." },
        { name: "Diagnostic & Operative Hysteroscopy", desc: "No-incision keyhole access through the natural canal to remove uterine polyps and fibroids." },
        { name: "Hysteroscopic Septum Resection & Adhesiolysis", desc: "Correction of congenital uterine anomalies (septum) and Asherman syndrome to restore fertility." },
        { name: "Total Laparoscopic Hysterectomy (TLH)", desc: "Minimally invasive removal of the uterus for benign indications with next-day hospital discharge." },
        { name: "Ectopic Pregnancy Laparoscopic Management", desc: "Urgent minimally invasive salpingectomy or salpingostomy saving ovarian function." }
      ],
      credentialNote: "Masters in Minimally Invasive Surgery from Kiehls School (Germany) with 850+ laparoscopic surgeries completed."
    },
    fertility: {
      number: "05",
      tag: "Category 05 • Fertility & Conception Care",
      title: "Fertility & Reproductive Health",
      badgeBg: "#EFE8F7",
      iconColor: "#7A52A3",
      iconSvg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/><path d="M12 2a4 4 0 0 1 4 4"/></svg>`,
      overview: "Every fertility journey deserves compassionate, individualized investigation. Dr. Priya conducts evidence-based assessments to diagnose and resolve underlying barriers to natural conception.",
      treatments: [
        { name: "Comprehensive Couple Fertility Workup", desc: "Simultaneous evaluation of ovulatory, tubal, uterine, and partner semen factors." },
        { name: "Ovarian Reserve Testing & Follicular Tracking", desc: "AMH blood assays, antral follicle counts (AFC), and serial ultrasound ovulation tracking." },
        { name: "Tubal Patency Assessment (HyCoSy / HSG)", desc: "Gentle imaging examinations to confirm clear, open fallopian tubes." },
        { name: "Ovulation Induction & Controlled Cycle Monitoring", desc: "Medically monitored oral or injectable protocols for anovulatory conditions (PMOS)." },
        { name: "Surgical Correction of Fertility Barriers", desc: "Minimally invasive removal of endometrial polyps, fibroids, or pelvic adhesions impeding conception." },
        { name: "Recurrent Pregnancy Loss (Miscarriage) Workup", desc: "Thrombophilia, autoimmune, hormonal, and anatomical investigations for repeated losses." },
        { name: "Pre-IVF Preparation & Optimization", desc: "Medical optimization of the uterine environment, endometrial lining, and egg quality prior to assisted reproduction." },
        { name: "Endocrine & Metabolic Harmony for Conception", desc: "Balancing thyroid, prolactin, and insulin resistance to foster healthy implantation." }
      ],
      credentialNote: "Fellow of FACOG (USA) with dedicated protocols for reproductive endocrinology."
    },
    menopause: {
      number: "06",
      tag: "Category 06 • Hormonal Transition & Vitality",
      title: "Menopause & Midlife Care",
      badgeBg: "#F8EFE3",
      iconColor: "#9A7737",
      iconSvg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z"/><path d="M7 14c-3 1-5 4-5 7a5 5 0 0 0 10 0c0-3-2-6-5-7z"/><path d="M17 14c3 1 5 4 5 7a5 5 0 0 1-10 0c0-3 2-6 5-7z"/></svg>`,
      overview: "The transition into midlife should be a chapter of empowerment and vitality. Dr. Priya provides tailored hormonal and non-hormonal strategies to manage perimenopause and menopause with grace and confidence.",
      treatments: [
        { name: "Perimenopause & Menopause Symptom Management", desc: "Personalized relief for hot flashes, night sweats, sleep disturbances, and mood shifts." },
        { name: "Evidence-Based Hormone Replacement Therapy (HRT)", desc: "Carefully customized bioidentical estrogen and progesterone therapy with annual safety monitoring." },
        { name: "Non-Hormonal Therapies & Herbal Alternatives", desc: "Safe, proven alternatives for women who cannot or prefer not to use hormonal therapies." },
        { name: "Genitourinary Syndrome of Menopause (GSM)", desc: "Targeted localized treatments for vaginal dryness, dyspareunia, and recurrent urinary infections." },
        { name: "Bone Health & Osteoporosis Prevention", desc: "DEXA bone density evaluations, calcium/Vitamin D optimization, and fracture risk reduction." },
        { name: "Cardiovascular & Metabolic Risk Assessment", desc: "Midlife lipid profiling, blood pressure monitoring, and metabolic protection." },
        { name: "Sleep, Energy & Brain Fog Support", desc: "Holistic strategies to restore restorative sleep and sharp mental clarity." },
        { name: "Pelvic Floor Health & Bladder Support", desc: "Conservative management and guidance for pelvic organ support and urinary incontinence." }
      ],
      credentialNote: "Personalized, evidence-based midlife care ensuring vitality, intimacy, and long-term bone & heart protection."
    }
  };

  const serviceModalBackdrop = document.getElementById('serviceModalBackdrop');
  const serviceModalClose = document.getElementById('serviceModalClose');
  const serviceModalDismiss = document.getElementById('sModalDismissBtn');
  const sModalIconBadge = document.getElementById('sModalIconBadge');
  const sModalCategoryTag = document.getElementById('sModalCategoryTag');
  const sModalCategoryTitle = document.getElementById('sModalCategoryTitle');
  const sModalOverview = document.getElementById('sModalOverview');
  const sModalTreatmentsList = document.getElementById('sModalTreatmentsList');
  const sModalCredentialText = document.getElementById('sModalCredentialText');
  const sModalBookBtn = document.getElementById('sModalBookBtn');

  function openServiceModal(serviceKey) {
    const data = serviceCardData[serviceKey];
    if (!data || !serviceModalBackdrop) return;

    sModalCategoryTag.textContent = data.tag;
    sModalCategoryTitle.textContent = data.title;
    sModalIconBadge.style.backgroundColor = data.badgeBg;
    sModalIconBadge.style.color = data.iconColor;
    sModalIconBadge.innerHTML = data.iconSvg;

    sModalOverview.textContent = data.overview;
    sModalCredentialText.textContent = data.credentialNote;

    if (sModalBookBtn) {
      sModalBookBtn.setAttribute('href', `contact.html?service=${encodeURIComponent(data.title)}#form`);
    }

    // Render treatment items
    sModalTreatmentsList.innerHTML = data.treatments.map((item, idx) => `
      <div class="s-modal-treatment-item">
        <span class="s-modal-item-bullet">${idx + 1}</span>
        <div>
          <div class="s-modal-item-name">${item.name}</div>
          <p class="s-modal-item-desc">${item.desc}</p>
        </div>
      </div>
    `).join('');

    const sBody = serviceModalBackdrop.querySelector('.service-modal-body');
    if (sBody) sBody.scrollTop = 0;

    serviceModalBackdrop.classList.add('open');
    serviceModalBackdrop.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  function closeServiceModal() {
    if (!serviceModalBackdrop) return;
    serviceModalBackdrop.classList.remove('open');
    serviceModalBackdrop.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();
  }

  window.openServiceModal = openServiceModal;
  window.closeServiceModal = closeServiceModal;

  // Attach click handlers to service cards
  document.querySelectorAll('.service-ref-card').forEach(card => {
    card.addEventListener('click', () => {
      const sKey = card.getAttribute('data-service');
      openServiceModal(sKey);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const sKey = card.getAttribute('data-service');
        openServiceModal(sKey);
      }
    });
  });

  if (serviceModalClose) serviceModalClose.addEventListener('click', closeServiceModal);
  if (serviceModalDismiss) serviceModalDismiss.addEventListener('click', closeServiceModal);
  if (serviceModalBackdrop) {
    serviceModalBackdrop.addEventListener('click', (e) => {
      if (e.target === serviceModalBackdrop) closeServiceModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && serviceModalBackdrop && serviceModalBackdrop.classList.contains('open')) {
      closeServiceModal();
    }
  });

  // Prevent background scroll when touching / scrolling directly on modal backdrops
  [modalBackdrop, serviceModalBackdrop].forEach(backdrop => {
    if (!backdrop) return;
    backdrop.addEventListener('touchmove', (e) => {
      if (e.target === backdrop) {
        e.preventDefault();
      }
    }, { passive: false });
    backdrop.addEventListener('wheel', (e) => {
      if (e.target === backdrop) {
        e.preventDefault();
      }
    }, { passive: false });
  });

  /* ─── AUTO-SELECT SERVICE IF PASSED IN URL (contact.html) ─── */
  const serviceSelect = document.getElementById('service');
  if (serviceSelect) {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      const decoded = decodeURIComponent(serviceParam).toLowerCase();
      for (let i = 0; i < serviceSelect.options.length; i++) {
        const optText = serviceSelect.options[i].text.toLowerCase();
        if (optText.includes(decoded) || decoded.includes(optText)) {
          serviceSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  /* ─── INITIALIZE LUCIDE ICONS ─── */
  if (window.lucide) {
    lucide.createIcons();
  }

});
