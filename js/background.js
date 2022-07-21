chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // initialize chrome storage
        chrome.storage.sync.get(['disabledCourses', 'liveSessions', 'collapsedPortlets', 'autoLogin', 'playerSettings'], (items) => {
            let ini_conf = {};
            if (!items.disabledCourses) ini_conf.disabledCourses = JSON.stringify([]);
            if (!items.liveSessions) ini_conf.liveSessions = JSON.stringify([]);
            if (!items.collapsedPortlets) ini_conf.collapsedPortlets = JSON.stringify([]);
            if (!items.autoLogin) ini_conf.autoLogin = JSON.stringify({ enabled: false, username: '', password: '' });
            if (!items.playerSettings) ini_conf.playerSettings = JSON.stringify({ fontFamily: 'sans-serif', fontSize: '75', fontColor: '#ffffff', bgColor: '#000000', textOpacity: '100', bgOpacity: '80' });
            chrome.storage.sync.set(ini_conf);
        });
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        // update from v0.1.8 to v0.1.9
        chrome.storage.sync.get(['playerSettings'], (items) => {
            let value = JSON.parse(items.playerSettings);
            if (value.opacity !== undefined) {
                delete value.opacity;
                value.textOpacity = '100';
                value.bgOpacity = '80';
                chrome.storage.sync.set({ playerSettings: JSON.stringify(value) });
            }
        });
    }

    // enable popup window only when manchester pages are active
    chrome.action.disable();
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
            actions: [new chrome.declarativeContent.ShowAction()]
        }]);
    });
});
