chrome.runtime.onInstalled.addListener(() => {
    // initialize chrome storage
    chrome.storage.sync.get(["disabledCourses", "liveSessions", "collapsedPortlets", "autoLogin"], (items) => {
        let ini_conf = {};
        if (!items.disabledCourses) ini_conf.disabledCourses = JSON.stringify([]);
        if (!items.liveSessions) ini_conf.liveSessions = JSON.stringify([]);
        if (!items.collapsedPortlets) ini_conf.collapsedPortlets = JSON.stringify([]);
        if (!items.autoLogin) ini_conf.autoLogin = JSON.stringify({ enabled: false, username: '', password: '' });
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
