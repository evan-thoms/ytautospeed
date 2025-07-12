console.log('Content script loaded');

const enableToggle = document.getElementById('enableToggle');
const speedInput = document.getElementById('speedInput');

chrome.storage.sync.get(['enabled', 'speed'],  (results) => {

    enableToggle.checked = results.enabled ?? false;
    speedInput.value = results.speed ?? 1.00;
    console.log(results.enabled);
    console.log(results.speed);
})

enableToggle.addEventListener('change', () => {
    
    const isEnabled = enableToggle.checked;
    console.log(isEnabled);
    chrome.storage.sync.set({ enabled: isEnabled });
  });

speedInput.addEventListener('input', () => {
    const newSpeed = parseFloat(speedInput.value)
    console.log(newSpeed);
    chrome.storage.sync.set({speed: newSpeed})
});

