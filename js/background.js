// enable popup window if appropriate
chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'online.manchester.ac.uk', schemes: ['https'] },
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'video.manchester.ac.uk', schemes: ['https'] },
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
