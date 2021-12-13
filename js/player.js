
function getCoordinateX(ele) {
    // get the absolute coordinate X of an element
    let actualLeft = ele.offsetLeft;
    let current = ele.offsetParent;
    while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    return actualLeft;
}

function readableTimeToSeconds(time) {
    // transform time xx:xx:xx into seconds
    time = time.match(/\d+/g);
    let secs = 0;
    if (time !== null) {
        for (let i = 0; i < time.length; i++) {
            secs = 60 * secs + parseInt(time[i]);
        }
    }
    return secs;
}

let MouseEventCreator = {
    // create a mouse event
    click() {
        return new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
    },

    down(x = 0) {
        return new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window, clientX: x });
    },

    up() {
        return new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window });
    }
};

let EmbeddedVideoController = {
    duration: 0,

    init() {
        // initialize controller
        // get video duration
        EmbeddedVideoController.duration = readableTimeToSeconds(document.querySelector(".vjs-remaining-time-display").innerText);
        if (EmbeddedVideoController.duration === 0) {
            setTimeout(EmbeddedVideoController.init, 50);
        } else {
            // bind keys to control the player
            document.onkeydown = (event) => {
                switch (event.key) {
                    case " ":
                        // Space: pause or play the video
                        EmbeddedVideoController.togglePlay();
                        break;
                    case "ArrowRight":
                        // →: forward
                        EmbeddedVideoController.forward();
                        break;
                    case "ArrowLeft":
                        // ←: backward
                        EmbeddedVideoController.backward();
                        break;
                    case "ArrowUp":
                        // ↑: increase playback speed
                        EmbeddedVideoController.speedRate(true);
                        break;
                    case "ArrowDown":
                        // ↓: decrease playback speed
                        EmbeddedVideoController.speedRate(false);
                        break;
                    case "Enter":
                        // Enter: fullscreen control
                        EmbeddedVideoController.toggleFullScreen();
                        break;
                    case "c":
                    case "C":
                        // c: cation control
                        EmbeddedVideoController.toggleCaption();
                        break;
                    default:
                        return true;
                }
                return false;
            };
        }
    },

    togglePlay() {
        // play or pause video
        document.querySelector(".vjs-control-bar > button").dispatchEvent(MouseEventCreator.click());
    },

    toggleFullScreen() {
        // enter or exit full screen mode
        document.querySelector(".vjs-control-bar > button:last-child").dispatchEvent(MouseEventCreator.click());
    },

    jumpTo(progress, flag) {
        // jump to the specific progress(0-1), flag indicates forward (true) or backward (false)
        let playProgress = document.querySelector(".vjs-play-progress");
        let absProX = getCoordinateX(playProgress) + playProgress.clientWidth;

        let progressControl = document.querySelector(".vjs-progress-control > div");
        let absTarX = getCoordinateX(progressControl) + progress * progressControl.clientWidth;
        // set the minimum precision to be 1 pixel to ensure a jump
        if (flag) {
            absTarX = Math.max(absTarX, absProX + 1);
        } else {
            absTarX = Math.min(absTarX, absProX - 1);
        }

        progressControl.dispatchEvent(MouseEventCreator.down(absTarX));
        progressControl.dispatchEvent(MouseEventCreator.up());
    },

    forward(time = 10) {
        // forward the specific amount of time
        let progressControl = document.querySelector(".vjs-progress-control > div");
        let currProgress = parseFloat(progressControl.getAttribute("aria-valuenow")) / 100;
        if (!isNaN(currProgress)) {
            let tarProgress = Math.min(currProgress + time / EmbeddedVideoController.duration, 1);
            EmbeddedVideoController.jumpTo(tarProgress, true);
        }
    },

    backward(time = 10) {
        // backward the specific amount of time
        let progressControl = document.querySelector(".vjs-progress-control > div");
        let currProgress = parseFloat(progressControl.getAttribute("aria-valuenow")) / 100;
        if (!isNaN(currProgress)) {
            let tarProgress = Math.max(currProgress - time / EmbeddedVideoController.duration, 0);
            EmbeddedVideoController.jumpTo(tarProgress, false);
        }
    },
    
    speedRate(action) {
        // control playback speed rate. action value: true(increase), false(decrease)
        let speedOptions = ["2x", "1.5x", "1.25x", "1x", "0.75x"];
        let playbackRateMenu = document.querySelector(".vjs-playback-rate");
        let currSpeed = playbackRateMenu.querySelector(".vjs-playback-rate-value").innerText;
        let speedLevel = speedOptions.indexOf(currSpeed);
        if (action) {
            if (speedLevel > 0) {
                playbackRateMenu.querySelectorAll("ul.vjs-menu-content > li")[speedLevel - 1].dispatchEvent(MouseEventCreator.click());
            }
        } else {
            if (speedLevel < speedOptions.length - 1) {
                playbackRateMenu.querySelectorAll("ul.vjs-menu-content > li")[speedLevel + 1].dispatchEvent(MouseEventCreator.click());
            }
        }
    },

    toggleCaption() {
        // display or hide the caption
        let captionBtn = document.querySelector(".vjs-captions-button");
        if (!captionBtn) {
            return;
        }
        let captionItems = captionBtn.querySelectorAll("li.vjs-menu-item");
        // decide current caption state
        if (captionItems[captionItems.length - 2].classList.contains("vjs-selected")) {
            // enable caption English
            captionItems[captionItems.length - 1].dispatchEvent(MouseEventCreator.click());
        } else {
            // enable caption Off
            captionItems[captionItems.length - 2].dispatchEvent(MouseEventCreator.click());
        }
    }
};

function replacePaellaWithEmbeddedVideo() {
    // substitute paella in Video Portal with Embedded Video
    let paellaContainer = document.querySelector(".paella-container");
    let embeddedHTML = document.querySelector("#iframeText").value;
    paellaContainer.innerHTML = embeddedHTML;
    paellaContainer.querySelector("iframe").removeAttribute("width");
    paellaContainer.querySelector("iframe").removeAttribute("height");
    paellaContainer.querySelector("iframe").className = "paella";
}

if (window.location.pathname.startsWith("/embedded/")) {
    EmbeddedVideoController.init();
} else if (document.querySelector(".paella-container")) {
    replacePaellaWithEmbeddedVideo();
}
