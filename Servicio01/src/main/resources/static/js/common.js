/**
 * FútbolStats - JavaScript Común
 * Gestión de tema (Dark/Light), Sidebar responsive, Toasts y Utilidades API
 */

const API_BASE = '/api';

// 1. Inicialización de tema inmediato
(function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
})();

// 2. Toggle de tema
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons();
}

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    const sunIcons = document.querySelectorAll('.icon-sun');
    const moonIcons = document.querySelectorAll('.icon-moon');
    
    sunIcons.forEach(icon => {
        if (isDark) {
            icon.classList.remove('hidden');
        } else {
            icon.classList.add('hidden');
        }
    });
    
    moonIcons.forEach(icon => {
        if (isDark) {
            icon.classList.add('hidden');
        } else {
            icon.classList.remove('hidden');
        }
    });
}

// 3. Manejo del Sidebar Móvil
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const openBtn = document.getElementById('sidebarOpenBtn');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    function open() {
        if (sidebar) sidebar.classList.remove('-translate-x-full');
        if (backdrop) {
            backdrop.classList.remove('hidden');
            setTimeout(() => backdrop.classList.add('opacity-100'), 10);
        }
    }

    function close() {
        if (sidebar) sidebar.classList.add('-translate-x-full');
        if (backdrop) {
            backdrop.classList.remove('opacity-100');
            setTimeout(() => backdrop.classList.add('hidden'), 200);
        }
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
}

// 4. Resaltado automático de módulo activo
function highlightActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('[data-nav-link]');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const isCurrent = (currentPath === href) || 
                          (currentPath === '' && href === 'index.html') ||
                          (currentPath === '/' && href === 'index.html');

        if (isCurrent) {
            link.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
            link.classList.add('bg-emerald-600', 'text-white', 'shadow-sm', 'font-semibold');
            
            // Icon color inside active link
            const icon = link.querySelector('svg');
            if (icon) {
                icon.classList.remove('text-slate-500', 'dark:text-slate-400');
                icon.classList.add('text-white');
            }
        }
    });
}

// 5. Notificaciones Toast globales
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto transform transition-all duration-300 translate-y-4 opacity-0 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
        type === 'success' 
            ? 'bg-emerald-500 text-white border-emerald-600' 
            : type === 'error' 
                ? 'bg-rose-500 text-white border-rose-600' 
                : 'bg-slate-800 text-white border-slate-700'
    }`;

    const iconSvg = type === 'success'
        ? '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
        : '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';

    toast.innerHTML = `
        ${iconSvg}
        <span class="flex-1">${message}</span>
        <button class="text-white/80 hover:text-white" onclick="this.parentElement.remove()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
    `;

    container.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    });

    // Auto-eliminar a los 3.5 segundos
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// 6. Formateo de fechas a formato amigable
function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    try {
        const [year, month, day] = fechaStr.split('-');
        return `${day}/${month}/${year}`;
    } catch {
        return fechaStr;
    }
}

// 7. Verificación de estado de la API
async function checkApiHealth() {
    const statusDot = document.getElementById('apiStatusDot');
    const statusText = document.getElementById('apiStatusText');
    if (!statusDot) return;

    try {
        const res = await fetch(`${API_BASE}/partidos`);
        if (res.ok) {
            statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
            if (statusText) statusText.textContent = 'API Conectada';
        } else {
            statusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500';
            if (statusText) statusText.textContent = 'API Error ' + res.status;
        }
    } catch (e) {
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500';
        if (statusText) statusText.textContent = 'API Desconectada';
    }
}

// Inicializar al cargar DOM
document.addEventListener('DOMContentLoaded', () => {
    updateThemeIcons();
    initSidebar();
    highlightActiveNav();
    checkApiHealth();
});
