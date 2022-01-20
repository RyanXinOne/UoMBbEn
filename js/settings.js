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
        show(pageId = null) {
            // disable animation
            let switch_btns = document.querySelectorAll('.switch > span');
            for (let i = 0; i < switch_btns.length; i++) {
                switch_btns[i].classList.remove('animated');
            }

            chrome.storage.sync.get(['autoLogin'], (items) => {
                // render the state of auto login switch button
                let account_info = JSON.parse(items.autoLogin);
                SwitchController.setState(document.getElementById('auto-login-switch'), account_info.enabled);

                // enable animation
                document.querySelector('body').clientTop;   // force browser to render DOM
                for (let i = 0; i < switch_btns.length; i++) {
                    switch_btns[i].classList.add('animated');
                }

                if (pageId !== null) {
                    // switch page
                    document.getElementById(pageId).style.display = 'none';
                    document.getElementById('settings-page').style.display = 'block';
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
            document.getElementById('auto-login-switch').onclick = PageManager.settingsPage.toggleAutoLogin;
            document.getElementById('player-settings-btn').onclick = PageManager.playerSettingsPage.show;
        },
        backFrom(pageId) {
            PageManager.settingsPage.show(pageId);
        },
        toggleAutoLogin() {
            let state = SwitchController.toggle(document.getElementById('auto-login-switch'));
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
            // get configuration
            chrome.storage.sync.get(['disabledCourses', 'liveSessions', 'collapsedPortlets', 'autoLogin', 'playerSettings'], (items) => {
                for (let key in items) {
                    items[key] = JSON.parse(items[key]);
                }
                let copy_btn = document.querySelector('#conf-export-page button');
                let conf_output = document.querySelector('#conf-export-page textarea');
                conf_output.value = JSON.stringify(items, null, 2);
                copy_btn.innerText = 'Copy';
                copy_btn.disabled = false;
                // switch page
                document.getElementById('settings-page').style.display = 'none';
                document.getElementById('conf-export-page').style.display = 'block';
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
            conf_input.value = '';
            import_btn.innerText = 'Import';
            conf_input.disabled = import_btn.disabled = false;
            // switch page
            document.getElementById('settings-page').style.display = 'none';
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
            if (Object.prototype.toString.call(items.playerSettings) === Object.prototype.toString.call({})) {
                if (typeof items.playerSettings.fontFamily !== 'string')
                    items.playerSettings.fontFamily = 'sans-serif';
                if (typeof items.playerSettings.fontSize !== 'string')
                    items.playerSettings.fontSize = '75';
                if (typeof items.playerSettings.fontColor !== 'string')
                    items.playerSettings.fontColor = '#ffffff';
                if (typeof items.playerSettings.bgColor !== 'string')
                    items.playerSettings.bgColor = '#000000';
                if (typeof items.playerSettings.textOpacity !== 'string')
                    items.playerSettings.textOpacity = '100';
                if (typeof items.playerSettings.bgOpacity !== 'string')
                    items.playerSettings.bgOpacity = '80';
                user_conf.playerSettings = JSON.stringify(items.playerSettings);
            }

            chrome.storage.sync.set(user_conf, () => {
                import_btn.innerText = 'Imported';
                import_btn.disabled = conf_input.disabled = true;
            });
        }
    },
    confResetPage: {
        show() {
            let reset_btn = document.querySelector('#conf-reset-page button');
            let cancel_btn = document.querySelector('#conf-reset-page button:last-child');
            reset_btn.innerText = 'Yes';
            cancel_btn.innerText = 'Cancel';
            reset_btn.disabled = false;
            // switch page
            document.getElementById('settings-page').style.display = 'none';
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
                autoLogin: JSON.stringify({ enabled: false, username: '', password: '' }),
                playerSettings: JSON.stringify({ fontFamily: 'sans-serif', fontSize: '75', fontColor: '#ffffff', bgColor: '#000000', textOpacity: '100', bgOpacity: '80' })
            };
            chrome.storage.sync.set(ini_conf, () => {
                reset_btn.innerText = 'Reset';
                cancel_btn.innerText = 'Back';
                reset_btn.disabled = true;
            });
        }
    },
    accountInfoPage: {
        show() {
            // get account info
            chrome.storage.sync.get(['autoLogin'], (items) => {
                let account_info = JSON.parse(items.autoLogin);
                let un_input = document.querySelector('#account-info-page input[type="text"]');
                let pwd_input = document.querySelector('#account-info-page input[type="password"]');
                let clear_btn = document.querySelector('#account-info-page button');
                let save_btn = document.querySelector('#account-info-page button:nth-child(2)');
                un_input.value = account_info.username;
                pwd_input.value = account_info.password;
                save_btn.innerText = 'Save';
                un_input.disabled = pwd_input.disabled = clear_btn.disabled = save_btn.disabled = false;
                // switch page
                document.getElementById('settings-page').style.display = 'none';
                document.getElementById('account-info-page').style.display = 'block';
            });
        },
        registerClickEvents() {
            btns = document.querySelectorAll('#account-info-page button');
            btns[0].onclick = PageManager.accountInfoPage.clearLoginInfo;
            btns[1].onclick = PageManager.accountInfoPage.saveLoginInfo;
            btns[2].onclick = () => { PageManager.settingsPage.backFrom('account-info-page') };
        },
        clearLoginInfo() {  // clear login information
            let un_input = document.querySelector('#account-info-page input[type="text"]');
            let pwd_input = document.querySelector('#account-info-page input[type="password"]');
            un_input.value = '';
            pwd_input.value = '';
        },
        saveLoginInfo() {  // save login information
            let un_input = document.querySelector('#account-info-page input[type="text"]');
            let pwd_input = document.querySelector('#account-info-page input[type="password"]');
            let clear_btn = document.querySelector('#account-info-page button');
            let save_btn = document.querySelector('#account-info-page button:nth-child(2)');
            if (un_input.value === '' || pwd_input.value === '') return;
            // update storage
            chrome.storage.sync.get(['autoLogin'], (items) => {
                let account_info = JSON.parse(items.autoLogin);
                account_info.username = un_input.value;
                account_info.password = pwd_input.value;
                chrome.storage.sync.set({ autoLogin: JSON.stringify(account_info) }, () => {
                    save_btn.innerText = 'Saved';
                    un_input.disabled = pwd_input.disabled = clear_btn.disabled = save_btn.disabled = true;
                });
            });
        }
    },
    playerSettingsPage: {
        show() {
            // get player settings
            chrome.storage.sync.get(['playerSettings'], (items) => {
                let player_settings = JSON.parse(items.playerSettings);
                let inputs = document.querySelectorAll('#player-settings-page input');
                let btns = document.querySelectorAll('#player-settings-page .btns-bar button');
                let msg = document.querySelector('#player-settings-page div:last-child');
                let font_family_in = inputs[0];
                let font_size_in = inputs[1];
                let text_color_in = inputs[2];
                let text_opacity_in = inputs[3];
                let bg_color_in = inputs[4];
                let bg_opacity_in = inputs[5];
                font_family_in.value = player_settings.fontFamily;
                font_size_in.value = player_settings.fontSize;
                text_color_in.value = player_settings.fontColor;
                text_opacity_in.value = player_settings.textOpacity;
                bg_color_in.value = player_settings.bgColor;
                bg_opacity_in.value = player_settings.bgOpacity;
                btns[1].innerText = 'Save';
                for (let i in inputs) {
                    inputs[i].disabled = false;
                }
                btns[0].disabled = btns[1].disabled = false;
                msg.style.display = 'none';
                // switch page
                document.getElementById('settings-page').style.display = 'none';
                document.getElementById('player-settings-page').style.display = 'block';
            });
        },
        registerClickEvents() {
            let btns = document.querySelectorAll('#player-settings-page .btns-bar button');
            btns[0].onclick = PageManager.playerSettingsPage.setToDefault;
            btns[1].onclick = PageManager.playerSettingsPage.saveSettings;
            btns[2].onclick = () => { PageManager.settingsPage.backFrom('player-settings-page') };
        },
        setToDefault() {
            let defaults = { fontFamily: 'sans-serif', fontSize: '75', fontColor: '#ffffff', bgColor: '#000000', textOpacity: '100', bgOpacity: '80' };
            let inputs = document.querySelectorAll('#player-settings-page input');
            let font_family_in = inputs[0];
            let font_size_in = inputs[1];
            let text_color_in = inputs[2];
            let text_opacity_in = inputs[3];
            let bg_color_in = inputs[4];
            let bg_opacity_in = inputs[5];
            font_family_in.value = defaults.fontFamily;
            font_size_in.value = defaults.fontSize;
            text_color_in.value = defaults.fontColor;
            text_opacity_in.value = defaults.textOpacity;
            bg_color_in.value = defaults.bgColor;
            bg_opacity_in.value = defaults.bgOpacity;
        },
        saveSettings() {
            let inputs = document.querySelectorAll('#player-settings-page input');
            let btns = document.querySelectorAll('#player-settings-page .btns-bar button');
            let msg = document.querySelector('#player-settings-page div:last-child');
            let font_family_in = inputs[0];
            let font_size_in = inputs[1];
            let text_color_in = inputs[2];
            let text_opacity_in = inputs[3];
            let bg_color_in = inputs[4];
            let bg_opacity_in = inputs[5];
            for (let i in inputs) {
                if (inputs[i].value === '') return;
            }
            // update storage
            let player_settings = { fontFamily: font_family_in.value, fontSize: font_size_in.value, fontColor: text_color_in.value, bgColor: bg_color_in.value, textOpacity: text_opacity_in.value, bgOpacity: bg_opacity_in.value };
            chrome.storage.sync.set({ playerSettings: JSON.stringify(player_settings) }, () => {
                btns[1].innerText = 'Saved';
                for (let i in inputs) {
                    inputs[i].disabled = true;
                }
                btns[0].disabled = btns[1].disabled = true;
                msg.style.display = 'block';
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
