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
            
            // Set loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            formMessages.className = 'form-messages';
            
            // Prepare FormData
            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);
            
            try {
                // Using Web3Forms public API for form delivery to email
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });
                
                const result = await response.json();
                
                if (response.status === 200) {
                    formMessages.textContent = 'Thank you! Your message has been sent successfully.';
                    formMessages.classList.add('success');
                    contactForm.reset();
                } else {
                    formMessages.textContent = result.message || 'Something went wrong. Please try again later.';
                    formMessages.classList.add('error');
                }
            } catch (error) {
                console.error(error);
                formMessages.textContent = 'Network error. Please try again later.';
                formMessages.classList.add('error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    }
});
