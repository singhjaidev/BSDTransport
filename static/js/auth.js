document.addEventListener('DOMContentLoaded', function() {
    // Tab switching for auth forms
    const authTabButtons = document.querySelectorAll('.auth-tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    authTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and forms
            authTabButtons.forEach(btn => btn.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));
            
            // Add active class to clicked button and corresponding form
            const formId = this.dataset.tab + "LoginForm";
document.getElementById(formId).classList.add("active");

        });
    });

    // Password strength meter
    const passwordInputs = document.querySelectorAll('input[name="password"]');
    
    passwordInputs.forEach(input => {
        if (input.id.includes('Confirm')) return; // Skip confirm password fields
        
        const strengthBar = input.parentElement.nextElementSibling?.querySelector('.strength-bar');
        const strengthText = input.parentElement.nextElementSibling?.querySelector('.strength-text');
        
        if (strengthBar && strengthText) {
            input.addEventListener('input', function() {
                const password = this.value;
                let strength = 0;
                
                // Check length
                if (password.length >= 8) strength += 20;
                
                // Check lowercase letters
                if (password.match(/[a-z]+/)) strength += 20;
                
                // Check uppercase letters
                if (password.match(/[A-Z]+/)) strength += 20;
                
                // Check numbers
                if (password.match(/[0-9]+/)) strength += 20;
                
                // Check special characters
                if (password.match(/[\W]+/)) strength += 20;
                
                // Update strength bar
                strengthBar.style.width = strength + '%';
                
                // Update strength text and color
                if (strength < 40) {
                    strengthText.textContent = 'Weak';
                    strengthBar.style.backgroundColor = '#F44336'; // Red
                } else if (strength < 80) {
                    strengthText.textContent = 'Medium';
                    strengthBar.style.backgroundColor = '#FFC107'; // Yellow/amber
                } else {
                    strengthText.textContent = 'Strong';
                    strengthBar.style.backgroundColor = '#4CAF50'; // Green
                }
                
                // Update text color to match bar
                strengthText.style.color = strengthBar.style.backgroundColor;
            });
        }
    });

    // Confirm password validation
    const confirmPasswordInputs = document.querySelectorAll('input[id$="ConfirmPassword"]');
    
    confirmPasswordInputs.forEach(input => {
        input.addEventListener('input', function() {
            const passwordId = this.id.replace('Confirm', '');
            const passwordInput = document.getElementById(passwordId);
            
            if (this.value !== passwordInput.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    });

    document.addEventListener('DOMContentLoaded', function () {
    const authTabBtns = document.querySelectorAll('.auth-tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    authTabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const tab = btn.getAttribute("data-tab");

            // Remove active class from all buttons and forms
            authTabBtns.forEach((b) => b.classList.remove("active"));
            authForms.forEach((form) => form.classList.remove("active"));

            // Add active class to clicked button and corresponding form
            btn.classList.add("active");

            const targetForm = document.getElementById(tab + "LoginForm");
            if (targetForm) {
                targetForm.classList.add("active");
                console.log("Auth tab script running...");

            }
        });
    });
});


    // Form submission handling
    // const loginForms = document.querySelectorAll('form[id$="LoginForm"]');
    // const registerForms = document.querySelectorAll('form[id$="RegisterForm"]');
    
    // loginForms.forEach(form => {
    //     form.addEventListener('submit', function(e) {
    //         e.preventDefault();
            
    //         // Simple form validation
    //         const email = this.querySelector('input[type="email"]').value;
    //         const password = this.querySelector('input[type="password"]').value;
            
    //         if (email && password) {
    //             // In a real app, this would send a login request to the server
    //             // For demo, we'll redirect based on user type
    //             if (this.id === 'userLoginForm') {
    //                 window.location.href = 'user-dashboard.html';
    //             } else if (this.id === 'driverLoginForm') {
    //                 window.location.href = 'driver-dashboard.html';
    //             } else if (this.id === 'adminLoginForm') {
    //                 window.location.href = 'admin-dashboard.html';
    //             }
    //         } else {
    //             alert('Please fill in all required fields.');
    //         }
    //     });
    // });
    
    // registerForms.forEach(form => {
    //     form.addEventListener('submit', function(e) {
    //         e.preventDefault();
            
    //         // Validate passwords match
    //         const password = this.querySelector('input[name="password"]').value;
    //         const confirmPassword = this.querySelector('input[name="confirmPassword"]').value;
            
    //         if (password !== confirmPassword) {
    //             alert('Passwords do not match.');
    //             return;
    //         }
            
    //         // Check terms agreement
    //         const termsCheckbox = this.querySelector('input[name="terms"]');
    //         if (!termsCheckbox.checked) {
    //             alert('Please agree to the Terms of Service and Privacy Policy.');
    //             return;
    //         }
            
    //         // Check all required fields
    //         const requiredFields = this.querySelectorAll('[required]');
    //         let isValid = true;
            
    //         requiredFields.forEach(field => {
    //             if (!field.value && field.type !== 'checkbox') {
    //                 isValid = false;
    //             }
    //         });
            
    //         if (isValid) {
    //             // In a real app, this would send a registration request to the server
    //             // For demo, we'll redirect to login page
    //             alert('Registration successful! Please log in.');
    //             window.location.href = 'login.html';
    //         } else {
    //             alert('Please fill in all required fields.');
    //         }
    //     });
    // });

    // Social auth buttons
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real app, this would initiate OAuth flow
            alert(`${this.textContent.trim()} authentication is not implemented in this demo.`);
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.querySelector("#phone");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const otpSection = document.getElementById("otpSection");
    const loginWithOtpBtn = document.getElementById("loginWithOtpBtn");

    const iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        geoIpLookup: function (callback) {
            fetch('https://ipinfo.io/json')
                .then(res => res.json())
                .then(data => callback(data.country))
                .catch(() => callback("us"));
        },
        nationalMode: false,
        separateDialCode: true,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js"
    });

    phoneInput.addEventListener("keydown", function (e) {
        const dialCodeLength = iti.getSelectedCountryData().dialCode.length + 1;
        if (phoneInput.selectionStart < dialCodeLength && e.key === "Backspace") {
            e.preventDefault();
        }
    });

    sendOtpBtn.addEventListener("click", async () => {
        const fullPhone = iti.getNumber();
        phoneInput.value = fullPhone;

        if (!fullPhone) {
            alert("Please enter your phone number.");
            return;
        }

        try {
            const res = await fetch("/verify_phone", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ phone: fullPhone }),
            });

            if (res.redirected) {
                window.location.href = res.url;
                return;
            }

            const text = await res.text();
            alert(text);
        } catch (err) {
            alert("Server error. Try again.");
        }
    });
    
});

