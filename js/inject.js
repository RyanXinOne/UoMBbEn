let isCourseEditing = false;
function editCourses() {
    // enter edit mode of courses
    isCourseEditing = !isCourseEditing;
    if (isCourseEditing) {
        let courses = document.getElementById("CurrentCourses").getElementsByTagName("ul")[0].getElementsByTagName("li");
        for (let i = 0; i < courses.length; i++) {
            courses[i].innerHTML += '<button class="hidebtn" onclick="toggleCourseDisplay(' + i + ')">×</button>';
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
        window.postMessage({"command": "showCourse", "data": courseEle.getElementsByTagName("a")[0].innerText}, '*');
    }
    else {
        // hide
        courseEle.classList.add("hiddenCourse");
        window.postMessage({"command": "hideCourse", "data": courseEle.getElementsByTagName("a")[0].innerText}, '*');
    }
}