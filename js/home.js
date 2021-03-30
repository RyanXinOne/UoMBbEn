
function commandHandler(command, data) {
    // handle internal commands (mainly for writing into chrome storage)
    switch (command) {
        case "showCourse":
            // remove a course name from "disabledCourses"
            chrome.storage.sync.get(["disabledCourses"], (items) => {
                let value = JSON.parse(items.disabledCourses);
                let index = value.indexOf(data);
                if (index > -1) {
                    value.splice(index, 1);
                    chrome.storage.sync.set({ "disabledCourses": JSON.stringify(value) });
                }
            });
            break;
        case "hideCourse":
            // add a course name into "disabledCourses"
            chrome.storage.sync.get(["disabledCourses"], (items) => {
                let value = JSON.parse(items.disabledCourses);
                if (value.indexOf(data) === -1) {
                    value.push(data);
                    chrome.storage.sync.set({ "disabledCourses": JSON.stringify(value) });
                }
            });
            break;
        case "addLive":
            // add an entry of Live Sessions port
            chrome.storage.sync.get(["liveSessions"], (items) => {
                let value = JSON.parse(items.liveSessions);
                value.push(data);
                chrome.storage.sync.set({ "liveSessions": JSON.stringify(value) });
            });
            break;
        case "editLive":
            // edit an entry of Live Sessions port
            chrome.storage.sync.get(["liveSessions"], (items) => {
                let value = JSON.parse(items.liveSessions);
                let index = data[0];
                data = data[1];
                value[index] = data;
                chrome.storage.sync.set({ "liveSessions": JSON.stringify(value) });
            });
            break;
        case "deleteLive":
            // delate an entry of Live Sessions port
            chrome.storage.sync.get(["liveSessions"], (items) => {
                let value = JSON.parse(items.liveSessions);
                value.splice(data, 1);
                chrome.storage.sync.set({ "liveSessions": JSON.stringify(value) });
            });
            break;
        case "renderLiveEditBox":
            // render contents of the edit box
            chrome.storage.sync.get(["liveSessions"], (items) => {
                let index = data;
                let editBox = document.querySelector("#livePort > ul > li:nth-child(" + (index + 1) + ") > .liveEditBox");
                let valuei = JSON.parse(items.liveSessions)[index];
                let inputBoxes = editBox.querySelectorAll("input");
                inputBoxes[0].value = valuei.group;
                inputBoxes[1].value = valuei.title;
                inputBoxes[2].value = valuei.link;
                inputBoxes[3].value = valuei.passcode;
                editBox.style.display = "block";
            });
            break;
        case "collapsePortlet":
            // add a portlet title into "collapsedPortlets"
            chrome.storage.sync.get(["collapsedPortlets"], (items) => {
                let value = JSON.parse(items.collapsedPortlets);
                if (value.indexOf(data) === -1) {
                    value.push(data);
                    chrome.storage.sync.set({ "collapsedPortlets": JSON.stringify(value) });
                }
            });
            break;
        case "expandPortlet":
            // remove a portlet title from "collapsedPortlets"
            chrome.storage.sync.get(["collapsedPortlets"], (items) => {
                let value = JSON.parse(items.collapsedPortlets);
                let index = value.indexOf(data);
                if (index > -1) {
                    value.splice(index, 1);
                    chrome.storage.sync.set({ "collapsedPortlets": JSON.stringify(value) });
                }
            });
            break;
        default:
            break;
    }
}

function initialize() {
    // initialize chrome storage
    chrome.storage.sync.get(["disabledCourses", "liveSessions", "collapsedPortlets"], (items) => {
        if (!items.disabledCourses)
            chrome.storage.sync.set({ "disabledCourses": JSON.stringify([]) });
        if (!items.liveSessions)
            chrome.storage.sync.set({ "liveSessions": JSON.stringify([]) });
        if (!items.collapsedPortlets)
            chrome.storage.sync.set({ "collapsedPortlets": JSON.stringify([]) });
    });
    // inject cuntom js
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
	temp.src = chrome.extension.getURL('js/home-inject.js');  // get the link like：chrome-extension://xxxxxx/js/home-inject.js
    document.head.appendChild(temp);
    // register "message" event listener for communication
    window.addEventListener("message", (e) => {
        commandHandler(e.data.command, e.data.data);
    }, false);
}

