document.addEventListener("DOMContentLoaded", function() {

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a')

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;

        if (currentPath === linkPath) {
            link.classList.add('active')
        }

    })
})