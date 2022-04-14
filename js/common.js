let HyperLinkProcessor = {
    init() {
        // traverse all the anchors
        let anchors = document.querySelectorAll('a');
        for (let i = 0; i < anchors.length; i++) {
            HyperLinkProcessor.removeLaunchLinkWrapper(anchors[i]);
            HyperLinkProcessor.removeContentWrapper(anchors[i]);
            HyperLinkProcessor.openFileContentInNewTab(anchors[i]);
            HyperLinkProcessor.hashJump(anchors[i]);
        }
    },

    removeLaunchLinkWrapper(anchor) {
        // open embedded web page (e.g. piazza) directly in new tab
        let attr = anchor.getAttribute('href');
        if (attr && attr.startsWith('/webapps/blackboard/content/contentWrapper.jsp') && attr.indexOf('launchLink.jsp') > -1) {
            let urlParser = new URL(attr, window.location.origin);
            anchor.setAttribute('href', urlParser.searchParams.get('href'));
            anchor.setAttribute('target', '_blank');
        }
    },

    removeContentWrapper(anchor) {
        // open external links in new tab directly
        let attr = anchor.getAttribute('onclick');
        if (attr && attr.startsWith('this.href=\'/webapps/blackboard/content/contentWrapper.jsp')) {
            // remove contentWrapper and open in new tab
            let href = anchor.getAttribute('href');
            anchor.setAttribute('onclick', 'this.href=\'' + href + '\';');
            anchor.setAttribute('target', '_blank');
        }
    },

    openFileContentInNewTab(anchor) {
        // make file links open in the new tab
        let attr = anchor.getAttribute('onclick');
        if (attr && attr.startsWith('this.href=\'/webapps/blackboard/execute/content/file')) {
            anchor.setAttribute('target', '_blank');
        }
    },

    hashJump(anchor) {
        // jump to in-page hash anchor directly
        let pureHref = window.location.href.substr(0, window.location.href.length - window.location.hash.length);
        let aHref = anchor.getAttribute('href');
        if (aHref && aHref.startsWith(pureHref)) {
            anchor.setAttribute('href', aHref.substring(pureHref.length));
        }
    }
};

function redirectEmbedPdf() {
    // automatically open embed pdf directly in current tab
    let embedPdf = document.querySelector('#PDFEmbedID');
    if (embedPdf) {
        let url = window.location.origin + embedPdf.getAttribute('src');
        window.location.replace(url);
    }
}


// auto skip sign-on error page
if (document.querySelector('#error_message_title') && document.querySelector('#error_message_title').innerText === 'Sign On Error!') {
    document.querySelector('#error_message_button > a').click();
}
// auto click if login button is available
if (document.getElementById('topframe.login.label')) {
    document.getElementById('topframe.login.label').click();
}

function renderRapidNavBar() {
    var table = document.getElementsByClassName('appTabs transparent')[0];
        var destination_table_tab = table.getElementsByTagName("tr")[0].childNodes[1];
        var tab_to_be_inserted_1 = document.createElement("td");
        tab_to_be_inserted_1.id = "MailBox"
        var tab_to_be_inserted_2 = document.createElement("td");
        tab_to_be_inserted_2.id = "Checkin"
        var tab_to_be_inserted_3 = document.createElement("td");
        tab_to_be_inserted_3.id = "SPOT"

        tab_to_be_inserted_1.innerHTML = `
			<td id="MailBox">
			<a href="https://outlook.office.com/mail/inbox" target="_top" aria-current="false">
			<span>MailBox</span>
			</a>
			</td>`;

        tab_to_be_inserted_2.innerHTML = `
			<td id="Checkin">
			<a href="https://my.manchester.ac.uk/MyCheckIn" target="_top" aria-current="false">
			<span>Check In</span>
			</a>
			</td>`;

        tab_to_be_inserted_3.innerHTML = `
			<td id="SPOT v2">
			<a href="https://studentnet.cs.manchester.ac.uk/me/spotv2/spotv2.php" target="_top" aria-current="false">
			<span>SPOT</span>
			</a>
			</td>`;

        //insert these tabs
        insertAfter(tab_to_be_inserted_1, destination_table_tab)
        insertAfter(tab_to_be_inserted_2, destination_table_tab)
        insertAfter(tab_to_be_inserted_3, destination_table_tab)
}

HyperLinkProcessor.init();
redirectEmbedPdf();
renderRapidNavBar();