function renderCoursesPort() {
    // render Courses Port
    let courseEle = document.querySelector("#CurrentCourses");
    if (!courseEle){
        setTimeout(renderCoursesPort, 10);
        return false;
    }
    // render display of current courses
    chrome.storage.sync.get(["disabledCourses"], (items) => {
        let disabled = JSON.parse(items.disabledCourses);
        let courses = courseEle.querySelectorAll("ul > li");
        for (let i = 0; i < courses.length; i++) {
            let courseTitle = courses[i].querySelector("a").innerText;
            if (disabled.indexOf(courseTitle) > -1) {
                courses[i].classList.add("hiddenCourse");
                courses[i].style.display = "none";
            }
        }
        // show edit button of Courses port
        document.querySelector("#column1 .edit_controls").innerHTML = '<a class="editModule" title="Manage Course Display" href="javascript:/*edit_module*/void(0);" onclick="CoursesPortEditor.editCourses()"><img alt="Manage Course Display" src="https://learn.content.blackboardcdn.com/3900.6.0-rel.24+5fa90d1/images/ci/ng/palette_settings.gif"></a>';
    });
}

function calculateTime() {
    // calculate UK time
    let formatNumber = (n) => { return n < 10 ? "0" + n.toString() : n.toString() };
    const weekDay = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
    const months = { 0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun", 6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec" };
    let targetDate = new Date(new Date().toLocaleString('en', { timeZone: 'Europe/London' }));
    let readableTime = formatNumber(targetDate.getHours()) + ":" + formatNumber(targetDate.getMinutes()) + ":" + formatNumber(targetDate.getSeconds()) + " " + weekDay[targetDate.getDay()] + ", " + targetDate.getDate() + " " + months[targetDate.getMonth()];
    return readableTime;
}

function renderTimePort() {
    // render UK time port
    let timePort = document.createElement("div");
    timePort.className = "portlet clearfix";
    timePort.innerHTML = '<div class="edit_controls"></div><h2 class="clearfix"><span class="moduleTitle">UK Time</span></h2><div class="collapsible" style="overflow: auto; aria-expanded="true" id="$fixedId"><div class="vtbegenerated"><p id="ukTime" style="text-align:center;font-family:\'Open Sans\',sans-serif;font-weight:bold;font-size:16px;color:rgb(0,0,0);overflow-wrap:break-word;margin:0;"></p></div></div>';
    document.querySelector("#column0").appendChild(timePort);
    let ukTime = document.querySelector("#ukTime");
    ukTime.innerText = calculateTime();
    setInterval(() => {
        ukTime.innerText = calculateTime();
    }, 1000);
}

