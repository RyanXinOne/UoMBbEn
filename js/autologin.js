// validate login page
if (document.querySelector('header > h1') && document.querySelector('header > h1').innerText === 'Login Service') {
    // get account info
    chrome.storage.sync.get(['autoLogin'], (items) => {
        let account_info = JSON.parse(items.autoLogin);
        // auto log-in (enabled and no errors on page)
        if (account_info.enabled && document.querySelector('#msg.errors') === null) {
            if (account_info.username) {
                document.getElementById('username').value = account_info.username;
            }
            if (account_info.password) {
                document.getElementById('password').value = account_info.password;
            }
            let login_btn = document.querySelector('input.btn-submit[value="Login"]');
            login_btn.click();
            // play logging in animation
            let count = 0;
            setInterval(() => {
                login_btn.value = 'Logging In' + ((new Array(count + 1)).join('.'));
                count = (count + 1) % 4;
            }, 350);
        }
    });
}
