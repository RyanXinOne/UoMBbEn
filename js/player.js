
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
    // transform time xx:xx into seconds
    time = time.match(/(\d+):(\d+)/)
    let min = parseInt(time[1]);
    let sec = parseInt(time[2]);
    return 60 * min + sec;
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
                        // ↑: boost speed
                        EmbeddedVideoController.speedRate(true);
                        break;
                    case "ArrowDown":
                        // ↓: reduce speed
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

    jumpTo(progress) {
        // jump to the specific progress(0-1)
        let scrollBar = document.querySelector(".vjs-progress-control > div");
        let absX = getCoordinateX(scrollBar) + progress * scrollBar.clientWidth;
        scrollBar.dispatchEvent(MouseEventCreator.down(absX));
        scrollBar.dispatchEvent(MouseEventCreator.up());
    },

    forward(time = 10) {
        // forward the specific amount of time
        let scrollBar = document.querySelector(".vjs-progress-control > div");
        let currProgress = parseFloat(scrollBar.getAttribute("aria-valuenow")) / 100;
        if (!isNaN(currProgress)) {
            let tarProgress = Math.min(currProgress + time / EmbeddedVideoController.duration, 1);
            EmbeddedVideoController.jumpTo(tarProgress);
        }
    },

    backward(time = 10) {
        // backward the specific amount of time
        let scrollBar = document.querySelector(".vjs-progress-control > div");
        let currProgress = parseFloat(scrollBar.getAttribute("aria-valuenow")) / 100;
        if (!isNaN(currProgress)) {
            let tarProgress = Math.max(currProgress - time / EmbeddedVideoController.duration, 0);
            EmbeddedVideoController.jumpTo(tarProgress);
        }
    },
    
    speedRate(action) {
        // control playback rate. action value: true(accelerate), false(slow down)
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
        // decide current caption state
        if (captionBtn.querySelector("ul.vjs-menu-content > li:nth-child(2)").classList.contains("vjs-selected")) {
            captionBtn.querySelector("ul.vjs-menu-content > li:nth-child(3)").dispatchEvent(MouseEventCreator.click());
        } else {
            captionBtn.querySelector("ul.vjs-menu-content > li:nth-child(2)").dispatchEvent(MouseEventCreator.click());
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
