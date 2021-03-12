
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
                let editBox = document.getElementById("livePort").getElementsByTagName("li")[index].getElementsByClassName("liveEditBox")[0];
                let valuei = JSON.parse(items.liveSessions)[index];
                let inputBoxes = editBox.getElementsByTagName("input");
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
	temp.src = chrome.extension.getURL('js/inject.js');  // get the link like：chrome-extension://xxxxxx/js/inject.js
    document.head.appendChild(temp);
    // register "message" event listener for communication
    window.addEventListener("message", (e) => {
        commandHandler(e.data.command, e.data.data);
    }, false);
}

function renderCoursesPort() {
    // render Courses Port
    let courseEle = document.getElementById("CurrentCourses");
    if (!courseEle){
        setTimeout(renderCoursesPort, 10);
        return false;
    }
    // render display of current courses
    chrome.storage.sync.get(["disabledCourses"], (items) => {
        let disabled = JSON.parse(items.disabledCourses);
        let courses = courseEle.getElementsByTagName("ul")[0].getElementsByTagName("li");
        for (let i = 0; i < courses.length; i++) {
            let courseTitle = courses[i].getElementsByTagName("a")[0].innerText;
            if (disabled.indexOf(courseTitle) > -1) {
                courses[i].classList.add("hiddenCourse");
                courses[i].style.display = "none";
            }
        }
        // show edit button of Courses port
        document.getElementById("column1").getElementsByClassName("edit_controls")[0].innerHTML = '<a class="editModule" title="Manage Course Display" href="javascript:/*edit_module*/void(0);" onclick="CoursesPortEditor.editCourses()"><img alt="Manage Course Display" src="https://learn.content.blackboardcdn.com/3900.6.0-rel.24+5fa90d1/images/ci/ng/palette_settings.gif"></a>';
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
    document.getElementById("column0").appendChild(timePort);
    document.getElementById("ukTime").innerText = calculateTime();
    setInterval(() => {
        document.getElementById("ukTime").innerText = calculateTime();
    }, 1000);
}

function renderLivePort() {
    // render live session port
    let livePort = document.createElement("div");
    livePort.className = "portlet clearfix";
    livePort.innerHTML = '<div class="edit_controls"><a class="editModule" title="Edit Entries" href="javascript:/*edit_module*/void(0);" onclick="LiveSessionsPortEditor.editPort()"><img alt="Edit Entries" src="https://learn.content.blackboardcdn.com/3900.6.0-rel.24+5fa90d1/images/ci/ng/palette_settings.gif"></a></div><h2 class="clearfix"><span class="moduleTitle">Live Sessions</span></h2><div class="collapsible" style="overflow: auto; aria-expanded="true" id="$fixedId"><div id="livePort" style="display: block;"><ul class="listElement"></ul></div></div>';
    document.getElementById("column0").appendChild(livePort);
    chrome.storage.sync.get(["liveSessions"], (items) => {
        let entries = JSON.parse(items.liveSessions);
        let livePortUl = document.getElementById("livePort").getElementsByTagName("ul")[0];
        let iHTML = "";
        for (let i = 0; i < entries.length; i++) {
            iHTML += '<li><a href="' + entries[i].link + '" target="_blank">' + entries[i].group + ' - ' + entries[i].title + '</a>';
            if (entries[i].passcode) {
                iHTML += '<span class="cpbtn">' + entries[i].passcode + '</span>';
            }
            iHTML += '</li>';
        }
        livePortUl.innerHTML = iHTML;
    });
}

function renderCollapseOption() {
    // add a collapse button for all boxes to collapse contents
    let portlets = document.getElementsByClassName("portlet");
    chrome.storage.sync.get(["collapsedPortlets"], (items) => {
        let collapsedPortlets = JSON.parse(items.collapsedPortlets);
        for (let i = 0; i < portlets.length; i++) {
            let headerBar = portlets[i].getElementsByTagName("h2")[0];
            let title = headerBar.getElementsByClassName("moduleTitle")[0].innerText;
            let mainbody = portlets[i].getElementsByClassName("collapsible")[0];
            let collapseBtn = document.createElement("button");
            collapseBtn.className = "collabtn";
            collapseBtn.setAttribute("onclick", "PortletEditor.toggleCollapse(" + i + ")");
            collapseBtn.style.display = "none";
            collapseBtn.innerHTML = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M997.604 677.888l-431.56-431.56c-0.91-1.023-1.934-2.047-2.844-3.071-28.444-28.445-74.41-28.445-102.855 0L26.396 677.092c-28.444 28.444-28.444 74.41 0 102.855s74.411 28.444 102.856 0l382.293-382.294 383.09 383.09c28.444 28.445 74.41 28.445 102.855 0s28.444-74.41 0.114-102.855z"></path></svg>';
            if (collapsedPortlets.indexOf(title) > -1) {
                mainbody.style.display = "none";
                collapseBtn.setAttribute("title", "Expand this Portlet");
                collapseBtn.getElementsByTagName("svg")[0].classList.add("rotated");
            }
            else {
                mainbody.style.display = "block";
                collapseBtn.setAttribute("title", "Collapse this Portlet");
            }
            headerBar.appendChild(collapseBtn);
            headerBar.onmouseover = () => { collapseBtn.style.display = "unset"; };
            headerBar.onmouseleave = () => { collapseBtn.style.display = "none"; };
        }
    });
}


if (document.getElementsByClassName("moduleTitle").length && document.getElementsByClassName("moduleTitle")[0].innerText === "Welcome") {
    initialize();
    renderTimePort();
    renderLivePort();
    renderCoursesPort();
    renderCollapseOption();
}
