window.onload = () => {
    // register events for buttons
    document.querySelector("#conf-bar > button:first-child").onclick = export_user_conf;
    document.querySelector("#conf-bar > button:last-child").onclick = import_user_conf;
};

function export_user_conf() {
    // display ui of exporting
    document.querySelector("#conf-bar").innerHTML = '<input readonly><button>Copy</button>';
    // get configuration
    chrome.storage.sync.get(["disabledCourses", "liveSessions", "collapsedPortlets"], (items) => {
        for (let key in items) {
            items[key] = JSON.parse(items[key]);
        }
        document.querySelector("#conf-bar > input").value = JSON.stringify(items);
        document.querySelector("#conf-bar > button").onclick = () => {
            document.querySelector("#conf-bar > input").select();
            if (!document.execCommand("copy")) {
                console.log("Failed to copy texts.");
            } else {
                document.querySelector("#conf-bar > button").innerHTML = "Copied";
                document.querySelector("#conf-bar > button").disabled = true;
            }
            window.getSelection().removeAllRanges();
        };
    });
}

function import_user_conf() {
    // display ui of importing
    document.querySelector("#conf-bar").innerHTML = '<input><button>Import</button>';
    document.querySelector("#conf-bar > button").onclick = () => {
        // get user input and import configuration
        let items = JSON.parse(document.querySelector("#conf-bar > input").value);
        chrome.storage.sync.set({
            "disabledCourses": items.disabledCourses ? JSON.stringify(items.disabledCourses) : JSON.stringify([]),
            "liveSessions": items.liveSessions ? JSON.stringify(items.liveSessions) : JSON.stringify([]),
            "collapsedPortlets": items.collapsedPortlets ? JSON.stringify(items.collapsedPortlets) : JSON.stringify([])
        }, () => {
            document.querySelector("#conf-bar > button").innerHTML = "Imported";
            document.querySelector("#conf-bar > button").disabled = true;
            document.querySelector("#conf-bar > input").disabled = true;
        });
    };
}
