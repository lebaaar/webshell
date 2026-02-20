import { fileSystem, fileContents } from './system.js';

// Shell state
let currentPath = '/home/user';
let commandHistory = [];
let historyIndex = -1;
let theme = localStorage.getItem('theme') || 'dark';
let lastTabInput = '';
let tabPressCount = 0;
let animationActive = false;

// Apply saved theme
if (theme === 'light') {
    document.body.classList.add('light');
}

const output = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const promptElement = document.getElementById('prompt');

// click anywhere to focus input
document.querySelector('body').addEventListener('click', () => {
    commandInput.focus();
});

// Update prompt based on current path
function updatePrompt() {
    const displayPath = currentPath === '/home/user' ? '~' : currentPath;
    promptElement.textContent = `user@nasa:${displayPath}$ `;
    // Update browser tab title
    document.title = `user@nasa:${displayPath}`;
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

function animationHelper(className = '') {
    const line = document.createElement('div');
    line.className = `line ${className}`;
    output.appendChild(line);

    let frameIndex = 1;
    const totalFrames = 6;

    const intervalId = setInterval(() => {
        fetch(`resources/ascii_animation/frame_${frameIndex}.txt`)
            .then((res) => res.text())
            .then((text) => {
                line.textContent = text;
                frameIndex = frameIndex % totalFrames + 1; // Loop frames
            })
            .catch((e) => console.error(e));
    }, 200); // Adjust the delay as needed

    document.addEventListener('keydown', function stopAnimation(event) {
        if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
            clearInterval(intervalId);
            document.removeEventListener('keydown', stopAnimation);
        }
    });
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

// Tab completion helpers
function getCommonPrefix(strings) {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
        while (strings[i].indexOf(prefix) !== 0) {
            prefix = prefix.substring(0, prefix.length - 1);
            if (prefix === '') return '';
        }
    }
    return prefix;
}

function getPathCompletions(partial) {
    const lastSlash = partial.lastIndexOf('/');
    let dirPath, prefix;
    
    if (lastSlash === -1) {
        dirPath = currentPath;
        prefix = partial;
    } else {
        const pathPart = partial.substring(0, lastSlash + 1);
        dirPath = resolvePath(pathPart);
        prefix = partial.substring(lastSlash + 1);
    }
    
    const node = getNode(dirPath);
    if (!node || node.type !== 'dir') return [];
    
    const children = node.children || {};
    const matches = Object.keys(children)
        .filter(name => name.startsWith(prefix))
        .map(name => {
            const child = children[name];
            const fullPrefix = lastSlash === -1 ? '' : partial.substring(0, lastSlash + 1);
            return fullPrefix + name + (child.type === 'dir' ? '/' : '');
        });
    
    return matches;
}

function handleTabCompletion() {
    const input = commandInput.value;
    const cursorPos = commandInput.selectionStart;
    const beforeCursor = input.substring(0, cursorPos);
    const parts = beforeCursor.split(/\s+/);

    // if second tab on same input
    if (input === lastTabInput) {
        tabPressCount++;
    } else {
        tabPressCount = 1;
        lastTabInput = input;
    }

    let matches = [];
    let isCommand = parts.length === 1 && !beforeCursor.includes(' ');

    if (isCommand) {
        // complete command names
        const partial = parts[0] || '';
        matches = Object.keys(commands).filter(cmd => cmd.startsWith(partial));
    } else {
        // complete dir paths
        const partial = parts[parts.length - 1] || '';
        matches = getPathCompletions(partial);
    }

    if (matches.length === 0) {
        return;
    }

    if (matches.length === 1) {
        // single match
        const match = matches[0];
        const partial = isCommand ? parts[0] : parts[parts.length - 1];
        const beforePartial = input.substring(0, cursorPos - partial.length);
        const afterCursor = input.substring(cursorPos);
        commandInput.value = beforePartial + match + afterCursor;
        commandInput.selectionStart = commandInput.selectionEnd = beforePartial.length + match.length;
        lastTabInput = commandInput.value;
    } else if (tabPressCount === 1) {
        // multiple matches
        const commonPrefix = getCommonPrefix(matches);
        const partial = isCommand ? parts[0] : parts[parts.length - 1];

        if (commonPrefix.length > partial.length) {
            const beforePartial = input.substring(0, cursorPos - partial.length);
            const afterCursor = input.substring(cursorPos);
            commandInput.value = beforePartial + commonPrefix + afterCursor;
            commandInput.selectionStart = commandInput.selectionEnd = beforePartial.length + commonPrefix.length;
            lastTabInput = commandInput.value;
        }
    } else {
        // second tab => echo current input line, then show matches
        const displayPath = currentPath === '/home/user' ? '~' : currentPath;
        printHTML(`<span class="prompt">user@nasa:${displayPath}$</span>${input}`);
        matches.forEach(match => {
            print(match);
        });
    }
}

