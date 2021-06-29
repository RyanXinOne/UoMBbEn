// display popup windows if appropriate
chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostContains: '.manchester.ac.uk', schemes: ['https'] },
                })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
