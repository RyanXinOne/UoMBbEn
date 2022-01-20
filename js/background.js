chrome.runtime.onInstalled.addListener(() => {
    // initialize chrome storage
    chrome.storage.sync.get(['disabledCourses', 'liveSessions', 'collapsedPortlets', 'autoLogin', 'playerSettings'], (items) => {
        let ini_conf = {};
        if (!items.disabledCourses) ini_conf.disabledCourses = JSON.stringify([]);
        if (!items.liveSessions) ini_conf.liveSessions = JSON.stringify([]);
        if (!items.collapsedPortlets) ini_conf.collapsedPortlets = JSON.stringify([]);
        if (!items.autoLogin) ini_conf.autoLogin = JSON.stringify({ enabled: false, username: '', password: '' });
        if (!items.playerSettings) ini_conf.playerSettings = JSON.stringify({ fontFamily: 'sans-serif', fontSize: '75', fontColor: '#ffffff', bgColor: '#000000', textOpacity: '100', bgOpacity: '80' });
        // update from v0.1.8 to v0.1.9
        else {
            let oldPlayerSettings = JSON.parse(items.playerSettings);
            if (oldPlayerSettings.opacity !== undefined) {
                delete oldPlayerSettings.opacity;
                oldPlayerSettings.textOpacity = '100';
                oldPlayerSettings.bgOpacity = '80';
                ini_conf.playerSettings = JSON.stringify(oldPlayerSettings);
            }
        }
        chrome.storage.sync.set(ini_conf);
    });

    // enable popup window if appropriate
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'online.manchester.ac.uk', schemes: ['https'] },
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'video.manchester.ac.uk', schemes: ['https'] },
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'login.manchester.ac.uk', schemes: ['https'] },
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
