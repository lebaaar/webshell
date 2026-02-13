import { fileSystem, fileContents } from './system.js';

// Shell state
let currentPath = '/home/user';
let commandHistory = [];
let historyIndex = -1;
let theme = localStorage.getItem('theme') || 'dark';

// Apply saved theme
if (theme === 'light') {
    document.body.classList.add('light');
}

const output = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const promptElement = document.getElementById('prompt');

// Update prompt based on current path
function updatePrompt() {
    const displayPath = currentPath === '/home/user' ? '~' : currentPath;
    promptElement.textContent = `user@nasa:${displayPath}$ `;
}

// Print to terminal
function print(text, className = '') {
    const line = document.createElement('div');
    line.className = `line ${className}`;
    line.textContent = text;
    output.appendChild(line);
    scrollToBottom();
}

function printHTML(html, className = '') {
    const line = document.createElement('div');
    line.className = `line ${className}`;
    line.innerHTML = html;
    output.appendChild(line);
    scrollToBottom();
}

function scrollToBottom() {
    const terminal = document.getElementById('terminal');
    terminal.scrollTop = terminal.scrollHeight;
}

// Navigate file system
function resolvePath(path) {
    if (path.startsWith('/')) {
        return path;
    }

    if (path === '~') {
        return '/home/user';
    }

    if (path.startsWith('~/')) {
        return '/home/user' + path.slice(1);
    }

    if (path === '.') {
        return currentPath;
    }

    if (path === '..') {
        const parts = currentPath.split('/').filter(p => p);
        parts.pop();
        return '/' + parts.join('/');
    }

    if (path.startsWith('../')) {
        const parts = currentPath.split('/').filter(p => p);
        parts.pop();
        const remaining = path.slice(3);
        return '/' + parts.join('/') + '/' + remaining;
    }

    return currentPath + (currentPath === '/' ? '' : '/') + path;
}

function getNode(path) {
    const parts = path.split('/').filter(p => p);
    let node = fileSystem['/'];

    for (const part of parts) {
        if (!node.children || !node.children[part]) {
            return null;
        }
        node = node.children[part];
    }

    return node;
}

// Commands
const commands = {
    help() {
        print('Available commands:', 'info');
        print('  help       - Show this help message');
        print('  man        - Show manual for a command');
        print('  ls         - List directory contents');
        print('  cat        - Display file contents');
        print('  clear      - Clear the terminal');
        print('  pwd        - Print working directory');
        print('  cd         - Change directory');
        print('  echo       - Print text to terminal');
        print('  sudo       - Execute command as superuser');
        print('  whoami     - Display team information');
        print('  neofetch   - Display system information');
        print('  draw       - Draw ASCII art (dragon|cat|dog)');
        print('  uptime     - Show system uptime');
        print('  ping       - Ping a host');
        print('  git        - Git operations (branch|status)');
        print('  checksum   - Hash generator');
        print('  theme      - Switch between light/dark theme');
    },

    man() {

    },

    clear() {
        output.innerHTML = '';
    },

    echo(args) {
        print(args.join(' '));
    },

    pwd() {
        print(currentPath);
    },

    uptime() {
        const now = new Date();
        const hours = Math.floor(Math.random() * 100) + 10;
        const minutes = Math.floor(Math.random() * 60);
        const users = Math.floor(Math.random() * 3) + 1;
        const load1 = (Math.random() * 2).toFixed(2);
        const load5 = (Math.random() * 2).toFixed(2);
        const load15 = (Math.random() * 2).toFixed(2);
        
        const time = now.toTimeString().split(' ')[0];
        print(`${time} up ${hours}:${minutes.toString().padStart(2, '0')}, ${users} user, load average: ${load1}, ${load5}, ${load15}`);
    },

    theme(args) {
        if (!args[0]) {
            print(`Current theme: ${theme}`, 'info');
            print('Usage: theme <light|dark>');
            return;
        }

        const newTheme = args[0].toLowerCase();
        
        if (newTheme !== 'light' && newTheme !== 'dark') {
            print('Invalid theme. Use: light or dark', 'error');
            return;
        }

        theme = newTheme;
        localStorage.setItem('theme', theme);
        
        if (theme === 'light') {
            document.body.classList.add('light');
        } else {
            document.body.classList.remove('light');
        }
        
        print(`Theme switched to ${theme}`, 'success');
    },

    ls(args) {
        const targetPath = args[0] ? resolvePath(args[0]) : currentPath;
        const node = getNode(targetPath);
        
        if (!node) {
            print(`ls: cannot access '${args[0] || targetPath}': No such file or directory`, 'error');
            return;
        }
        
        if (node.type === 'file') {
            print(args[0] || targetPath.split('/').pop());
            return;
        }
        
        const children = node.children || {};
        const items = Object.keys(children);
        
        if (items.length === 0) {
            return;
        }
        
        items.sort().forEach(name => {
            const child = children[name];
            if (child.type === 'dir') {
                printHTML(`<span style="color: #5c9fd8; font-weight: bold;">${name}/</span>`);
            } else {
                print(name);
            }
        });
    }
};

// Process command
function processCommand(input) {
    const trimmed = input.trim();

    if (!trimmed) {
        return;
    }

    // Add to history
    commandHistory.push(trimmed);
    historyIndex = commandHistory.length;

    // Echo command
    const displayPath = currentPath === '/home/user' ? '~' : currentPath;
    printHTML(`<span class="prompt">user@nasa:${displayPath}$</span>${trimmed}`);

    // Parse command
    const parts = trimmed.split(/\s+/).filter(p => p);
    const cmd = parts[0];
    const args = parts.slice(1);

    // Execute command
    if (commands[cmd]) {
        commands[cmd](args);
    } else {
        print(`${cmd}: command not found`, 'error');
    }
}

// Event listeners
commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = commandInput.value;
        processCommand(command);
        commandInput.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            commandInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            commandInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            commandInput.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        // Could implement tab completion here
    }
});

// Keep input focused
document.addEventListener('click', (e) => {
    // Don't focus input if clicking on help button or modal
    if (!e.target.closest('.help-button') && !e.target.closest('.modal-content')) {
        commandInput.focus();
    }
});

// Modal functionality
const modal = document.getElementById('help-modal');
const helpBtn = document.getElementById('help-btn');
const closeBtn = document.querySelector('.close');

helpBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    commandInput.focus();
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        commandInput.focus();
    }
});

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        commandInput.focus();
    }
});

// Welcome message
print('Welcome! We want DragonHack tickets :)', 'success');
print('Type "help" to see available commands.', 'info');
print('');

updatePrompt();
commandInput.focus();

