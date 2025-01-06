const DEFAULT_UFOS = '1';
const DEFAULT_TIME = '60';

function savePreferences() {
    const numberOfUFOs = document.getElementById('numberOfUFOs').value;
    const timeLimit = document.getElementById('timeLimit').value;

    localStorage.setItem('numberOfUFOs', numberOfUFOs);
    localStorage.setItem('timeLimit', timeLimit);

    alert('Preferences saved successfully!');
}

function loadPreferences() {
    const savedUFOs = localStorage.getItem('numberOfUFOs') || DEFAULT_UFOS;
    const savedTime = localStorage.getItem('timeLimit') || DEFAULT_TIME;

    document.getElementById('numberOfUFOs').value = savedUFOs;
    document.getElementById('timeLimit').value = savedTime;
}

function resetPreferences() {
    localStorage.setItem('numberOfUFOs', DEFAULT_UFOS);
    localStorage.setItem('timeLimit', DEFAULT_TIME);
    loadPreferences();
    alert('Preferences have been reset to defaults.');
}

window.onload = loadPreferences;
