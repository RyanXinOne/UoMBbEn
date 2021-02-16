let isCourseEditing = false;
function editCourses() {
    isCourseEditing = !isCourseEditing;
    if (isCourseEditing) {
        let courses = document.getElementById("CurrentCourses").getElementsByTagName("ul")[0].getElementsByTagName("li");
        for (let i = 0; i < courses.length; i++) {
            courses[i].innerHTML += '<button class="hidebtn">X</button>';
        }
    }
    else {
        let courses = document.getElementById("CurrentCourses").getElementsByTagName("ul")[0].getElementsByTagName("li");
        for (let i = 0; i < courses.length; i++) {
            courses[i].innerHTML = courses[i].innerHTML.replace(/<button.*hidebtn.*>.*<\/button>/, "");
        }
    }
}