document.querySelectorAll(".auth-tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".auth-tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".auth-form").forEach((form) => form.classList.remove("active"));

    const target = btn.getAttribute("data-tab");
    document.getElementById(target + "LoginForm")?.classList.add("active");
    if (target === "register") {
      document.getElementById("registerForm")?.classList.add("active");
    }
  });
});

const phoneInput = document.querySelector("#phone");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpSection = document.getElementById("otpSection");
const loginWithOtpBtn = document.getElementById("loginWithOtpBtn");

if (phoneInput && sendOtpBtn) {
  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "auto",
    geoIpLookup: function (callback) {
      fetch("https://ipinfo.io/json")
        .then((res) => res.json())
        .then((data) => callback(data.country))
        .catch(() => callback("us"));
    },
    nationalMode: false,
    separateDialCode: true,
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
  });

  sendOtpBtn.addEventListener("click", async () => {
    const fullPhone = iti.getNumber();
    phoneInput.value = fullPhone;

    if (!fullPhone) {
      alert("Please enter your phone number.");
      return;
    }

    try {
      const res = await fetch("/verify_phone", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ phone: fullPhone }),
      });

      const data = await res.json();
      if (data.success) {
        otpSection.style.display = "block";
        loginWithOtpBtn.style.display = "block";
        sendOtpBtn.innerText = "Resend OTP";
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      alert("Server error. Try again.");
    }
  });
}
const regPhoneInput = document.querySelector("#reg_phone");
if (regPhoneInput) {
  const itiRegister = window.intlTelInput(regPhoneInput, {
    initialCountry: "auto",
    geoIpLookup: function (callback) {
      fetch("https://ipinfo.io/json")
        .then((res) => res.json())
        .then((data) => callback(data.country))
        .catch(() => callback("us"));
    },
    nationalMode: false,
    separateDialCode: true,
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
  });

  document.getElementById("registerForm").addEventListener("submit", function () {
    regPhoneInput.value = itiRegister.getNumber();
  });
}
