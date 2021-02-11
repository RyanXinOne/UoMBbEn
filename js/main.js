
const enabledCourses = ["COMP10120", "COMP11120", "COMP11212", "COMP13212", "COMP15212", "COMP16412"];
const sessionLinks = {
    "COMP10120 - Mon Live": "https://zoom.us/j/99834452668#success",
    "COMP10120 - Tue Lab": "https://zoom.us/j/99472897815#success",
    "COMP10120 - Thu Tutorial": "https://zoom.us/j/93017662193#success",
    "COMP11120 Math - Tue Example - 328882": "https://zoom.us/j/91297341121#success",
    "COMP11120 Math - Tur Live - 084290": "https://zoom.us/j/99774198906#success",
    "COMP11212 Computation": "https://zoom.us/j/93199465841#success",
    "COMP13212 Data - Wed Lab (Week B)": "https://zoom.us/j/96410527968#success",
    "COMP13212 Data - Fri QA": "https://zoom.us/j/94617933511#success",
    "COMP15212 OS": "https://zoom.us/j/93740586633#success",
    "COMP16412 Java": "https://zoom.us/j/97747275935#success"
}

function renderCourses() {
    // render current courses
    // only display courses I want to see
    let courseEle = document.getElementById("CurrentCourses");
    if (!courseEle){
        setTimeout(renderCourses, 10);
        return false;
    }
    let courses = courseEle.getElementsByTagName("ul")[0].getElementsByTagName("li");
    for (let i = 0; i < courses.length; i++){
        let courseTitle = courses[i].innerText;
        let courseId = courseTitle.substring(0, 9);
        if (enabledCourses.indexOf(courseId) == -1) {
            courses[i].style.display = "none";
        }
    }
}
function calculateTime() {
    // calculate UK time
    let targetTimeZone = 0;  //UK time zone (GMT)
    let offset_GMT = new Date().getTimezoneOffset();
    let nowDate = new Date().getTime();
    let targetDate = new Date(nowDate + offset_GMT * 60 * 1000 + targetTimeZone * 60 * 60 * 1000);
    let formatNumber = (n) => { return n < 10 ? "0" + n.toString() : n.toString() };
    const weekDay = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
    const months = { 0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun", 6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec" };
    let readableTime = formatNumber(targetDate.getHours()) + ":" + formatNumber(targetDate.getMinutes()) + ":" + formatNumber(targetDate.getSeconds()) + " " + weekDay[targetDate.getDay()] + ", " + targetDate.getDate() + " " + months[targetDate.getMonth()];
    return readableTime;
}
function renderTimePort() {
    // render UK time port
    let timePort = document.createElement("div");
    timePort.className = "portlet clearfix";
    timePort.innerHTML = '<div class="edit_controls"></div><h2 class="clearfix"><span class="moduleTitle">UK Time</span></h2><div class="collapsible" style="overflow: auto; aria-expanded="true" id="$fixedId"><div class="vtbegenerated"><p id="ukTime" style="text-align:center;font-family:\'Open Sans\',sans-serif;font-weight:bold;font-size:16px;color:rgb(0,0,0);overflow-wrap:break-word;margin:0;"></p></div></div>';
    document.getElementById("column0").appendChild(timePort);
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
window.onload = () => {
    if (document.getElementsByClassName("moduleTitle").length && document.getElementsByClassName("moduleTitle")[0].innerText === "Welcome") {
        renderTimePort();
        renderLivePort();
        renderCourses();
    }
}
