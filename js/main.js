// Main JavaScript file

// ========================================
// DOM Elements
// ========================================
const themeToggle = document.getElementById('themeToggle');
const backToTopBtn = document.getElementById('backToTop');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainNav = document.getElementById('mainNav');
const currentYearSpan = document.getElementById('currentYear');

// ========================================
// Theme Management
// ========================================
function initTheme() {
    const savedTheme = localStorage.getItem('siteTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    
    if (themeToggle) {
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    
    localStorage.setItem('siteTheme', isDark ? 'dark' : 'light');
}

// ========================================
// Mobile Menu
// ========================================
function initMobileMenu() {
    if (!mobileMenuBtn || !mainNav) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        const isExpanded = mainNav.classList.contains('active');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
        mobileMenuBtn.innerHTML = isExpanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    // Close menu when clicking on a link
    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', false);
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

// ========================================
// Active Navigation Highlight
// ========================================
function initActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Handle index page
        if ((currentPath === '/' || currentPath === '/index.html') && href === 'index.html') {
            link.classList.add('active');
        }
        // Handle other pages
        else if (currentPath.includes(href) && href !== 'index.html') {
            link.classList.add('active');
        }
        // Handle catalog page
        else if (currentPath.includes('catalog.html') && href === 'catalog.html') {
            link.classList.add('active');
        }
        // Handle about page
        else if (currentPath.includes('about.html') && href === 'about.html') {
            link.classList.add('active');
        }
        // Handle contact page
        else if (currentPath.includes('contact.html') && href === 'contact.html') {
            link.classList.add('active');
        }
    });
}

// ========================================
// Back to Top Button
// ========================================
function initBackToTop() {
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// Current Year in Footer
// ========================================
function setCurrentYear() {
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// ========================================
// Accordion Component
// ========================================
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            accordionItem.classList.toggle('active');
            
            // Close other accordion items (optional)
            // accordionHeaders.forEach(otherHeader => {
            //     if (otherHeader !== header) {
            //         otherHeader.parentElement.classList.remove('active');
            //     }
            // });
        });
    });
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, isError = false) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    if (isError) toast.classList.add('error');
    
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.remove('error');
    }, 3000);
}

// ========================================
// Initialize All Components
// ========================================
function init() {
    initTheme();
    initMobileMenu();
    initActiveNav();
    initBackToTop();
    setCurrentYear();
    initAccordion();
    initSmoothScroll();
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);