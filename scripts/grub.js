let selectedIndex = 0;
let countdown = 5;
let countdownInterval = null;

const menuItems = document.querySelectorAll('.menu-item');
const countdownElement = document.getElementById('countdown');

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    menuItems.forEach((item, index) => {
        if (item.getAttribute('data-theme') === savedTheme) {
            selectedIndex = index;
        }
    });
}

function updateSelection() {
    menuItems.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function boot() {
    const selectedItem = menuItems[selectedIndex];
    const theme = selectedItem.getAttribute('data-theme');
    
    localStorage.setItem('theme', theme);
    
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    window.location.href = '/shell.html';
}

function startCountdown() {
    countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            boot();
        }
    }, 1000);
}

document.addEventListener('keydown', (e) => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdown = 5;
        countdownElement.textContent = countdown;
        startCountdown();
    }
    
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex = Math.max(0, selectedIndex - 1);
            updateSelection();
            break;
            
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex = Math.min(menuItems.length - 1, selectedIndex + 1);
            updateSelection();
            break;
            
        case 'Enter':
            e.preventDefault();
            boot();
            break;
            
        case 'e':
        case 'E':
            // Easter egg: e je edit u dejanskmu GRUBU
            e.preventDefault();
            break;
    }
});

menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        selectedIndex = index;
        updateSelection();
        boot();
    });
    
    item.addEventListener('mouseenter', () => {
        selectedIndex = index;
        updateSelection();
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdown = 5;
            countdownElement.textContent = countdown;
            startCountdown();
        }
    });
});

updateSelection();
startCountdown();
