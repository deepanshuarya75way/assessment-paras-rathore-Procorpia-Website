// ================= AUTH NAV STATE =================
// Runs on every page that includes this script.
// If a JWT token exists in localStorage, replace the Login/Sign Up buttons
// with the user's name and a Log Out button. Otherwise show the auth buttons.
(function updateAuthNav() {
    const container = document.getElementById('nav-auth');
    if (!container) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        container.innerHTML =
            '<span class="nav-username"><i class="fas fa-user-circle"></i> ' + user.fullName + '</span>' +
            '<button class="nav-login-btn" id="logoutBtn">Log Out</button>';

        document.getElementById('logoutBtn').addEventListener('click', function () {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'demo.html';
        });
    } else {
        container.innerHTML =
            '<a href="Login.html" class="nav-login-btn">Log In</a>' +
            '<a href="SignUp.html" class="nav-signup-btn">Sign Up <i class="fas fa-arrow-right"></i></a>';
    }
})();

// ================= MOBILE MENU =================
// Select DOM elements for the mobile navigation menu
const menuToggle = document.getElementById('mobile-menu');
const nav = document.querySelector('nav');

// Toggle the 'active' class on the nav element when the menu icon is clicked
menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    const icon = menuToggle.querySelector('i');

    // Switch between the hamburger ('fa-bars') and close ('fa-times') icons
    if (nav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// ================= STICKY HEADER =================
// Select the main header element
const header = document.getElementById('main-header') || document.getElementById('header');

// Listen for scroll events on the window
if (header) {
    window.addEventListener('scroll', () => {
        // If the user scrolls down more than 50px, add the 'scrolled' class to change its appearance
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            // Remove the 'scrolled' class when back at the top
            header.classList.remove('scrolled');
        }
    });
}

// ================= SCROLL ANIMATIONS =================
// Configuration for the IntersectionObserver indicating when animations should trigger
const observerOptions = {
    root: null, // use the viewport as the root
    rootMargin: '0px',
    threshold: 0.15 // trigger when 15% of the element is visible
};

// Create a new IntersectionObserver to handle the fade-up animations
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        // Check if the observed element is currently in the viewport
        if (entry.isIntersecting) {
            const target = entry.target;
            // Add 'is-visible' class to trigger the CSS transition
            target.classList.add('is-visible');

            // If the element is the stats section or contains counter elements, start the number counting animation
            if (target.classList.contains('stats') || target.querySelector('.counter')) {
                startCounters();
            }

            // Stop observing the element once the animation has been triggered
            observer.unobserve(target);
        }
    });
}, observerOptions);

// Observe all elements that have the 'data-animate' attribute
document.querySelectorAll('[data-animate]').forEach((el) => {
    observer.observe(el);
});

// ================= STAT COUNTERS =================
// Flag to ensure the counters only animate once
let countersStarted = false;

// Function to animate the numerical counters from 0 to their target value
function startCounters() {
    if (countersStarted) return; // Prevent multiple triggers
    countersStarted = true;

    // Select all elements with the 'counter' class
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // Determines the duration of the animation (lower is slower counting)

    counters.forEach(counter => {
        // Recursive function to update the count
        const updateCount = () => {
            // Get the target value from the 'data-target' attribute
            const target = +counter.getAttribute('data-target');
            // Get the current value from the element's text
            const count = +counter.innerText;

            // Calculate the increment step
            const increment = target / speed;

            // If the current count is less than target, keep incrementing
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                // Call updateCount again after 15ms
                setTimeout(updateCount, 15);
            } else {
                // Ensure the final value matches the target exactly
                counter.innerText = target;
            }
        };

        // Start the animation for this counter
        updateCount();
    });
}

// ================= JOB APPLICATION MODAL =================
// Function to open the job application modal
function openJobModal(jobTitle) {
    const modal = document.getElementById('jobModal');
    const modalJobTitle = document.getElementById('modalJobTitle');

    if (modal && modalJobTitle) {
        modalJobTitle.textContent = jobTitle;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Function to close the job application modal
function closeJobModal() {
    const modal = document.getElementById('jobModal');

    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Add click handlers to all Apply Now buttons
document.querySelectorAll('.job-action .btn').forEach(function (button) {
    button.addEventListener('click', function (e) {
        e.preventDefault();
        const jobItem = this.closest('.job-list-item');
        if (jobItem) {
            const jobTitle = jobItem.querySelector('h3').textContent;
            // Clear URL formatting for job title to make it cleaner
            const formattedJob = encodeURIComponent(jobTitle.trim().replace(/\s+/g, '-'));
            window.location.href = `ApplicationForm.html?job=${formattedJob}`;
        }
    });
});

// Close modal when clicking outside
document.addEventListener('click', function (event) {
    const modal = document.getElementById('jobModal');
    const modalContainer = document.querySelector('.modal-container');

    if (modal && modal.classList.contains('active')) {
        if (modalContainer && !modalContainer.contains(event.target)) {
            closeJobModal();
        }
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeJobModal();
    }
});

// Handle form submission
const jobForm = document.getElementById('jobApplicationForm');
if (jobForm) {
    jobForm.addEventListener('submit', function (event) {
        event.preventDefault();
        alert('Thank you for applying! We have received your application and will contact you soon.');
        closeJobModal();
        jobForm.reset();
    });
}
