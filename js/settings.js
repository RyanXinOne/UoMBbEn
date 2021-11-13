window.onload = () => {
    // render states of elements in settings page
    PageManager.settingsPage.show();
    // register events for buttons
    for (let page in PageManager) {
        PageManager[page].registerClickEvents();
    }
};

let PageManager = {
    settingsPage: {
        show() {
            // disable animation
            let switch_btns = document.querySelectorAll('.switch > span');
            for (let i = 0; i < switch_btns.length; i++) {
                switch_btns[i].classList.remove('animated');
            }
        
            chrome.storage.sync.get(['autoLogin'], (items) => {
                // render the state of auto login switch button
                let account_info = JSON.parse(items.autoLogin);
                SwitchController.setState(document.getElementById('auto-login-btn'), account_info.enabled);
        
                // enable animation
                document.querySelector('body').clientTop;   // force browser to render DOM
                for (let i = 0; i < switch_btns.length; i++) {
                    switch_btns[i].classList.add('animated');
                }
            });
        },
        registerClickEvents() {
            // settings page buttons
            let btns = document.querySelectorAll('#conf-bar button');
            btns[0].onclick = PageManager.confExportPage.show;
            btns[1].onclick = PageManager.confImportPage.show;
            btns[2].onclick = PageManager.confResetPage.show;
            document.getElementById('account-info-btn').onclick = PageManager.accountInfoPage.show;
            let switch_btn = document.getElementById('auto-login-btn');
            switch_btn.onclick = PageManager.settingsPage.toggleAutoLogin;
        },
        backFrom(pageId) {
            // switch page
            document.getElementById(pageId).style.display = 'none';
            PageManager.settingsPage.show();
            document.getElementById('settings-page').style.display = 'block';
        },
        toggleAutoLogin() {
            let state = SwitchController.toggle(document.getElementById('auto-login-btn'));
            // update state
            chrome.storage.sync.get(['autoLogin'], (items) => {
                let account_info = JSON.parse(items.autoLogin);
                account_info.enabled = state;
                chrome.storage.sync.set({ autoLogin: JSON.stringify(account_info) });
            });
        }
    },
    confExportPage: {
        show() {
            let copy_btn = document.querySelector('#conf-export-page button');
            let conf_output = document.querySelector('#conf-export-page textarea');
            // switch page
            document.getElementById('settings-page').style.display = 'none';
            conf_output.value = '';
            copy_btn.innerText = 'Copy';
            copy_btn.disabled = true;
            document.getElementById('conf-export-page').style.display = 'block';
            // get configuration
            chrome.storage.sync.get(['disabledCourses', 'liveSessions', 'collapsedPortlets', 'autoLogin'], (items) => {
                for (let key in items) {
                    items[key] = JSON.parse(items[key]);
                }
                conf_output.value = JSON.stringify(items, null, 2);
                copy_btn.disabled = false;
            });
        },
        registerClickEvents() {
            let btns = document.querySelectorAll('#conf-export-page button');
            btns[0].onclick = PageManager.confExportPage.copyConf;
            btns[1].onclick = () => { PageManager.settingsPage.backFrom('conf-export-page') };
        },
        copyConf() {  // copy configurations
            let copy_btn = document.querySelector('#conf-export-page button');
            let conf_output = document.querySelector('#conf-export-page textarea');
            conf_output.select();
            if (!document.execCommand('copy')) {
                console.log('Failed to copy texts.');
            } else {
                copy_btn.innerText = 'Copied';
                copy_btn.disabled = true;
            }
            window.getSelection().removeAllRanges();
        }
    },
    confImportPage: {
        show() {
            let import_btn = document.querySelector('#conf-import-page button');
            let conf_input = document.querySelector('#conf-import-page textarea');
            // switch page
            document.getElementById('settings-page').style.display = 'none';
            conf_input.value = '';
            conf_input.disabled = false;
            import_btn.innerText = 'Import';
            import_btn.disabled = false;
            document.getElementById('conf-import-page').style.display = 'block';
            conf_input.focus();
        },
        registerClickEvents() {
            let btns = document.querySelectorAll('#conf-import-page button');
            btns[0].onclick = PageManager.confImportPage.importConf;
            btns[1].onclick = () => { PageManager.settingsPage.backFrom('conf-import-page') };
        },
        importConf() {  // read conf input and update chrome storage
            let import_btn = document.querySelector('#conf-import-page button');
            let conf_input = document.querySelector('#conf-import-page textarea');
            // get user input and import configuration
            let items;
            let error = null;
            try {
                items = JSON.parse(conf_input.value);
            } catch (e) {
                error = e;
            } finally {
                if (!(error === null && Object.prototype.toString.call(items) === Object.prototype.toString.call({}))) {
                    console.log('Invalid configuration. ' + (error !== null ? error : ''));
                    return;
                }
            }
            // only update valid configurations
            let user_conf = {};
            if (Array.isArray(items.disabledCourses))
                user_conf.disabledCourses = JSON.stringify(items.disabledCourses);
            if (Array.isArray(items.liveSessions))
                user_conf.liveSessions = JSON.stringify(items.liveSessions);
            if (Array.isArray(items.collapsedPortlets))
                user_conf.collapsedPortlets = JSON.stringify(items.collapsedPortlets);
            if (Object.prototype.toString.call(items.autoLogin) === Object.prototype.toString.call({})) {
                if (typeof items.autoLogin.enabled !== 'boolean')
                    items.autoLogin.enabled = false;
                if (typeof items.autoLogin.username !== 'string')
                    items.autoLogin.username = '';
                if (typeof items.autoLogin.password !== 'string')
                    items.autoLogin.password = '';
                user_conf.autoLogin = JSON.stringify(items.autoLogin);
            }
        
            chrome.storage.sync.set(user_conf, () => {
                import_btn.innerText = 'Imported';
                import_btn.disabled = true;
                conf_input.disabled = true;
            });
        }
    },
    confResetPage: {
        show() {
            // switch page
            document.getElementById('settings-page').style.display = 'none';
            let reset_btn = document.querySelector('#conf-reset-page button');
            let cancel_btn = document.querySelector('#conf-reset-page button:last-child');
            reset_btn.innerText = 'Yes';
            reset_btn.disabled = false;
            cancel_btn.innerText = 'Cancel';
            document.getElementById('conf-reset-page').style.display = 'block';
        },
        registerClickEvents() {
            let btns = document.querySelectorAll('#conf-reset-page button');
            btns[0].onclick = PageManager.confResetPage.resetConf;
            btns[1].onclick = () => { PageManager.settingsPage.backFrom('conf-reset-page') };
        },
        resetConf() {  // reset user conf into initial state
            let reset_btn = document.querySelector('#conf-reset-page button');
            let cancel_btn = document.querySelector('#conf-reset-page button:last-child');
            let ini_conf = {
                disabledCourses: JSON.stringify([]),
                liveSessions: JSON.stringify([]),
                collapsedPortlets: JSON.stringify([]),
                autoLogin: JSON.stringify({ enabled: false, username: '', password: '' })
            };
            chrome.storage.sync.set(ini_conf, () => {
                reset_btn.innerText = 'Reset';
                reset_btn.disabled = true;
                cancel_btn.innerText = 'Back';
            });
        }
    },
    accountInfoPage: {
        show() {
            // switch page
            document.getElementById('settings-page').style.display = 'none';
            let un_input = document.querySelector('#account-info-page input');
            let pwd_input = document.querySelector('#account-info-page input[type=password]');
            let clear_btn = document.querySelector('#account-info-page button');
            let save_btn = document.querySelector('#account-info-page button:nth-child(2)');
            un_input.value = '';
            pwd_input.value = '';
            un_input.disabled = true;
            pwd_input.disabled = true;
            clear_btn.disabled = true;
            save_btn.innerText = 'Save';
            save_btn.disabled = true;
            document.getElementById('account-info-page').style.display = 'block';
            // get account info
            chrome.storage.sync.get(['autoLogin'], (items) => {
                let account_info = JSON.parse(items.autoLogin);
                un_input.value = account_info.username;
                pwd_input.value = account_info.password;
                un_input.disabled = false;
                pwd_input.disabled = false;
                clear_btn.disabled = false;
                save_btn.disabled = false;
            });
        },
        registerClickEvents() {
            btns = document.querySelectorAll('#account-info-page button');
            btns[0].onclick = PageManager.accountInfoPage.clearLoginInfo;
            btns[1].onclick = PageManager.accountInfoPage.saveLoginInfo;
            btns[2].onclick = () => { PageManager.settingsPage.backFrom('account-info-page') };
        },
        clearLoginInfo() {  // clear login information
            let un_input = document.querySelector('#account-info-page input');
            let pwd_input = document.querySelector('#account-info-page input[type=password]');
            un_input.value = '';
            pwd_input.value = '';
        },
        saveLoginInfo() {  // save login information
            let un_input = document.querySelector('#account-info-page input');
            let pwd_input = document.querySelector('#account-info-page input[type=password]');
            let clear_btn = document.querySelector('#account-info-page button');
            let save_btn = document.querySelector('#account-info-page button:nth-child(2)');
            // update storage
            chrome.storage.sync.get(['autoLogin'], (items) => {
                let account_info = JSON.parse(items.autoLogin);
                account_info.username = un_input.value;
                account_info.password = pwd_input.value;
                chrome.storage.sync.set({ autoLogin: JSON.stringify(account_info) }, () => {
                    un_input.disabled = true;
                    pwd_input.disabled = true;
                    clear_btn.disabled = true;
                    save_btn.innerText = 'Saved';
                    save_btn.disabled = true;
                });
            });
        }
    }
};

let SwitchController = {
    getState(bswitch) {  // get the state of the switch button, return on/off state
        return bswitch.classList.contains('on');
    },
    setState(bswitch, state) {  // set the state of the switch button
        if (state) {
            if (!SwitchController.getState(bswitch)) {
                bswitch.classList.add('on');
            }
        } else {
            if (SwitchController.getState(bswitch)) {
                bswitch.classList.remove('on');
            }
        }
    },
    toggle(bswitch) {  // toggle the display of the switch button, return on/off state
        if (SwitchController.getState(bswitch)) {
            bswitch.classList.remove('on');
            return false;
        } else {
            bswitch.classList.add('on');
            return true;
        }
    }
};
