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
            if (courses[i].getElementsByTagName("a")[0].style.textDecoration === "line-through") {
                courses[i].style.display = "none";
            }
        }
    }
}

function toggleCourseDisplay(courseIndex) {
    let anchorEle = document.getElementById("CurrentCourses").getElementsByTagName("ul")[0].getElementsByTagName("li")[courseIndex].getElementsByTagName("a")[0];
    if (anchorEle.style.textDecoration === "line-through") {
        anchorEle.style.textDecoration = "none";
        anchorEle.style.color = "#1874a4";
    }
    else {
        anchorEle.style.textDecoration = "line-through";
        anchorEle.style.color = "#bcbcbc";
    }
}