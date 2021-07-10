window.onload = () => {
    // register events for buttons
    let btns;
    // settings page buttons
    btns = document.querySelectorAll("#conf-bar > button");
    btns[0].onclick = show_conf_export_page;
    btns[1].onclick = show_conf_import_page;
    btns[2].onclick = show_conf_reset_page;

    // conf export page buttons
    btns = document.querySelectorAll("#conf-export-page > button");
    btns[0].onclick = copy_exported_conf;

    // conf import page buttons
    btns = document.querySelectorAll("#conf-import-page > button");
    btns[0].onclick = import_user_conf;
};

// display conf exporting page
function show_conf_export_page() {
    let copy_btn = document.querySelector("#conf-export-page > button");
    let conf_output = document.querySelector("#conf-export-page > input");
    // switch page
    document.getElementById('setting-page').style.display = 'none';
    copy_btn.innerHTML = "Copy";
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
    let copy_btn = document.querySelector("#conf-export-page > button");
    let conf_output = document.querySelector("#conf-export-page > input");
    conf_output.select();
    if (!document.execCommand("copy")) {
        console.log("Failed to copy texts.");
    } else {
        copy_btn.innerHTML = "Copied";
        copy_btn.disabled = true;
    }
    window.getSelection().removeAllRanges();
}

// display conf importing page
function show_conf_import_page() {
    let import_btn = document.querySelector("#conf-import-page > button");
    let conf_input = document.querySelector("#conf-import-page > input");
    // switch page
    document.getElementById('setting-page').style.display = 'none';
    conf_input.disabled = false;
    import_btn.innerHTML = "Import";
    import_btn.disabled = false;
    document.getElementById('conf-import-page').style.display = 'block';
}

// read conf input and update chrome storage
function import_user_conf() {
    let import_btn = document.querySelector("#conf-import-page > button");
    let conf_input = document.querySelector("#conf-import-page > input");
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
        import_btn.innerHTML = "Imported";
        import_btn.disabled = true;
        conf_input.disabled = true;
    });
}

// display conf reset page
function show_conf_reset_page() {
    // switch page
    document.getElementById('setting-page').style.display = 'none';
    document.getElementById('conf-reset-page').style.display = 'block';
}
