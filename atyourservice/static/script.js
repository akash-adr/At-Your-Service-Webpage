document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar & Scroll Effects
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Handle reveal animations on scroll
        revealOnScroll();
    });

    // 1b. Mobile Menu Toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('active');
            
            // Toggle hamburger icon animation or state if needed
            // Currently just toggling the menu visibility
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target) && mobileMenu.classList.contains('active')) {
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('active');
            }
        });
    }


    // 2. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Offset for sticky navbar
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Tabs Functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Show corresponding pane
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 4. Scroll Reveal Animation Logic
    const revealElements = document.querySelectorAll('.reveal-up');
    
    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        const revealPoint = 100; // Trigger point
        
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    }
    
    //Trigger once on load
    revealOnScroll();

    // 5. Contact Form Submission Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const formMessages = document.getElementById('formMessages');

            // Basic validation check
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            // Collect field values
            const name    = document.getElementById('name').value.trim();
            const email   = document.getElementById('email').value.trim();
            const phone   = document.getElementById('phone').value.trim();
            const message = document.getElementById('message').value.trim();

            // Guard: required fields
            if (!name || !email || !message) {
                formMessages.textContent = 'Please fill in all required fields.';
                formMessages.className = 'form-messages error';
                return;
            }

            // Set loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            formMessages.className = 'form-messages';

            try {
                const response = await fetch('/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ name, email, phone, message })
                });

                const result = await response.json();

                if (result.success) {
                    formMessages.textContent = 'Thank you! Your message has been sent successfully.';
                    formMessages.classList.add('success');
                    contactForm.reset();
                } else {
                    formMessages.textContent = result.error || 'Something went wrong. Please try again later.';
                    formMessages.classList.add('error');
                }
            } catch (error) {
                console.error(error);
                formMessages.textContent = 'Network error. Please check that the server is running and try again.';
                formMessages.classList.add('error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    }
});
