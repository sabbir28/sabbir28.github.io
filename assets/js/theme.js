document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Check local storage for theme preference, default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';

    // Apply the saved theme
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) themeIcon.className = 'bi bi-moon-fill';
    } else {
        if (themeIcon) themeIcon.className = 'bi bi-sun-fill';
    }

    // Toggle event
    if (toggleButton) {
        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('light-theme');

            let theme = 'dark';
            if (document.body.classList.contains('light-theme')) {
                theme = 'light';
                if (themeIcon) themeIcon.className = 'bi bi-moon-fill';
            } else {
                if (themeIcon) themeIcon.className = 'bi bi-sun-fill';
            }

            localStorage.setItem('theme', theme);
        });
    }
});
