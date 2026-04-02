/**
 * TERMINAL INTERACTIVA "QUINE" - Claudio Fanelli Portfolio 2026
 * Mapeo de comandos y filtrado de secciones
 */

const COMMANDS = {
    help: () => `
        <div class="terminal-help">
            <p><strong>Comandos de navegación:</strong></p>
            <ul style="list-style: none; padding: 0; margin: 10px 0;">
                <li><span style="color: #3b82f6">go proyectos</span> - Ver mis trabajos</li>
                <li><span style="color: #3b82f6">go habilidades</span> - Mi stack técnico</li>
                <li><span style="color: #3b82f6">go sobre-mi</span> - Mi historia</li>
                <li><span style="color: #3b82f6">go contacto</span> - Hablar conmigo</li>
            </ul>
            <p><strong>Utilidades:</strong></p>
            <ul style="list-style: none; padding: 0;">
                <li><span style="color: #3b82f6">ls</span> - Listar secciones</li>
                <li><span style="color: #3b82f6">clear</span> - Limpiar terminal</li>
                <li><span style="color: #3b82f6">sudo hire</span> - Acceso prioritario</li>
            </ul>
        </div>`,
    
    ls: () => "Secciones disponibles: <b>proyectos</b>, <b>habilidades</b>, <b>acercademi</b>, <b>contacto</b>",
    
    whoami: () => "Claudio Fanelli Rodríguez. Full-Stack Developer Jr.",

    clear: () => {
        document.getElementById('terminal-output').innerHTML = '';
        return null;
    },

   'sudo hire': () => {
        const contact = document.getElementById('ContactoForm') || document.getElementById('contact');
        
        if (contact) {
            setTimeout(() => {
                toggleTerminal();
                contact.scrollIntoView({ behavior: 'smooth' });
            }, 1500);

            return `
                <div style="color: #27c93f; line-height: 1.4;">
                    <p>🔒 <b>[SUDO] PRIVILEGIOS CONCEDIDOS:</b></p>
                    <p>Detectando talento... 100%<br>
                    Iniciando protocolo de "Contratación Inmediata"...<br>
                    Preparando café virtual para la entrevista... ☕</p>
                    <p style="color: #3b82f6;"><i>Redirigiendo al sector de contacto. ¡Hagamos algo grande juntos!</i></p>
                </div>`;
        }
        return "<span style='color: #ff5f56'>⚠️ Error:</span> No encuentro el formulario, pero mi LinkedIn está listo en el footer.";
    }
};

function executeNavigation(target) {
    const sectionMap = {
        'proyectos': 'Proyectos', // Ajustado a tus IDs del HTML
        'habilidades': 'Habilidades',
        'acercademi': 'Acercademi',
        'contacto': 'Contacto'
    };

    const targetId = sectionMap[target.toLowerCase()];
    const element = document.getElementById(targetId);

    if (element) {
        toggleTerminal();
        element.scrollIntoView({ behavior: 'smooth' });
        element.style.outline = "2px solid #3b82f6";
        setTimeout(() => element.style.outline = "none", 2000);
        return `Navegando a ${target}...`;
    } else {
        return `<span style="color: #ff5f56">Error:</span> La sección '${target}' no existe. Escribe 'ls' para ver las opciones.`;
    }
}

// --- CONFIGURACIÓN DEL MOTOR ---
function toggleTerminal() {
    const terminalScreen = document.getElementById('terminal-screen');
    const terminalInput = document.querySelector('.terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    if (!terminalScreen) return;
    
    terminalScreen.classList.toggle('terminal-hidden');
    
    // Si la terminal se acaba de abrir
    if (!terminalScreen.classList.contains('terminal-hidden')) {
        terminalInput.focus();
        
        // Si la terminal está vacía, lanzamos el help automático
        if (terminalOutput.innerHTML.trim() === "") {
            const helpContent = COMMANDS.help();
            terminalOutput.innerHTML = `<div><span style="color: #27c93f">➜</span> help</div>`;
            terminalOutput.innerHTML += `<div>${helpContent}</div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.querySelector('.terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalScreen = document.getElementById('terminal-screen');

    if(!terminalInput) return;

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const fullInput = terminalInput.value.trim();
            const parts = fullInput.toLowerCase().split(' ');
            const cmd = parts[0];
            const arg = parts[1];

            if (fullInput !== "") {
                terminalOutput.innerHTML += `<div><span style="color: #27c93f">➜</span> ${fullInput}</div>`;
            }

            // Lógica de "go"
            if (cmd === 'go' && arg) {
                const navMessage = executeNavigation(arg);
                terminalOutput.innerHTML += `<div>${navMessage}</div>`;
            } 
            // Comando especial sudo hire
            else if (fullInput.toLowerCase() === 'sudo hire') {
                const response = COMMANDS['sudo hire']();
                terminalOutput.innerHTML += `<div>${response}</div>`;
            }
            // Comandos simples
            else if (COMMANDS[cmd]) {
                const response = COMMANDS[cmd]();
                if (response) terminalOutput.innerHTML += `<div>${response}</div>`;
            } 
            else if (fullInput !== "") {
                terminalOutput.innerHTML += `<div style="color: #ff5f56">Comando '${cmd}' no reconocido. Prueba con 'help'.</div>`;
            }

            terminalInput.value = '';
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    });

    // Tecla º
    window.addEventListener('keydown', (e) => {
        if (e.key === 'º' || (e.ctrlKey && e.key === 't')) {
            e.preventDefault();
            toggleTerminal();
        }
        if (e.key === 'Escape' && !terminalScreen.classList.contains('terminal-hidden')) {
            toggleTerminal();
        }
    });
});