// Helper function to check for unsupported flags
function hasFlags(args, commandName) {
    const flags = args.filter(arg => arg.startsWith('-'));
    if (flags.length > 0) {
        print(`${commandName}: flags are not supported`, 'info');
        return true;
    }
    return false;
}

// Commands
const commands = {
    help() {
        print('To learn about our team, type `cat about.txt`. Don\'t forget to try `dragon` as well:)', 'info');
        print('Available commands:', 'info');
        print('');
        print('Navigation:');
        print('    ls         - List directory contents');
        print('    cd         - Change directory');
        print('    pwd        - Print working directory');
        print('    cat        - Display file contents');
        print('    whoami     - Display current user');
        print('');
        print('File operations:');
        print('    touch      - Create a new file');
        print('    mkdir      - Create a new directory');
        print('    rm         - Remove a file');
        print('    rmdir      - Remove a directory');
        print('    cp         - Copy a file');
        print('    mv         - Move/rename a file');
        print('');
        print('Utilities:');
        print('    echo       - Print text to terminal');
        print('    clear      - Clear the terminal');
        print('    uptime     - Show system uptime');
        print('    theme      - Switch between light/dark theme');
        print('    git        - Show repo commits and branches');
        print('');
        print('Easter eggs:');
        print('    dragon     - Draw ASCII art of a dragon');
        print('    sudo       - Try it and see...');
        print('');
        print('Help:');
        print('    help       - Show this help message');
        print('    man        - Show manual for a command');
    },

    man(args) {
        if (!args[0]) {
            print('Usage: man <command>', 'info');
            return;
        }

        if (hasFlags(args, 'man')) return;

        const cmd = args[0];
        // check if command exists
        if (!commands[cmd]) {
            print(`No manual entry for ${cmd}`, 'error');
            return;
        }
        print(`Manual for ${cmd}: figure it out :)`, 'info');
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

    cd(args) {
        if (!args[0]) {
            currentPath = '/home/user';
            updatePrompt();
            return;
        }

        if (hasFlags(args, 'cd')) return;

        const targetPath = resolvePath(args[0]);
        const node = getNode(targetPath);

        if (!node) {
            print(`cd: ${args[0]}: No such file or directory`, 'error');
            return;
        }

        if (node.type !== 'dir') {
            print(`cd: ${args[0]}: Not a directory`, 'error');
            return;
        }

        currentPath = targetPath;
        updatePrompt();
    },

    uptime() {
        const now = new Date();
        const hours = Math.floor(Math.random() * 100) + 10;
        const minutes = Math.floor(Math.random() * 60);
        const users = 1;
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

        if (hasFlags(args, 'theme')) return;

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
        if (hasFlags(args, 'ls')) return;

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
    },

    cat(args) {
        if (!args[0]) {
            print('Usage: cat <filename>', 'info');
            return;
        }

        if (hasFlags(args, 'cat')) return;

        const targetPath = resolvePath(args[0]);
        const node = getNode(targetPath);
        if (!node) {
            print(`cat: ${args[0]}: No such file or directory`, 'error');
            return;
        }
        if (node.type === 'dir') {
            print(`cat: ${args[0]}: Is a directory`, 'error');
            return;
        }
        if (node.content) {
            printHTML(node.content);
        } else {
            print('');
        }
    },

    whoami() {
        // same as `cat about.txt`
        const aboutNode = getNode('/home/user/about.txt');
        if (aboutNode && aboutNode.content) {
            printHTML(aboutNode.content);
        } else {
            print('whoami: No such file or directory', 'error');
        }
    },

    rm(args) {
        if (!args[0]) {
            print('Usage: rm <filename>', 'info');
            return;
        }

        if (hasFlags(args, 'rm')) return;

        const targetPath = resolvePath(args[0]);
        const node = getNode(targetPath);
        if (!node) {
            print(`rm: ${args[0]}: No such file or directory`, 'error');
            return;
        }
        if (node.type === 'dir') {
            print(`rm: ${args[0]}: Is a directory`, 'error');
            return;
        }
        deleteNode(targetPath);
        print(`rm: ${args[0]}: File deleted`, 'success');
    },

    mv(args) {
        if (!args[0] || !args[1]) {
            print('Usage: mv <source> <destination>', 'info');
            return;
        }

        if (hasFlags(args, 'mv')) return;

        const sourcePath = resolvePath(args[0]);
        const destPath = resolvePath(args[1]);
        const node = getNode(sourcePath);
        if (!node) {
            print(`mv: ${args[0]}: No such file or directory`, 'error');
            return;
        }
        if (node.type === 'dir') {
            print(`mv: ${args[0]}: Is a directory`, 'error');
            return;
        }
        deleteNode(sourcePath);
        print(`mv: ${args[0]}: File moved to ${args[1]}`, 'success');
    },

    cp(args) {
        if (!args[0] || !args[1]) {
            print('Usage: cp <source> <destination>', 'info');
            return;
        }

        if (hasFlags(args, 'cp')) return;

        const sourcePath = resolvePath(args[0]);
        let destPath = resolvePath(args[1]);
        const sourceNode = getNode(sourcePath);

        if (!sourceNode) {
            print(`cp: ${args[0]}: No such file or directory`, 'error');
            return;
        }
        if (sourceNode.type === 'dir') {
            print(`cp: ${args[0]}: Is a directory`, 'error');
            return;
        }

        // Check if destination is a directory
        const destNode = getNode(destPath);
        if (destNode && destNode.type === 'dir') {
            // If destination is a directory, append the source filename
            const sourceFileName = sourcePath.split('/').filter(p => p).pop();
            destPath = destPath + (destPath.endsWith('/') ? '' : '/') + sourceFileName;
        }

        // Create the new file
        if (createNode(destPath, 'file')) {
            // Copy the content from source to destination
            const newDestNode = getNode(destPath);
            if (newDestNode && sourceNode.content) {
                newDestNode.content = sourceNode.content;
            }
            print(`cp: ${args[0]}: File copied to ${args[1]}`, 'success');
        } else {
            print(`cp: ${args[1]}: File already exists`, 'error');
        }
    },

    mkdir(args) {
        if (!args[0]) {
            print('Usage: mkdir <directory>', 'info');
            return;
        }

        if (hasFlags(args, 'mkdir')) return;

        const dirPath = resolvePath(args[0]);
        if (getNode(dirPath)) {
            print(`mkdir: ${args[0]}: Directory already exists`, 'error');
            return;
        }
        createNode(dirPath, 'dir');
        print(`mkdir: ${args[0]}: Directory created`, 'success');
    },

    rmdir(args) {
        if (!args[0]) {
            print('Usage: rmdir <directory>', 'info');
            return;
        }

        if (hasFlags(args, 'rmdir')) return;

        const dirPath = resolvePath(args[0]);
        const node = getNode(dirPath);
        if (!node) {
            print(`rmdir: ${args[0]}: No such file or directory`, 'error');
            return;
        }
        if (node.type !== 'dir') {
            print(`rmdir: ${args[0]}: Not a directory`, 'error');
            return;
        }
        deleteNode(dirPath);
        print(`rmdir: ${args[0]}: Directory deleted`, 'success');
    },

    touch(args) {
        if (!args[0]) {
            print('Usage: touch <filename>', 'info');
            return;
        }

        if (hasFlags(args, 'touch')) return;

        const filePath = resolvePath(args[0]);
        if (getNode(filePath)) {
            print(`touch: ${args[0]}: File already exists`, 'error');
            return;
        }
        createNode(filePath, 'file');
        print(`touch: ${args[0]}: File created`, 'success');
    },

    sudo(args) {
        if (!args[0]) {
            print('Usage: sudo <command>', 'info');
            return;
        }

        print('[sudo] password for user: ', 'info');

        setTimeout(() => {
            print('Sorry, try again.');
            print('[sudo] password for user: ', 'info');

            setTimeout(() => {
                print('Sorry, try again.');
                print('[sudo] password for user: ', 'info');

                setTimeout(() => {
                    print('sudo: 3 incorrect password attempts', 'error');
                    print('This incident will be reported to the administrator and you will go to jail.', 'error');
                    print('');
                    printHTML("<small style='font-size: 10px;'>Just kidding - there's no sudo access here ;)</small>", 'info');
                }, 500);
            }, 500);
        }, 500);
    },

    dragon() {
        print('Press Ctrl+C to stop the animation.', 'info');
        animationHelper();
        
        scrollToBottom();
    },

    git(args) {
        if (!args[0]) {
            print('Usage: git <command>', 'info');
            print('Available commands:');
            print('    log           - Show commit history');
            print('    branch        - List branches');
            print('    contributors  - List contributors with commit counts');
            return;
        }

        if (hasFlags(args, 'git')) return;

        const subcommand = args[0];

        switch(subcommand) {
            case 'log':
                print('Fetching commits...', 'info');
                fetch('https://api.github.com/repos/lebaaar/webshell/commits')
                    .then(res => res.json())
                    .then(commits => {
                        print('');
                        commits.slice(0, 20).forEach((commit, i) => {
                            const hash = commit.sha.substring(0, 7);
                            const author = commit.commit.author.name;
                            const date = new Date(commit.commit.author.date).toDateString();
                            const message = commit.commit.message;

                            printHTML(`<span style="color: #f9e2af;">commit ${hash}</span>`);
                            printHTML(`<span style="color: #89b4fa;">Author:</span> ${author}`);
                            printHTML(`<span style="color: #89b4fa;">Date:</span>   ${date}`);
                            print('');
                            print(`    ${message}`);
                            if (i < commits.length - 1) print('');
                        });
                    })
                    .catch(err => {
                        print('Failed to fetch commits from GitHub', 'error');
                    });
                break;

            case 'branch':
                print('Fetching branches...', 'info');
                fetch('https://api.github.com/repos/lebaaar/webshell/branches')
                    .then(res => res.json())
                    .then(branches => {
                        print('');
                        branches.forEach(branch => {
                            if (branch.name === 'main') {
                                printHTML(`<span style="color: #a6e3a1;">* ${branch.name}</span>`);
                            } else {
                                print(`  ${branch.name}`);
                            }
                        });
                    })
                    .catch(err => {
                        print('Failed to fetch branches from GitHub', 'error');
                    });
                break;

            case 'contributors':
                print('Fetching contributors...', 'info');
                fetch('https://api.github.com/repos/lebaaar/webshell/contributors')
                    .then(res => res.json())
                    .then(contributors => {
                        print('');
                        contributors.forEach(contributor => {
                            const commits = contributor.contributions === 1 ? '1 commit' : `${contributor.contributions} commits`;
                            printHTML(`<span style="color: #f5c2e7;">${contributor.login}</span> - ${commits}`);
                        });
                    })
                    .catch(err => {
                        print('Failed to fetch contributors from GitHub', 'error');
                    });
                break;

            default:
                print(`git: '${subcommand}' is not a git command. See 'git --help'.`, 'error');
        }
    }
};

const unsupportedCommands = ['neofetch', 'fastfetch', 'ping', 'checksum', 'chmod', 'chown'];
unsupportedCommands.forEach(cmd => {
    commands[cmd] = function() {
        print(`${cmd} is not supported in webshell :(.`, 'error');
    };
});

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

function createNode(path, type) {
    const parts = path.split('/').filter(p => p);
    const nameToCreate = parts.pop();
    let node = fileSystem['/'];

    for (const part of parts) {
        if (!node.children[part]) {
            node.children[part] = { type: 'dir', children: {} };
        }
        node = node.children[part];
    }

    if (node.children[nameToCreate]) {
        return false;
    }

    if (type === 'dir') {
        node.children[nameToCreate] = { type: 'dir', children: {} };
    } else {
        node.children[nameToCreate] = { type: 'file', content: '' };
    }
    return true;
}

function deleteNode(path) {
    const parts = path.split('/').filter(p => p);
    const nameToDelete = parts.pop();
    let node = fileSystem['/'];

    for (const part of parts) {
        if (!node.children || !node.children[part]) {
            return false;
        }
        node = node.children[part];
    }

    if (node.children && node.children[nameToDelete]) {
        delete node.children[nameToDelete];
        return true;
    }
    return false;
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
        handleTabCompletion();
    } else if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt') {
        // Reset tab completion on any other key
        lastTabInput = '';
        tabPressCount = 0;
    }
});

// Welcome message
print('Welcome! We want DragonHack tickets :)', 'success');
print('Type "help" to see available commands.', 'info');
print('');

updatePrompt();
commandInput.focus();

