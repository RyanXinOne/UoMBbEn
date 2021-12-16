let HyperLinkProcessor = {
    init() {
        // traverse all the anchors
        let anchors = document.querySelectorAll('a');
        for (let i = 0; i < anchors.length; i++) {
            HyperLinkProcessor.removeContentWrapper(anchors[i]);
            HyperLinkProcessor.openFileContentInNewTab(anchors[i]);
            HyperLinkProcessor.hashJump(anchors[i]);
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

HyperLinkProcessor.init();
redirectEmbedPdf();