function renderLivePort() {
    // render live session port
    let livePort = document.createElement("div");
    livePort.className = "portlet clearfix";
    livePort.innerHTML = '<div class="edit_controls"><a class="editModule" title="Edit Entries" href="javascript:/*edit_module*/void(0);" onclick="LiveSessionsPortEditor.editLivePort()"><img alt="Edit Entries" src="https://learn.content.blackboardcdn.com/3900.6.0-rel.24+5fa90d1/images/ci/ng/palette_settings.gif"></a></div><h2 class="clearfix"><span class="moduleTitle">Live Sessions</span></h2><div class="collapsible" style="overflow: auto; aria-expanded="true" id="$fixedId"><div id="livePort" style="display: block;"><ul class="listElement"></ul></div></div>';
    document.querySelector("#column0").appendChild(livePort);
    chrome.storage.sync.get(["liveSessions"], (items) => {
        let entries = JSON.parse(items.liveSessions);
        let livePortUl = document.querySelector("#livePort > ul");
        let iHTML = "";
        for (let i = 0; i < entries.length; i++) {
            iHTML += '<li>';
            iHTML += '<a href="' + entries[i].link + '" target="_blank">' + entries[i].group + ' - ' + entries[i].title + '</a>';
            // render copy button
            if (entries[i].passcode) {
                iHTML += '<span class="cpbtn" title="Copy Passcode" onclick="LiveSessionsPortEditor.copyPasscode(' + i + ')">' + entries[i].passcode + '</span>';
            }
            // create direct shortcut
            if (entries[i].link.indexOf('zoom.us') > -1) {
                let roomNo = entries[i].link.match(/\/j\/(\d+)/);
                if (roomNo && roomNo.length === 2) {
                    roomNo = roomNo[1];
                    let dlink = 'zoommtg://zoom.us/join?confno=' + roomNo + '&pwd=' + entries[i].passcode + '&zc=0';
                    iHTML += '<a class="shortcut" title="Direct Shortcut" href="' + dlink + '"><svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M661.781677 828.365032 579.267595 587.177594C570.726098 562.210926 545.191576 545.703058 519.010014 548.045861L264.736013 571.017253 824.242564 143.903963 661.781677 828.365032ZM857.835024 10.904978 105.706959 585.060706C100.900626 588.729734 96.709919 592.889576 93.165524 598.242621 85.75648 609.432393 82.488074 623.585122 88.340942 639.041243 94.255788 654.661022 106.30893 663.161161 119.467424 666.518991 125.760712 668.12494 131.712968 668.376539 137.782634 667.833405L526.615483 633.039592C513.72255 634.193286 502.732704 627.088445 498.528533 614.799714L624.895371 984.168107C626.877374 989.961509 629.561192 995.333973 633.632077 1000.446903 642.018284 1010.979596 654.589872 1018.437608 671.06296 1017.591467 687.489003 1016.74752 699.192811 1008.095817 706.473207 996.819017 710.004363 991.349516 712.144672 985.757745 713.558351 979.804038L932.157666 59.170658C943.011422 13.459944 895.042872-17.498563 857.835024 10.904978L857.835024 10.904978Z"></path></svg></a>';
                }
            }
            iHTML += '</li>';
        }
        livePortUl.innerHTML = iHTML;
    });
}

function renderCollapseOption() {
    // add a collapse button for all boxes to collapse contents
    let portlets = document.querySelectorAll(".portlet");
    chrome.storage.sync.get(["collapsedPortlets"], (items) => {
        let collapsedPortlets = JSON.parse(items.collapsedPortlets);
        for (let i = 0; i < portlets.length; i++) {
            let headerBar = portlets[i].querySelector("h2");
            let title = headerBar.querySelector(".moduleTitle").innerText;
            let mainbody = portlets[i].querySelector(".collapsible");
            // render collapse button
            let collapseBtn = document.createElement("button");
            collapseBtn.className = "collabtn";
            collapseBtn.setAttribute("onclick", "PortletEditor.toggleCollapse(" + i + ")");
            collapseBtn.style.display = "none";
            collapseBtn.innerHTML = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M997.604 677.888l-431.56-431.56c-0.91-1.023-1.934-2.047-2.844-3.071-28.444-28.445-74.41-28.445-102.855 0L26.396 677.092c-28.444 28.444-28.444 74.41 0 102.855s74.411 28.444 102.856 0l382.293-382.294 383.09 383.09c28.444 28.445 74.41 28.445 102.855 0s28.444-74.41 0.114-102.855z"></path></svg>';
            // render display of the portlet
            if (collapsedPortlets.indexOf(title) > -1) {
                mainbody.style.display = "none";
                collapseBtn.setAttribute("title", "Expand this Portlet");
                collapseBtn.querySelector("svg").classList.add("rotated");
            }
            else {
                mainbody.style.display = "block";
                collapseBtn.setAttribute("title", "Collapse this Portlet");
            }
            headerBar.appendChild(collapseBtn);
            // register mouse events
            headerBar.onmouseover = () => { collapseBtn.style.display = "unset"; };
            headerBar.onmouseleave = () => { collapseBtn.style.display = "none"; };
        }
    });
}


if (document.querySelector(".moduleTitle") && document.querySelector(".moduleTitle").innerText === "Welcome") {
    initialize();
    renderTimePort();
    renderLivePort();
    renderCoursesPort();
    renderCollapseOption();
}
