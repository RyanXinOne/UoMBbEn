let isCourseEditing = false;
let isLiveEditing = false;

function editCourses() {
    // enter edit mode of courses
    isCourseEditing = !isCourseEditing;
    if (isCourseEditing) {
        let courses = document.getElementById("CurrentCourses").getElementsByTagName("ul")[0].getElementsByTagName("li");
        for (let i = 0; i < courses.length; i++) {
            let isHidden = courses[i].className.indexOf("hiddenCourse") !== -1;
            courses[i].innerHTML += '<button class="hidebtn" title="Toggle Display" onclick="toggleCourseDisplay(' + i + ')">' + (isHidden ? '☐' : '☒') + '</button>';
            courses[i].style.display = "list-item";
        }
    }
    else {
        let courses = document.getElementById("CurrentCourses").getElementsByTagName("ul")[0].getElementsByTagName("li");
        for (let i = 0; i < courses.length; i++) {
            courses[i].innerHTML = courses[i].innerHTML.replace(/<button.*hidebtn.*>.*<\/button>/, "");
            if (courses[i].className.indexOf("hiddenCourse") !== -1) {
                courses[i].style.display = "none";
            }
        }
    }
}

function toggleCourseDisplay(courseIndex) {
    // hide or show a course entry
    let courseEle = document.getElementById("CurrentCourses").getElementsByTagName("ul")[0].getElementsByTagName("li")[courseIndex];
    if (courseEle.className.indexOf("hiddenCourse") !== -1) {
        // show
        courseEle.classList.remove("hiddenCourse");
        courseEle.getElementsByTagName("button")[0].innerText = "☒";
        window.postMessage({"command": "showCourse", "data": courseEle.getElementsByTagName("a")[0].innerText}, '*');
    }
    else {
        // hide
        courseEle.classList.add("hiddenCourse");
        courseEle.getElementsByTagName("button")[0].innerText = "☐";
        window.postMessage({"command": "hideCourse", "data": courseEle.getElementsByTagName("a")[0].innerText}, '*');
    }
}

function editLiveSessions() {
    // enter edit mode of Live Sessions
    isLiveEditing = !isLiveEditing;
    if (isLiveEditing) {
        let livePort = document.getElementById("livePort");
        livePort.innerHTML += '<div class="liveEditBox"><div><span>Group</span><input></div><div><span>Title</span><input></div><div><span>Link</span><input></div><div><span>Passcode</span><input></div><div><button>Confirm</button></div></div>'
    }
    else {

    }
}