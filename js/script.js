// script.js
document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/api';
    
    // UI Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const messageContainer = document.getElementById('message-container');
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-box input');
    const bookButtons = document.querySelectorAll('.book-btn');
    const editProfileForm = document.getElementById('editProfileForm');

    // Message Display Functions
    function showMessage(message, type) {
        if (messageContainer) {
            messageContainer.innerHTML = `
                <div class="${type}-message">
                    ${message}
                </div>
            `;
            setTimeout(() => {
                messageContainer.innerHTML = '';
            }, 3000);
        }
    }

    // Auth Handlers
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            const password = e.target.querySelector('input[type="password"]').value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                } else {
                    showMessage(data.message || 'Login failed', 'error');
                }
            } catch (error) {
                showMessage('An error occurred. Please try again.', 'error');
            }
        });
    }

    // Register Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = e.target.querySelector('input[type="text"]').value;
            const email = e.target.querySelector('input[type="email"]').value;
            const passwords = e.target.querySelectorAll('input[type="password"]');

            if (passwords[0].value !== passwords[1].value) {
                showMessage('Passwords do not match!', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        password: passwords[0].value
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showMessage('Registration successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                } else {
                    showMessage(data.message || 'Registration failed', 'error');
                }
            } catch (error) {
                showMessage('An error occurred. Please try again.', 'error');
            }
        });
    }

    // Dashboard Functions
    function initializeDashboard() {
        if (window.location.pathname.includes('dashboard.html')) {
            if (!checkAuthStatus()) {
                window.location.href = 'login.html';
                return;
            }

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            updateDashboardUI(user);
            loadBookings();
            setupFilterHandlers();
        }
    }

    function updateDashboardUI(user) {
        const userNameElement = document.getElementById('userName');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const memberSince = document.getElementById('memberSince');

        if (userNameElement) userNameElement.textContent = user.name;
        if (profileName) profileName.textContent = user.name;
        if (profileEmail) profileEmail.textContent = user.email;
        if (memberSince) memberSince.textContent = new Date(user.createdAt).toLocaleDateString();
    }

    async function loadBookings() {
        try {
            const response = await fetch(`${API_URL}/bookings`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            updateBookingsUI(data);
        } catch (error) {
            showMessage('Failed to load bookings', 'error');
        }
    }

    // Booking Handlers
    bookButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!checkAuthStatus()) {
                showMessage('Please login to book', 'error');
                setTimeout(() => window.location.href = 'login.html', 2000);
                return;
            }

            const destination = this.closest('.card-content').querySelector('h3').textContent;
            try {
                const response = await fetch(`${API_URL}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ destination })
                });

                if (response.ok) {
                    showMessage('Booking successful!', 'success');
                    setTimeout(() => window.location.href = 'dashboard.html', 2000);
                } else {
                    throw new Error('Booking failed');
                }
            } catch (error) {
                showMessage('Booking failed. Please try again.', 'error');
            }
        });
    });

    // Profile Management
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('editName').value;
            const email = document.getElementById('editEmail').value;

            try {
                const response = await fetch(`${API_URL}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ name, email })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('user', JSON.stringify(data));
                    showMessage('Profile updated successfully!', 'success');
                    updateDashboardUI(data);
                    closeModal('editProfileModal');
                } else {
                    showMessage(data.message || 'Update failed', 'error');
                }
            } catch (error) {
                showMessage('Failed to update profile', 'error');
            }
        });
    }

    // Auth Utilities
    function checkAuthStatus() {
        return !!localStorage.getItem('token');
    }

    function updateUIForAuth() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const loginBtn = document.querySelector('.login-btn');

        if (token && loginBtn) {
            loginBtn.textContent = `Welcome, ${user.name}`;
            loginBtn.href = 'dashboard.html';
        }
    }

    // Modal Handlers
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'flex';
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }

    // Event Listeners
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });

    // Logout Handler
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../public/index.html';
        });
    }

    // Initialize
    updateUIForAuth();
    initializeDashboard();
});