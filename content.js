console.log('Popup script loaded');

function waitForVideo(speed){
    const video = document.querySelector('video');

    if(video) {
        console.log("Setting video speed");
        video.playbackRate = speed;
    } else {
        console.log("Haven't found video yet")
        setTimeout(() => waitForVideo(speed), 200);
    }
}


function applySpeed(){
    if (window.location.pathname.startsWith('/shorts')){
        console.log("This is a shorts page");
    } else{ 
        chrome.storage.sync.get(['enabled', 'speed'],  (results) => {
            const isEnabled = results.enabled ?? false;
            const speed = results.speed ?? 1.00;
        
        if(isEnabled){
            waitForVideo(speed);
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