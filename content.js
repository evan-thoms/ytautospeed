console.log('Content script loaded');
const container = document.createElement('div');
container.id = 'speed-control'

container.innerHTML = `
  <div id="yt-toggle-arrow">▶</div>
  <div id="yt-control-panel" style="display: none;">
    <label><input type="checkbox" id="yt-enable-toggle"> Auto-Speed</label>
    <input type="range" id="yt-speed-slider" min="0.25" max="5" step="0.05" value="1.75">
    <div id="yt-speed-enter">⏷</div>
    <input type="number" id="yt-speed-input" min="0.25" max="5" step="0.05" style="display: none;">
  </div>
`;

const style = document.createElement('style');
style.textContent = `
  #yt-speed-control {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 9999;
    opacity: 0.4;
    transition: opacity 0.3s;
  }
  #yt-speed-control:hover {
    opacity: 1;
  }
  #yt-toggle-arrow {
    cursor: pointer;
    background: rgba(0,0,0,0.5);
    padding: 5px;
    border-radius: 3px;
    color: white;
  }
  #yt-control-panel {
    background: rgba(0,0,0,0.5);
    padding: 10px;
    margin-top: 5px;
    border-radius: 3px;
  }
  #yt-control-panel input,
  #yt-control-panel label {
    display: block;
    margin: 5px 0;
    color: white;
  }
  #yt-speed-enter {
    cursor: pointer;
    margin-top: 5px;
    text-align: center;
    color: white;
  }
`;
document.head.appendChild(style);


document.body.appendChild(container);

function waitForVideo(speed){
    const video = document.querySelector('video');

    if(video) {
        console.log("Setting video speed to ", speed);
        video.playbackRate = speed;
    } else {
        console.log("Haven't found video yet")
        setTimeout(() => waitForVideo(speed), 200);
    }
}


function applySpeed(){
    console.log('Applying speed, current URL:', window.location.href);

    if (window.location.pathname.startsWith('/shorts')){
        console.log("This is a shorts page");
    } else{ 
        chrome.storage.sync.get(['enabled', 'speed'],  (results) => {
            const isEnabled = results.enabled ?? false;
            const speed = results.speed ?? 1.75;
        
        if(isEnabled){
            console.log('Speed control enabled, waiting for video...');
            waitForVideo(speed);
        } else {
            console.log('Speed control disabled');
        }
        }); 
    }    
}

applySpeed();

let lastUrl = location.href;
const observer = new MutationObserver(() => {
    if(location.href !== lastUrl) {
        lastUrl = location.href;
        console.log("Url changed");

        applySpeed();
    }
})
observer.observe(document, { subtree: true, childList: true });