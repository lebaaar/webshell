// Boot screen with [ OK ] messages

// Apply saved theme
let theme = localStorage.getItem('theme') || 'dark';
if (theme === 'light') {
    document.body.classList.add('light');
}

function ansiToHtml(text) {
  return text
    .replace(/\x1b\[0;32m/g, '<span style="color: #00aa00">')
    .replace(/\x1b\[0;1;39m/g, '<span style="font-weight: bold">')
    .replace(/\x1b\[0m/g, '</span>');
}

const terminal = document.getElementById('terminal');

fetch('resources/boot.log')
  .then(response => response.text())
  .then(text => {
    const lines = text.split(/\r?\n/);

    lines.forEach((line, i) => {
      setTimeout(() => {
        const elem = document.createElement('div');
        elem.innerHTML = ansiToHtml(line);
        terminal.appendChild(elem);

        terminal.scrollTop = terminal.scrollHeight;

      }, i * 15);
    });
  })
  .catch(console.error);

setTimeout(() => {
    window.location.href = "/shell.html";
}, 4000);
