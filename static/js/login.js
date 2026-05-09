// login.js

document.addEventListener("DOMContentLoaded", function () {
  // —— Tab switching logic ——
  const tabBtns = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      contents.forEach((c) => c.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });

  // —— Switch to Register from link ——
  const showRegister = document.getElementById("showRegister");
  if (showRegister) {
    showRegister.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      document.querySelector(".tab-btn[data-tab='register']").classList.add("active");
      contents.forEach((c) => c.classList.remove("active"));
      document.getElementById("register").classList.add("active");
    });
  }

  // —— REGISTER OTP SEND + VERIFY ——
  const regGetOtp    = document.getElementById("regGetOtp");
  const regOtpGroup  = document.getElementById("regOtpGroup");
  const regVerifyBtn = document.getElementById("regVerifyBtn");
  const regPhoneInput = document.getElementById("regPhone");
  let itiReg;

  if (regPhoneInput) {
    itiReg = window.intlTelInput(regPhoneInput, {
      initialCountry: "auto",
      geoIpLookup: (cb) => {
        fetch("https://ipinfo.io/json")
          .then((r) => r.json())
          .then((data) => cb(data.country))
          .catch(() => cb("us"));
      },
      nationalMode: false,
      separateDialCode: true,
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
    });
  }

  if (regGetOtp) {
  regGetOtp.addEventListener("click", async () => {
    document.getElementById("regErrorMsg").textContent = "";

    const name  = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = itiReg?.getNumber?.() || "";

    if (!name || !email || !phone) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch("/register-send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone })
      });
      const data = await res.json();

      if (data.success) {
        // 1) Show the OTP input section & Verify button
        regOtpGroup.style.display  = "block";
        regVerifyBtn.style.display = "block";

        // 2) Start a 30s countdown on this same button, then enable it
        startRegResendCountdown(regGetOtp);

        // 3) In case this is the first time, change the text to "Resend OTP" immediately
        //    (startRegResendCountdown will take care of updating "Resend OTP (30s)" → "Resend OTP")
        if (!regGetOtp.initialized) {
          regGetOtp.initialized = true;
          regGetOtp.innerText = "Resend OTP";
        }
      } else {
        const regError = document.getElementById("regErrorMsg");
        regError.textContent = data.message || "User already registered. Try logging in.";
        regOtpGroup.style.display  = "none";
        regVerifyBtn.style.display = "none";

        // In case the button was disabled from a previous attempt, re‐enable it back:
        regGetOtp.disabled = false;
        regGetOtp.innerText = "Get Verification Code";
        regGetOtp.initialized = false;
      }
    } catch {
      alert("Server error while sending OTP.");
    }
  });
}


// —— helper to disable “Get/Resend OTP” for 30s with live countdown —— 
function startRegResendCountdown(button) {
  let countdown = 30;
  button.disabled = true;
  button.innerText = `Resend OTP (${countdown}s)`;

  const intervalId = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      button.innerText = `Resend OTP (${countdown}s)`;
    } else {
      clearInterval(intervalId);
      button.disabled = false;
      button.innerText = "Resend OTP";
    }
  }, 1000);
}

  if (regVerifyBtn) {
    regVerifyBtn.addEventListener("click", () => {
      const otp = document.getElementById("regOtp").value.trim();
      if (!otp) {
        alert("Please enter OTP");
        return;
      }
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/register-verify";
      const input = document.createElement("input");
      input.type  = "hidden";
      input.name  = "otp";
      input.value = otp;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    });
  }

  // —— USER LOGIN — Phone OTP logic ——
  // —— USER LOGIN — Phone OTP logic ——
