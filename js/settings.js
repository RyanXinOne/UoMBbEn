window.onload = () => {
    // register events for buttons
    let btns;
    // settings page buttons
    btns = document.querySelectorAll("#conf-bar button");
    btns[0].onclick = show_conf_export_page;
    btns[1].onclick = show_conf_import_page;
    btns[2].onclick = show_conf_reset_page;

    // conf export page buttons
    btns = document.querySelectorAll("#conf-export-page button");
    btns[0].onclick = copy_exported_conf;
    btns[1].onclick = () => { back_to_settings_page('conf-export-page') };

    // conf import page buttons
    btns = document.querySelectorAll("#conf-import-page button");
    btns[0].onclick = import_user_conf;
    btns[1].onclick = () => { back_to_settings_page('conf-import-page') };

    // conf reset page buttons
    btns = document.querySelectorAll("#conf-reset-page button");
    btns[0].onclick = reset_user_conf;
    btns[1].onclick = () => { back_to_settings_page('conf-reset-page') };
};

// display conf exporting page
function show_conf_export_page() {
    let copy_btn = document.querySelector("#conf-export-page button");
    let conf_output = document.querySelector("#conf-export-page textarea");
    // switch page
    document.getElementById('settings-page').style.display = 'none';
    conf_output.value = "";
    copy_btn.innerText = "Copy";
    copy_btn.disabled = true;
    document.getElementById('conf-export-page').style.display = 'block';
    // get configuration
    chrome.storage.sync.get(["disabledCourses", "liveSessions", "collapsedPortlets"], (items) => {
        for (let key in items) {
            items[key] = JSON.parse(items[key]);
        }
        conf_output.value = JSON.stringify(items);
        copy_btn.disabled = false;
    });
}

// copy configurations
function copy_exported_conf() {
    let copy_btn = document.querySelector("#conf-export-page button");
    let conf_output = document.querySelector("#conf-export-page textarea");
    conf_output.select();
    if (!document.execCommand("copy")) {
        console.log("Failed to copy texts.");
    } else {
        copy_btn.innerText = "Copied";
        copy_btn.disabled = true;
    }
    window.getSelection().removeAllRanges();
}

// display conf importing page
function show_conf_import_page() {
    let import_btn = document.querySelector("#conf-import-page button");
    let conf_input = document.querySelector("#conf-import-page textarea");
    // switch page
    document.getElementById('settings-page').style.display = 'none';
    conf_input.value = "";
    conf_input.disabled = false;
    import_btn.innerText = "Import";
    import_btn.disabled = false;
    document.getElementById('conf-import-page').style.display = 'block';
    conf_input.focus();
}

// read conf input and update chrome storage
function import_user_conf() {
    let import_btn = document.querySelector("#conf-import-page button");
    let conf_input = document.querySelector("#conf-import-page textarea");
    // get user input and import configuration
    let items;
    let error = null;
    try {
        items = JSON.parse(conf_input.value);
    } catch (e) {
        error = e;
    } finally {
        if (!(error === null && Object.prototype.toString.call(items) === Object.prototype.toString.call({}))) {
            console.log("Invalid configuration. " + (error !== null ? error : ""));
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

    chrome.storage.sync.set(user_conf, () => {
        import_btn.innerText = "Imported";
        import_btn.disabled = true;
        conf_input.disabled = true;
    });
}

// display conf reset page
function show_conf_reset_page() {
    // switch page
    document.getElementById('settings-page').style.display = 'none';
    let reset_btn = document.querySelector("#conf-reset-page button");
    let cancel_btn = document.querySelector("#conf-reset-page button:last-child");
    reset_btn.innerText = "Yes";
    reset_btn.disabled = false;
    cancel_btn.innerText = "Cancel";
    document.getElementById('conf-reset-page').style.display = 'block';
}

// reset user conf into initial state
function reset_user_conf() {
    let reset_btn = document.querySelector("#conf-reset-page button");
    let cancel_btn = document.querySelector("#conf-reset-page button:last-child");
    let ini_conf = {
        disabledCourses: JSON.stringify([]),
        liveSessions: JSON.stringify([]),
        collapsedPortlets: JSON.stringify([])
    };
    chrome.storage.sync.set(ini_conf, () => {
        reset_btn.innerText = "Reset";
        reset_btn.disabled = true;
        cancel_btn.innerText = "Back";
    });
}

// display settings page
function back_to_settings_page(pageId) {
    // switch page
    document.getElementById(pageId).style.display = 'none';
    document.getElementById('settings-page').style.display = 'block';
}
