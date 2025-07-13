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
        video.playbackRate = speed;  // Apply saved speed to video only
      });
  const parent = video.parentElement;
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  const container = document.createElement('div');
  container.id = 'yt-speed-control';

  container.innerHTML = `
    <div id="yt-toggle-arrow">▶</div>
    <div id="yt-control-panel" style="display: none;">
      <div id="yt-speed-title">Speed</div>
      <input type="range" id="yt-speed-slider" min="0.25" max="5" step="0.05" value="1.75">
      <div id="yt-slider-value">1.75</div>
      <div id="yt-auto-label">Current AutoSpeed:</div>
      <input type="number" id="yt-speed-input" min="0.25" max="5" step="0.05">
    </div>
  `;

  parent.appendChild(container);

  const style = document.createElement('style');
  style.textContent = `
    #yt-speed-control {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 9999;
    }
    #yt-toggle-arrow {
      cursor: pointer;
      background: rgba(0,0,0,0.5);
      color: white;
      padding: 5px 7px;
      border-radius: 3px;
      font-weight: bold;
      font-size: 14px;
      transition: background 0.3s;
    }
    #yt-toggle-arrow:hover {
      background: rgba(0,0,0,0.8);
    }
    #yt-control-panel {
      margin-top: 5px;
      background: rgba(0,0,0,0.5);
      border-radius: 5px;
      padding: 8px;
      width: 150px;
      text-align: center;
    }
    #yt-speed-title {
      color: white;
      font-size: 12px;
      margin-bottom: 5px;
    }
    #yt-speed-slider {
      width: 100%;
    }
    #yt-slider-value {
      color: white;
      font-size: 12px;
      margin-top: 5px;
    }
    #yt-auto-label {
      color: white;
      font-size: 10px;
      margin-top: 8px;
    }
    #yt-speed-input {
      width: 60px;
      margin-top: 5px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      text-align: center;
    }
  `;
  document.head.appendChild(style);

  const arrow = document.getElementById('yt-toggle-arrow');
  const panel = document.getElementById('yt-control-panel');
  const speedSlider = document.getElementById('yt-speed-slider');
  const sliderValue = document.getElementById('yt-slider-value');
  const speedInput = document.getElementById('yt-speed-input');

  ['mousedown', 'click', 'focus', 'keydown', 'dblclick'].forEach(eventType => {
    speedInput.addEventListener(eventType, e => e.stopPropagation());
  });

  panel.addEventListener('click', (e) => e.stopPropagation());
  container.addEventListener('click', (e) => e.stopPropagation());

  arrow.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.style.display === 'block';
    panel.style.display = isOpen ? 'none' : 'block';
    arrow.textContent = isOpen ? '▶' : '▼';
  });

  speedSlider.addEventListener('input', () => {
    isChangingSlider = true;
    const speed = parseFloat(speedSlider.value);
    video.playbackRate = speed;
    sliderValue.textContent = speed.toFixed(2);
    // do NOT store this slider value in sync storage!
    setTimeout(() => { isChangingSlider = false; }, 100);
  });

//   speedInput.addEventListener('keydown', (e) => {
//     e.stopPropagation();
//     if (e.key === 'Enter') {
//       let speed = parseFloat(speedInput.value);
//       if (isNaN(speed) || speed < 0.25) speed = 0.25;
//       if (speed > 5) speed = 5;
//       speedInput.value = speed.toFixed(2);
//       chrome.storage.sync.set({ speed });
//       video.playbackRate = speed; // apply auto speed immediately too
//       speedSlider.value = speed.toFixed(2);
//       sliderValue.textContent = speed.toFixed(2);
//       speedInput.blur();
//     }
//   });
speedInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      let speed = parseFloat(speedInput.value);
      if (isNaN(speed) || speed < 0.25) speed = 0.25;
      if (speed > 5) speed = 5;
      speedInput.value = speed.toFixed(2);
      chrome.storage.sync.set({ speed });  // Save speed, no UI/video update here
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
