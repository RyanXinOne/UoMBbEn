
const sessionLinks = {
    "COMP10120 Team - Mon Live": "https://zoom.us/j/99834452668#success",
    "COMP10120 Team - Tue Lab": "https://zoom.us/j/99472897815#success",
    "COMP10120 Team - Thu Tutorial": "https://zoom.us/j/93017662193#success",
    "COMP11120 Math - Tue Example - 328882": "https://zoom.us/j/91297341121#success",
    "COMP11120 Math - Tur Live - 084290": "https://zoom.us/j/99774198906#success",
    "COMP11212 Computation - 161803": "https://zoom.us/j/93199465841#success",
    "COMP13212 Data - Wed Lab (Week B)": "https://zoom.us/j/96410527968#success",
    "COMP13212 Data - Fri QA - 191863": "https://zoom.us/j/94617933511#success",
    "COMP15212 OS": "https://zoom.us/j/93740586633#success",
    "COMP16412 Java": "https://zoom.us/j/97747275935#success"
}

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
        default:
            break;
    }
}

function initialize() {
    // initialize chrome storage
    chrome.storage.sync.get(["disabledCourses"], (items) => {
        if (!items.disabledCourses)
            chrome.storage.sync.set({ "disabledCourses": JSON.stringify([]) });
    });
    // inject cuntom js
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
	temp.src = chrome.extension.getURL('js/inject.js');  // get the link like：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
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
        let courses = courseEle.getElementsByTagName("ul")[0].getElementsByTagName("li");
        for (let i = 0; i < courses.length; i++) {
            let courseTitle = courses[i].getElementsByTagName("a")[0].innerText;
            if (items.disabledCourses.indexOf(courseTitle) > -1) {
                courses[i].classList.add("hiddenCourse");
                courses[i].style.display = "none";
            }
        }
        // show edit button of Courses port
        document.getElementById("column1").getElementsByClassName("edit_controls")[0].innerHTML = '<a title="Manage Course Display" href="javascript:/*edit_module*/void(0);" onclick="editCourses()"><img alt="Manage Course Display" src="https://learn.content.blackboardcdn.com/3900.6.0-rel.24+5fa90d1/images/ci/ng/palette_settings.gif"></a>';
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
    let iHTML = '<div class="edit_controls"></div><h2 class="clearfix"><span class="moduleTitle">Live Sessions</span></h2><div class="collapsible" style="overflow: auto; aria-expanded="true" id="$fixedId"><div style="display: block;"><ul class="listElement">';
    for (let key in sessionLinks){
        iHTML += '<li><a href="' + sessionLinks[key] + '" target="_blank">' + key + '</a></li>';
    }
    iHTML += '</ul></div></div>';
    livePort.innerHTML = iHTML;
    document.getElementById("column0").appendChild(livePort);
}

function renderLinksPort() {
    // render custom Links Port
}

window.onload = () => {
    if (document.getElementsByClassName("moduleTitle").length && document.getElementsByClassName("moduleTitle")[0].innerText === "Welcome") {
        initialize();
        renderTimePort();
        renderLivePort();
        renderCoursesPort();
    }
}
