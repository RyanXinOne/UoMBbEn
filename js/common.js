function removeContentWrapper() {
    // open external links in new tab directly
    let anchors = document.querySelectorAll("a");
    for (let i = 0; i < anchors.length; i++) {
        let attr = anchors[i].getAttribute("onclick");
        if (attr && attr.startsWith("this.href='/webapps/blackboard/content/contentWrapper.jsp")) {
            // remove contentWrapper and open in new tab
            let href = anchors[i].getAttribute("href");
            anchors[i].setAttribute("onclick", "this.href='" + href + "';");
            anchors[i].setAttribute("target", "_blank");
        }
    }
}

removeContentWrapper();
