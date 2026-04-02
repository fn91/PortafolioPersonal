/**
 * LOCAL CONTEXT SYSTEM - Claudio Fanelli 2026
 * Saludo dinámico basado en el reloj del sistema.
 */

const initLocalContext = () => {
    // 1. Seleccionar el elemento donde irá el saludo
    const welcomeLine = document.querySelector('.hero-subtitle') || document.querySelector('h1');
    if (!welcomeLine) return;

    // 2. Obtener la hora actual del navegador (0-23)
    const hour = new Date().getHours();
    let greeting = "";

    // 3. Determinar el saludo según el tramo horario
    if (hour >= 6 && hour < 12) {
        greeting = "¡Buenos días! 🌅";
    } else if (hour >= 12 && hour < 20) {
        greeting = "¡Buenas tardes! ☀️";
    } else {
        greeting = "¡Buenas noches! 🌙";
    }

    // 4. Inyectar el saludo antes del contenido original
    // Usamos un pequeño delay para que se sienta como una "carga" orgánica
    setTimeout(() => {
        welcomeLine.innerHTML = `<span class="fade-in-text">${greeting}</span> <br> ${welcomeLine.innerHTML}`;
    }, 500);
};

document.addEventListener('DOMContentLoaded', initLocalContext);