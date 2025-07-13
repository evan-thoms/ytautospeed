console.log('Content script loaded');

function waitForVideo(callback) {
  const video = document.querySelector('video.video-stream.html5-main-video');
  if (video) {
    callback(video);
  } else {
    setTimeout(() => waitForVideo(callback), 200);
  }
}

let isChangingSlider = false;

waitForVideo((video) => {
    chrome.storage.sync.get(['speed'], (results) => {
        const speed = results.speed ?? 1.75;
        video.playbackRate = speed; 
      });
    
  const parent = video.parentElement;
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  const container = document.createElement('div');
  container.id = 'yt-speed-control';

  // ✅ ✅ ✅ ADD THIS HERE — detect overlays
  const infoButton = document.querySelector('.ytp-cards-button-icon');
  const moreActionsButton = document.querySelector('.ytp-more-options-button');
  if (infoButton || moreActionsButton) {
    container.style.top = '40px'; // move it down if overlaps
    container.style.right = '12px';
  }

  container.innerHTML = `
    <div id="yt-unified-square">
      <div id="yt-toggle-container">
        <div id="yt-toggle-arrow">▶</div>
      </div>
      <div id="yt-control-panel">
        <div id="yt-speed-title">Speed</div>
        <input type="range" id="yt-speed-slider" min="0.25" max="5" step="0.05" value="1.75">
        <div id="yt-slider-value">1.75</div>
        <div id="yt-auto-label">AutoSpeed:</div>
        <input type="number" id="yt-speed-input" min="0.25" max="5" step="0.05">
      </div>
    </div>
  `;

  parent.appendChild(container);

  

  const style = document.createElement('style');
  style.textContent = `
    #yt-speed-control {
      position: absolute;
      top: 40px;
      right: 15px;
      z-index: 9999;
    }
    
    #yt-unified-square {
      background: rgba(0,0,0,0.7);
      border-radius: 4px;
      width: 32px;
      height: 32px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: top right;
    }
    
    #yt-unified-square:hover {
      background: rgba(0,0,0,0.9);
    }
    
    #yt-unified-square.expanded {
      width: 160px;
      height: 160px;
      background: rgba(0,0,0,0.8);
    }
    
    /* Dynamic positioning classes */
    #yt-unified-square.expand-left {
      transform-origin: top left;
    }
    
    #yt-unified-square.expand-up {
      transform-origin: bottom right;
    }
    
    #yt-unified-square.expand-up-left {
      transform-origin: bottom left;
    }
    
    #yt-toggle-container {
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    #yt-toggle-container.expanded {
      width: 160px;
      height: 32px;
      background: rgba(255,255,255,0.1);
      border-radius: 0;
    }
    
    #yt-toggle-arrow {
      color: white;
      font-size: 12px;
      font-weight: bold;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
    }
    
    #yt-toggle-arrow.rotated {
      transform: rotate(90deg);
    }
    
    #yt-control-panel {
      padding: 16px 12px 20px 12px;
      width: 160px;
      text-align: center;
      transform: scale(0);
      transform-origin: top right;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 10px;
      box-sizing: border-box;
    }
    
    #yt-control-panel.visible {
      transform: scale(1);
      opacity: 1;
    }
    
    /* Dynamic panel positioning */
    #yt-control-panel.expand-left {
      transform-origin: top left;
    }
    
    #yt-control-panel.expand-up {
      transform-origin: bottom right;
    }
    
    #yt-control-panel.expand-up-left {
      transform-origin: bottom left;
    }
    
    #yt-speed-title {
        margin-top: -5px;
      color: white;
      font-size: 11px;
      font-weight: 500;
    }
    
    #yt-speed-slider {
      width: 80%;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255,255,255,0.3);
      border-radius: 2px;
      outline: none;
    }
    
    #yt-speed-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
    }
    
    #yt-speed-slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }
    
    #yt-slider-value {
        margin-top: -3px;
      color: white;
      font-size: 11px;
      font-weight: 500;
    }
    
    #yt-auto-label {
      color: rgba(255,255,255,0.8);
      font-size: 9px;
      margin-top: 0px;
      margin-bottom: -5px;
    }
    #yt-speed-input::-webkit-outer-spin-button,
#yt-speed-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
    
    #yt-speed-input {
    -moz-appearance: textfield;
      width: 60px;
      padding: 4px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      color: white;
      text-align: center;
      font-size: 10px;
      outline: none;
      margin-bottom: 4px;
    }
    
    #yt-speed-input:focus {
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.15);
    }
  `;
  document.head.appendChild(style);

  const unifiedSquare = document.getElementById('yt-unified-square');
  const toggleContainer = document.getElementById('yt-toggle-container');
  const arrow = document.getElementById('yt-toggle-arrow');
  const panel = document.getElementById('yt-control-panel');
  const speedSlider = document.getElementById('yt-speed-slider');
  const sliderValue = document.getElementById('yt-slider-value');
  const speedInput = document.getElementById('yt-speed-input');

  let isOpen = false;

  // Function to determine optimal expansion direction
  function getExpansionDirection() {
    const containerRect = container.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    
    const expandedWidth = 160;
    const expandedHeight = 160;
    
    // Check space to the right and down (default)
    const spaceRight = parentRect.right - containerRect.left;
    const spaceDown = parentRect.bottom - containerRect.top;
    
    // Check space to the left and up
    const spaceLeft = containerRect.right - parentRect.left;
    const spaceUp = containerRect.bottom - parentRect.top;
    
    let direction = '';
    
    // Determine horizontal direction
    if (spaceRight >= expandedWidth) {
      direction = 'right';
    } else if (spaceLeft >= expandedWidth) {
      direction = 'left';
    } else {
      // Not enough space either way, prefer right
      direction = 'right';
    }
    
    // Determine vertical direction
    if (spaceDown >= expandedHeight) {
      direction += '-down';
    } else if (spaceUp >= expandedHeight) {
      direction += '-up';
    } else {
      // Not enough space either way, prefer down
      direction += '-down';
    }
    
    return direction;
  }

  // Function to apply positioning classes
  function applyPositioning(direction) {
    // Clear all positioning classes
    unifiedSquare.classList.remove('expand-left', 'expand-up', 'expand-up-left');
    panel.classList.remove('expand-left', 'expand-up', 'expand-up-left');
    
    // Apply appropriate classes based on direction
    switch(direction) {
      case 'left-down':
        unifiedSquare.classList.add('expand-left');
        panel.classList.add('expand-left');
        break;
      case 'right-up':
        unifiedSquare.classList.add('expand-up');
        panel.classList.add('expand-up');
        break;
      case 'left-up':
        unifiedSquare.classList.add('expand-up-left');
        panel.classList.add('expand-up-left');
        break;
      // 'right-down' is the default, no additional classes needed
    }
  }

  ['mousedown', 'click', 'focus', 'keydown', 'dblclick'].forEach(eventType => {
    speedInput.addEventListener(eventType, e => e.stopPropagation());
  });

  panel.addEventListener('click', (e) => e.stopPropagation());
  container.addEventListener('click', (e) => e.stopPropagation());

  toggleContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    
    if (isOpen) {
      // Determine optimal expansion direction
      const direction = getExpansionDirection();
      applyPositioning(direction);
      
      // Opening animation - everything happens simultaneously
      unifiedSquare.classList.add('expanded');
      toggleContainer.classList.add('expanded');
      arrow.classList.add('rotated');
      panel.classList.add('visible');
    } else {
      // Closing animation
      panel.classList.remove('visible');
      unifiedSquare.classList.remove('expanded');
      toggleContainer.classList.remove('expanded');
      arrow.classList.remove('rotated');
    }
  });

  speedSlider.addEventListener('input', () => {
    isChangingSlider = true;
    const speed = parseFloat(speedSlider.value);
    video.playbackRate = speed;
    sliderValue.textContent = speed.toFixed(2);
    setTimeout(() => { isChangingSlider = false; }, 100);
  });

  speedInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      let speed = parseFloat(speedInput.value);
      if (isNaN(speed) || speed < 0.25) speed = 0.25;
      if (speed > 5) speed = 5;
      speedInput.value = speed.toFixed(2);
      chrome.storage.sync.set({ speed }); 
      speedInput.blur();
    }
  });

  chrome.storage.sync.get(['speed'], (results) => {
    const saved = results.speed ?? 1.75;
    speedInput.value = saved.toFixed(2);
    video.playbackRate = saved;
    speedSlider.value = saved.toFixed(2);
    sliderValue.textContent = saved.toFixed(2);
  });

  video.addEventListener('ratechange', () => {
    if (isChangingSlider) return;
    const newRate = video.playbackRate;
    speedSlider.value = newRate.toFixed(2);
    sliderValue.textContent = newRate.toFixed(2);
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      container.style.position = 'fixed';  // ✅ Pin to viewport
      container.style.top = '60px';
      container.style.bottom = 'auto';
      container.style.right = '15px';
    } else {
      container.style.position = 'absolute';  // ✅ Back inside parent
      container.style.top = '40px'; 
      container.style.bottom = 'auto';
      container.style.right = '12px';
    }
  });

  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log("URL changed — reapply speed");
      chrome.storage.sync.get(['speed'], (results) => {
        const speed = results.speed ?? 1.75;
        video.playbackRate = speed;
        speedInput.value = speed.toFixed(2);
        speedSlider.value = speed.toFixed(2);
        sliderValue.textContent = speed.toFixed(2);
      });
    }
  });
  observer.observe(document, { subtree: true, childList: true });
});