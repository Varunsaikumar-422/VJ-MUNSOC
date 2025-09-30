document.addEventListener('DOMContentLoaded', () => {

    // --- Animate sections on scroll ---
    const createObserver = (callback, threshold = 0.2) => {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold });
        return observer;
    };

    const observer = createObserver(target => target.classList.add('is-visible'));
    
    const heroSection = document.querySelector('.committee-hero');
    const detailsSection = document.querySelector('.committee-details');

    if (heroSection) observer.observe(heroSection);
    if (detailsSection) observer.observe(detailsSection);


    // --- Hamburger Menu Logic ---
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const closeMenu = document.querySelector('.close-menu');
    const navLinks = document.querySelector('.nav-links');
    const navLinksList = document.querySelectorAll('.nav-links a');

    if (hamburgerMenu && navLinks && closeMenu) {
        hamburgerMenu.addEventListener('click', () => {
            navLinks.classList.add('active');
        });

        const closeNav = () => {
            navLinks.classList.remove('active');
        }

        closeMenu.addEventListener('click', closeNav);

        navLinksList.forEach(link => {
            link.addEventListener('click', closeNav);
        });
    }
});