
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
        return new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    },

    down(x = 0) {
        return new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, clientX: x });
    },

    up() {
        return new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
    }
};

let EmbeddedVideoController = {
    duration: 0,

    init() {
        // initialize controller
        // get video duration
        EmbeddedVideoController.duration = readableTimeToSeconds(document.querySelector('.vjs-remaining-time-display').innerText);

        if (EmbeddedVideoController.duration === 0) {
            setTimeout(EmbeddedVideoController.init, 50);
        } else {
            EmbeddedVideoController.bindKeys();
            EmbeddedVideoController.overrideCaptionStyle();
            EmbeddedVideoController.renderReloadButtonOnError();
            let jumpto = parseFloat(new URL(window.location.href).searchParams.get('jumpto'));
            if (!isNaN(jumpto) && jumpto > 0) {
                jumpto = Math.min(jumpto, 1);
                EmbeddedVideoController.execInitialJump(jumpto);
            }
        }
    },

    bindKeys() {
        // bind keys to control the player
        document.onkeydown = (event) => {
            switch (event.key) {
                case ' ':
                    // Space: pause or play the video
                    EmbeddedVideoController.togglePlay();
                    break;
                case 'ArrowRight':
                    // →: forward
                    EmbeddedVideoController.forward();
                    break;
                case 'ArrowLeft':
                    // ←: backward
                    EmbeddedVideoController.backward();
                    break;
                case 'ArrowUp':
                    // ↑: increase playback speed
                    EmbeddedVideoController.speedRate(true);
                    break;
                case 'ArrowDown':
                    // ↓: decrease playback speed
                    EmbeddedVideoController.speedRate(false);
                    break;
                case 'Enter':
                    // Enter: fullscreen control
                    EmbeddedVideoController.toggleFullScreen();
                    break;
                case 'c':
                case 'C':
                    // c: cation control
                    EmbeddedVideoController.toggleCaption();
                    break;
                default:
                    return true;
            }
            return false;
        };
    },

    overrideCaptionStyle() {
        // get player settings
        chrome.storage.sync.get(['playerSettings'], (items) => {
            let player_settings = JSON.parse(items.playerSettings);
            let newStyle = document.createElement('style');
            newStyle.setAttribute('type', 'text/css');
            let captionCSS = 'div.vjs-text-track-display>div>div>div{';
            captionCSS += 'font-family:' + player_settings.fontFamily + ' !important;';
            captionCSS += 'font-size:' + ((parseInt(player_settings.fontSize) / 100) * 2.5) + 'vw !important;';
            captionCSS += 'color:' + player_settings.fontColor + ' !important;';
            captionCSS += 'background-color:' + player_settings.bgColor + ' !important;';
            captionCSS += 'opacity:' + (parseInt(player_settings.opacity) / 100) + ' !important;';
            captionCSS += '}';
            newStyle.innerHTML = captionCSS;
            document.head.appendChild(newStyle);

            // show message on original settings panel
            let oriPanel = document.querySelector('.vjs-tracksettings');
            if (!oriPanel) return;
            let msg = document.createElement('div');
            msg.style.position = 'absolute';
            msg.style.bottom = '0.5em';
            msg.style.left = '1em';
            msg.style.width = '70%';
            msg.style.fontStyle = 'italic';
            msg.innerText = '* Notice: Some of caption settings are overrided by UoMBbEn. Please check extension settings (pop-up) for details.';
            oriPanel.appendChild(msg);
        });
    },

    renderReloadButtonOnError() {
        // render button
        let error_display = document.querySelector('.vjs-error-display');
        let reload_btn = document.createElement('div');
        reload_btn.id = 'error-reload-btn';
        reload_btn.innerHTML = '<span>Reload Video</span>';
        error_display.appendChild(reload_btn);
        // register click handler
        let reload_text = reload_btn.querySelector('span');
        reload_text.onclick = () => {
            let currProgress = EmbeddedVideoController.getProgress();
            if (isNaN(currProgress))
                currProgress = '';
            let url = new URL(window.location.href);
            url.searchParams.set('jumpto', currProgress);
            location.replace(url);
        };
    },

    execInitialJump(jumpto) {
        // jump to a specific time as soon as progress controller is ready
        if (document.querySelector('.vjs-progress-control > div').clientWidth === 0) {
            setTimeout(() => EmbeddedVideoController.execInitialJump(jumpto), 100);
        } else {
            EmbeddedVideoController.jumpTo(jumpto, true);
        }
    },

    togglePlay() {
        // play or pause video
        document.querySelector('.vjs-control-bar > button').dispatchEvent(MouseEventCreator.click());
    },

    toggleFullScreen() {
        // enter or exit full screen mode
        document.querySelector('.vjs-control-bar > button:last-child').dispatchEvent(MouseEventCreator.click());
    },

    jumpTo(progress, flag) {
        // jump to the specific progress(0-1), flag indicates forward (true) or backward (false)
        let playProgress = document.querySelector('.vjs-play-progress');
        let absProX = getCoordinateX(playProgress) + playProgress.clientWidth;

        let progressControl = document.querySelector('.vjs-progress-control > div');
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

    getProgress() {
        // get current progress (0-1) of video
        let progressControl = document.querySelector('.vjs-progress-control > div');
        let currProgress = parseFloat(progressControl.getAttribute('aria-valuenow')) / 100;
        return currProgress;
    },

    forward(time = 10) {
        // forward the specific amount of time
        let currProgress = EmbeddedVideoController.getProgress();
        // check ready state of progress controller
        if (!isNaN(currProgress)) {
            let tarProgress = Math.min(currProgress + time / EmbeddedVideoController.duration, 1);
            EmbeddedVideoController.jumpTo(tarProgress, true);
        }
    },

    backward(time = 10) {
        // backward the specific amount of time
        let currProgress = EmbeddedVideoController.getProgress();
        // check ready state of progress controller
        if (!isNaN(currProgress)) {
            let tarProgress = Math.max(currProgress - time / EmbeddedVideoController.duration, 0);
            EmbeddedVideoController.jumpTo(tarProgress, false);
        }
    },

    speedRate(action) {
        // control playback speed rate. action value: true(increase), false(decrease)
        let speedOptions = ['2x', '1.5x', '1.25x', '1x', '0.75x'];
        let playbackRateMenu = document.querySelector('.vjs-playback-rate');
        let currSpeed = playbackRateMenu.querySelector('.vjs-playback-rate-value').innerText;
        let speedLevel = speedOptions.indexOf(currSpeed);
        if (action) {
            if (speedLevel > 0) {
                playbackRateMenu.querySelectorAll('ul.vjs-menu-content > li')[speedLevel - 1].dispatchEvent(MouseEventCreator.click());
            }
        } else {
            if (speedLevel < speedOptions.length - 1) {
                playbackRateMenu.querySelectorAll('ul.vjs-menu-content > li')[speedLevel + 1].dispatchEvent(MouseEventCreator.click());
            }
        }
    },

    toggleCaption() {
        // display or hide the caption
        let captionBtn = document.querySelector('.vjs-captions-button');
        if (captionBtn.classList.contains('vjs-hidden')) return;
        // locate two caption buttons
        let captionItems = captionBtn.querySelectorAll('li.vjs-menu-item');
        let captionOff, captionEnglish;
        for (let i = 0; i < captionItems.length; i++) {
            let text = captionItems[i].innerText.toLowerCase();
            if (text.slice(0, 12) === 'captions off') {
                captionOff = captionItems[i];
            } else if (text.slice(0, 7) === 'english') {
                captionEnglish = captionItems[i];
            }
        }
        if (!captionOff || !captionEnglish) return;
        // decide current caption state
        if (captionOff.classList.contains('vjs-selected')) {
            // enable caption English
            captionEnglish.dispatchEvent(MouseEventCreator.click());
        } else {
            // enable caption Off
            captionOff.dispatchEvent(MouseEventCreator.click());
        }
    }
};

function replacePaellaWithEmbeddedVideo() {
    // substitute paella in Video Portal with Embedded Video
    let paellaContainer = document.querySelector('.paella-container');
    let embeddedHTML = document.querySelector('#iframeText').value;
    paellaContainer.innerHTML = embeddedHTML;
    paellaContainer.querySelector('iframe').removeAttribute('width');
    paellaContainer.querySelector('iframe').removeAttribute('height');
    paellaContainer.querySelector('iframe').className = 'paella';
}

if (window.location.pathname.startsWith('/embedded/')) {
    EmbeddedVideoController.init();
} else if (document.querySelector('.paella-container')) {
    replacePaellaWithEmbeddedVideo();
}
