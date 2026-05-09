
// static/js/admin-noti.js

// ── Helpers ──
const qs = sel => document.querySelector(sel);
const postJSON = (url, data) =>
  fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  })
  .then(res => res.json());

// ── Grab buttons & URLs from data-url attrs ──
const sendPhoneBtn   = qs('#send-phone-otp');
const verifyPhoneBtn = qs('#verify-phone-otp');
const updatePhoneBtn = qs('#update-phone');

const sendEmailBtn   = qs('#send-email-otp');
const verifyEmailBtn = qs('#verify-email-otp');
const updateEmailBtn = qs('#update-email');

// endpoints defined via data-url on each button
const SEND_PHONE_URL   = sendPhoneBtn.dataset.url;
const VERIFY_PHONE_URL = verifyPhoneBtn.dataset.url;
const UPDATE_PHONE_URL = updatePhoneBtn.dataset.url;

const SEND_EMAIL_URL   = sendEmailBtn.dataset.url;
const VERIFY_EMAIL_URL = verifyEmailBtn.dataset.url;
const UPDATE_EMAIL_URL = updateEmailBtn.dataset.url;

// ── PHONE SECTION (intl-tel-input) ──
const phoneInput     = qs('#phone-number');
const phoneOtpSec    = qs('#phone-otp-section');
const updatePhoneSec = qs('#update-phone-section');

// init intl-tel-input
const iti = window.intlTelInput(phoneInput, {
  separateDialCode: true,
  initialCountry: 'in',
  utilsScript:
    'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js'
});

// enable Send OTP only when valid
phoneInput.addEventListener('input', () => {
  sendPhoneBtn.disabled = !iti.isValidNumber();
});

sendPhoneBtn.addEventListener('click', () => {
  const fullPhone = iti.getNumber();
  postJSON(SEND_PHONE_URL, { phone: fullPhone })
    .then(data => {
      if (data.success) {
        phoneOtpSec.style.display = 'block';
      } else alert(data.message);
    });
});

verifyPhoneBtn.addEventListener('click', () => {
  const fullPhone = iti.getNumber();
  postJSON(VERIFY_PHONE_URL, {
    phone: fullPhone,
    otp: qs('#phone-otp').value
  }).then(data => {
    if (data.success) {
      updatePhoneSec.style.display = 'block';
    } else alert(data.message);
  });
});

updatePhoneBtn.addEventListener('click', () => {
  postJSON(UPDATE_PHONE_URL, {})
    .then(data => {
      if (data.success) {
        alert('Phone updated!');
        window.location.reload();
      } else alert(data.message);
    });
});

// ── EMAIL SECTION ──
const emailInput     = qs('#email-address');
const emailOtpSec    = qs('#email-otp-section');
const updateEmailSec = qs('#update-email-section');

// basic email‐format check
emailInput.addEventListener('input', () => {
  const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  sendEmailBtn.disabled = !re.test(emailInput.value);
});

sendEmailBtn.addEventListener('click', () => {
  postJSON(SEND_EMAIL_URL, { email: emailInput.value })
    .then(data => {
      if (data.success) {
        emailOtpSec.style.display = 'block';
      } else alert(data.message);
    });
});

verifyEmailBtn.addEventListener('click', () => {
  postJSON(VERIFY_EMAIL_URL, {
    email: emailInput.value,
    otp: qs('#email-otp').value
  }).then(data => {
    if (data.success) {
      updateEmailSec.style.display = 'block';
    } else alert(data.message);
  });
});

updateEmailBtn.addEventListener('click', () => {
  postJSON(UPDATE_EMAIL_URL, {})
    .then(data => {
      if (data.success) {
        alert('Email updated!');
        window.location.reload();
      } else alert(data.message);
    });
});
const menuToggle   = document.querySelector('.menu-toggle');
const sidebar      = document.querySelector('.dashboard-sidebar');
const sidebarClose = document.querySelector('.sidebar-close');

menuToggle.addEventListener('click', () =>
  sidebar.classList.add('sidebar-open')
);

// ← remove the “open” class, not “sidebar-close”
sidebarClose.addEventListener('click', () =>
  sidebar.classList.remove('sidebar-open')
);
