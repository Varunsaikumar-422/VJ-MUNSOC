document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const loadingScreen = document.getElementById('loading-screen');
    const heroSection = document.getElementById('hero');
    const backgroundImage = document.querySelector('.background-image');
    const navbar = document.querySelector('.navbar');
    const statsSection = document.getElementById('stats');
    const letterSection = document.getElementById('letter');
    const committeesSection = document.getElementById('committees');
    const itinerarySection = document.getElementById('itinerary');
    const secretariatSection = document.getElementById('secretariat');
    const footerSection = document.querySelector('.footer-section');


    // --- Loading Screen Logic ---
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        heroSection.style.opacity = '1';
        backgroundImage.classList.add('zoom-in');
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 1000);
    }, 4000);

    // --- Navbar Scroll Logic ---
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
             navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Smooth Scrolling for Nav Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerOffset = navbar.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
            }
        });
    });

    // --- Countdown Timer Logic ---
    const countdownInterval = setInterval(() => {
        const targetDate = new Date('2025-10-14T00:00:00').getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        } else {
            clearInterval(countdownInterval);
            document.getElementById('countdown').innerHTML = "<div class='event-started'>The Event Has Started!</div>";
        }
    }, 1000);

    // --- Generic Observer Function for Animations ---
    const createObserver = (element, callback, threshold = 0.5) => {
        if (!element) return;
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold });
        observer.observe(element);
    };

    // --- Stats Counter Logic ---
    createObserver(statsSection, () => {
        document.querySelectorAll('.stat-number').forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const increment = target / 200;
            const updateCount = () => {
                if (count < target) {
                    count += increment;
                    counter.innerText = Math.ceil(count).toLocaleString('en-IN');
                    setTimeout(updateCount, 10);
                } else {
                    if (target === 120000) counter.innerText = '₹' + target.toLocaleString('en-IN');
                    else if (target === 250) counter.innerText = target.toLocaleString('en-IN') + '+';
                    else counter.innerText = target.toLocaleString('en-IN');
                }
            };
            updateCount();
        });
    });

    // --- Animate Sections on Scroll ---
    createObserver(letterSection, (target) => { target.classList.add('is-visible'); }, 0.2);
    createObserver(committeesSection, (target) => { target.classList.add('is-visible'); }, 0.4);
    createObserver(itinerarySection, (target) => { target.classList.add('is-visible'); }, 0.2);
    createObserver(secretariatSection, (target) => { target.classList.add('is-visible'); }, 0.1);
    createObserver(footerSection, (target) => { target.classList.add('is-visible'); }, 0.2);

    // --- Itinerary Tab Logic ---
    const itineraryTabsContainer = document.querySelector('.itinerary-tabs');
    const daySchedules = document.querySelectorAll('.day-schedule');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const activeGlider = document.querySelector('.active-glider');

    function updateGliderPosition(activeTab) {
        if (!activeTab || !activeGlider) return;
        
        const tabWidth = activeTab.offsetWidth;
        const tabLeft = activeTab.offsetLeft;

        activeGlider.style.width = `${tabWidth}px`;
        activeGlider.style.left = `${tabLeft}px`;
    }

    if (itineraryTabsContainer) {
        itineraryTabsContainer.addEventListener('click', (e) => {
            const clickedTab = e.target.closest('.tab-btn');
            if (!clickedTab) return;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            clickedTab.classList.add('active');
            
            updateGliderPosition(clickedTab);

            const targetDay = clickedTab.dataset.day;
            daySchedules.forEach(schedule => {
                schedule.classList.toggle('active', schedule.id === targetDay);
            });
        });
    
        const initialActiveTab = document.querySelector('.tab-btn.active');
        if (initialActiveTab) {
            updateGliderPosition(initialActiveTab);
        }

        window.addEventListener('resize', () => {
            const currentActiveTab = document.querySelector('.tab-btn.active');
            if (currentActiveTab) {
                updateGliderPosition(currentActiveTab);
            }
        });
    }
    
    // --- Hamburger Menu Logic ---
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const closeMenu = document.querySelector('.close-menu');
    const navLinks = document.querySelector('.nav-links');
    const navLinksList = document.querySelectorAll('.nav-links li a');

    hamburgerMenu.addEventListener('click', () => {
        navLinks.classList.add('active');
        navbar.classList.add('menu-open'); // FIX: Add class to navbar
    });

    const closeNav = () => {
        navLinks.classList.remove('active');
        navbar.classList.remove('menu-open'); // FIX: Remove class from navbar
    }
    
    closeMenu.addEventListener('click', closeNav);

    navLinksList.forEach(link => {
        link.addEventListener('click', closeNav);
    });
});