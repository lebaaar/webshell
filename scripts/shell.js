const fileSystem = {
    '/': {
        type: 'dir',
        children: {
            'home': {
                type: 'dir',
                children: {
                    'user': {
                        type: 'dir',
                        children: {
                            '.env': { type: 'file', content: 'b3NlbQ==' }, // zih ni 8
                            'about.txt': { type: 'file', content: '8' }
                        }
                    }
                }
            },
            'bin': { type: 'dir', children: {} },
            'etc': { type: 'dir', children: {} },
            'usr': { type: 'dir', children: {} },
            'var': { type: 'dir', children: {} },
            'tmp': { type: 'dir', children: {} }
        }
    }
};

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
        print('  man        - Show manual (alias for help)');
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
document.addEventListener('click', () => {
    commandInput.focus();
});

// Welcome message
print('Welcome! We want DragonHack tickets :)', 'success');
print('Type "help" to see available commands.', 'info');
print('');

updatePrompt();
commandInput.focus();