// —— USER LOGIN — Phone OTP logic ——
// —— USER LOGIN — Phone OTP logic ——
const userPhoneInput  = document.getElementById("userPhone");
if (userPhoneInput) {
  // instantiate intl-tel-input
  const iti = window.intlTelInput(userPhoneInput, {
    initialCountry: "auto",
    geoIpLookup: (cb) => {
      fetch("https://ipinfo.io/json")
        .then((r) => r.json())
        .then((data) => cb(data.country))
        .catch(() => cb("us"));
    },
    separateDialCode: true,
    utilsScript:
      "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
  });

  // existing references
  const getOtpBtn     = document.getElementById("getOtpBtn");
  const userOtpGroup  = document.getElementById("userOtpGroup");
  const verifyUserBtn = document.getElementById("verifyUserBtn");
  const userOtpInput  = document.getElementById("userOtp");
  const phoneError    = document.createElement("p");

  phoneError.style.color     = "red";
  phoneError.style.marginTop = "0.5em";
  userPhoneInput.parentNode.appendChild(phoneError);

  // NEW references for our added HTML:
  const resendOtpBtn        = document.getElementById("resendOtpBtn");
  const resendOtpText       = document.getElementById("resendOtpText");
  const changeNumberLink    = document.getElementById("changeNumberLink");

  // Helper to start a 30-second countdown on the resend button
  function startResendCountdown() {
    let countdown = 30;
    resendOtpBtn.disabled = true;
    resendOtpBtn.style.display = "block";
    resendOtpText.textContent = `Resend OTP (${countdown}s)`;

    const intervalId = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        resendOtpText.textContent = `Resend OTP (${countdown}s)`;
      } else {
        clearInterval(intervalId);
        resendOtpBtn.disabled = false;
        resendOtpText.textContent = "Resend OTP";
      }
    }, 1000);
  }

  // 1) GET OTP click → show OTP group, verify button, countdown + Change Number
  getOtpBtn.addEventListener("click", async () => {
    phoneError.textContent = "";
    const phone = iti.getNumber();
    if (!phone) {
      phoneError.textContent = "Please select a country and enter number";
      return;
    }

    try {
      const res = await fetch("/verify_phone", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `phone=${encodeURIComponent(phone)}`,
      });
      const data = await res.json();

      if (data.success) {
        // Show OTP input + Verify button
        userOtpGroup.style.display  = "block";
        verifyUserBtn.style.display = "block";
        getOtpBtn.style.display     = "none";

        // Show the Change Number link
        changeNumberLink.style.display = "inline";

        // Start 30s countdown on "Resend OTP"
        startResendCountdown();
      } else {
        phoneError.textContent = data.message;
      }
    } catch {
      phoneError.textContent = "Error sending OTP. Please try again later.";
    }
  });

  // 2) VERIFY & LOGIN click → existing logic
  verifyUserBtn.addEventListener("click", async () => {
    phoneError.textContent = "";
    const phone = iti.getNumber();
    const otp   = userOtpInput.value.trim();
    if (!otp) {
      phoneError.textContent = "Please enter the OTP";
      return;
    }
    try {
      const res = await fetch("/otp-login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `phone=${encodeURIComponent(phone)}&otp=${encodeURIComponent(otp)}`,
      });
      if (res.redirected) {
        window.location.href = res.url;
      } else {
        phoneError.textContent = "Invalid OTP";
      }
    } catch {
      phoneError.textContent = "Error verifying OTP. Please try again later.";
    }
  });

  // 3) RESEND OTP click → re-send same request + restart countdown
  resendOtpBtn.addEventListener("click", async () => {
    const phone = iti.getNumber();

    // restart countdown immediately
    startResendCountdown();

    try {
      const res  = await fetch("/verify_phone", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `phone=${encodeURIComponent(phone)}`,
      });
      const data = await res.json();
      if (!data.success) {
        phoneError.textContent = data.message || "Error resending OTP.";
      } else {
        // clear the OTP input so user re-enters
        userOtpInput.value = "";
        phoneError.textContent = "";
      }
    } catch {
      phoneError.textContent = "Error resending OTP. Please try again.";
    }
  });

  // 4) CHANGE NUMBER link click → just reloads back to phone input
  changeNumberLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.reload(); 
  });
}

  // —— ADMIN LOGIN — Email & Password logic ——
  const adminEmailInput    = document.getElementById("adminEmail");
  const adminPasswordInput = document.getElementById("adminPassword");
  const adminLoginBtn      = document.getElementById("adminLoginBtn");
  const adminErrorMsg      = document.getElementById("adminErrorMsg");

  if (adminLoginBtn) {
    adminLoginBtn.addEventListener("click", async () => {
      adminErrorMsg.textContent = "";
      const email    = adminEmailInput.value.trim();
      const password = adminPasswordInput.value.trim();

      if (!email || !password) {
        adminErrorMsg.textContent = "Please enter both email and password";
        return;
      }

      try {
        const res  = await fetch("/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
          window.location.href = data.redirect;
        } else {
          adminErrorMsg.textContent = data.message;
        }
      } catch (e) {
        adminErrorMsg.textContent = "Server error. Please try again later.";
      }
    });
  }


}); 
