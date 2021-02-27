
let CoursesPortEditor = {
    isCourseEditing: false,

    editCourses() {
    // enter edit mode of courses
        this.isCourseEditing = !this.isCourseEditing;
        let courses = document.getElementById("CurrentCourses").getElementsByTagName("ul")[0].getElementsByTagName("li");
        if (this.isCourseEditing) {
            for (let i = 0; i < courses.length; i++) {
                let isHidden = courses[i].className.indexOf("hiddenCourse") !== -1;
                courses[i].innerHTML += '<button class="hidebtn" title="Toggle Display" onclick="CoursesPortEditor.toggleCourseDisplay(' + i + ')">' + (isHidden ? '☐' : '☒') + '</button>';
                courses[i].style.display = "list-item";
            }
        }
        else {
            for (let i = 0; i < courses.length; i++) {
                courses[i].innerHTML = courses[i].innerHTML.replace(/<button.*hidebtn.*>.*<\/button>/, "");
                if (courses[i].className.indexOf("hiddenCourse") !== -1) {
                    courses[i].style.display = "none";
                }
            }
        }
    },
    
    toggleCourseDisplay(courseIndex) {
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
};

let LiveSessionsPortEditor = {
    isLiveEditing: false,

    getEditBoxHTML(index) {
        let html = '<div><span>Group</span><input></div><div><span>Title</span><input></div><div><span>Link</span><input></div><div><span>Passcode</span><input></div><div>';
        if (index != -1)
            html += '<button class="editboxbtn" onclick="LiveSessionsPortEditor.deleteConfig(' + index + ')">Delete</button>';
        html += '<button class="editboxbtn" onclick="LiveSessionsPortEditor.confirmConfig(' + index + ')">' + (index != -1 ? 'Confirm' : 'Add') + '</button>';
        html += '<button class="editboxbtn" onclick="LiveSessionsPortEditor.cancelConfig(' + index + ')">Cancel</button>';
        html += '</div>';
        return html;
    },

    editPort() {
        // enter edit mode of Live Sessions
        this.isLiveEditing = !this.isLiveEditing;
        let liveList = document.getElementById("livePort").getElementsByTagName("ul")[0];
        let entries = liveList.getElementsByTagName("li");
        if (this.isLiveEditing) {
            for (let i = 0; i < entries.length; i++) {
                // render edit button
                entries[i].innerHTML += '<button class="editbtn" onclick="LiveSessionsPortEditor.toggleEditBox(' + i + ')"><svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M861.635303 523.955265v323.584171c0 17.702782-14.406255 32.109037-32.109037 32.109037H173.067709c-17.702782 0-32.109037-14.406255-32.109037-32.109037V200.36039c0-17.702782 14.406255-32.109037 32.109037-32.109036h328.229279v-74.921087H173.067709c-59.102034 0-107.030123 47.928089-107.030123 107.030123v647.189749c0 59.102034 47.928089 107.030123 107.030123 107.030123h656.458557c59.102034 0 107.030123-47.928089 107.030123-107.030123V523.955265h-74.921086z"></path><path d="M580.413655 512.984677a37.481949 37.481949 0 0 1-52.979911 0 37.481949 37.481949 0 0 1 0-52.979911l325.425089-325.425089a37.481949 37.481949 0 0 1 52.979911 0 37.481949 37.481949 0 0 1 0 52.979911L580.413655 512.984677zM404.969877 733.370404a37.460543 37.460543 0 1 1 0-74.921087h192.654222a37.460543 37.460543 0 1 1 0 74.921087h-192.654222z"></path></svg></button>';
                // render edit box (none display by default)
                entries[i].innerHTML += '<div class="liveEditBox" style="display:none;">' + this.getEditBoxHTML(i) + '</div>';
            }
            //render add box
            liveList.innerHTML += '<li><div class="liveEditBox"><div class="addbtn" onclick="LiveSessionsPortEditor.showAddBox()">+</div></div></li>';
        }
        else {
            for (let i = 0; i < entries.length; i++) {
                entries[i].innerHTML = entries[i].innerHTML.replace(/<button.*editbtn.*>.*<\/button><div.*liveEditBox.*<\/div>$/, "");
            }
            liveList.innerHTML = liveList.innerHTML.replace(/<li><div.*liveEditBox.*>.*<\/div><\/li>$/, "");
        }
    },

    toggleEditBox(index) {
        let editBox = document.getElementById("livePort").getElementsByTagName("li")[index].getElementsByClassName("liveEditBox")[0];
        if (editBox.style.display == "none")
            editBox.style.display = "block";
        else
            this.cancelConfig(index);
    },

    showAddBox() {
        let addBox = document.getElementById("livePort").getElementsByClassName("liveEditBox");
        addBox = addBox[addBox.length - 1];
        addBox.innerHTML = this.getEditBoxHTML(-1);
    },

    deleteConfig(index) {
        window.postMessage({ "command": "deleteLive", "data": index });
    },

    confirmConfig(index) {
        // add or edit entries in Live Sessions port
        let editBox = document.getElementById("livePort").getElementsByClassName("liveEditBox");
        editBox = editBox[index != -1 ? index : editBox.length - 1];
        let data = {
            "group": editBox.getElementsByTagName("input")[0].value,
            "title": editBox.getElementsByTagName("input")[1].value,
            "link": editBox.getElementsByTagName("input")[2].value,
            "passcode": editBox.getElementsByTagName("input")[3].value
        };
        if (index != -1) {
            window.postMessage({ "command": "editLive", "data": [index, data] }, '*');
        }
        else {
            window.postMessage({ "command": "addLive", "data": data }, '*');
        }
    },

    cancelConfig(index) {
        let editBox = document.getElementById("livePort").getElementsByClassName("liveEditBox");
        editBox = editBox[index != -1 ? index : editBox.length - 1];
        if (index != -1) {
            editBox.style.display = "none";
        }
        else {
            editBox.innerHTML = '<div class="addbtn" onclick="LiveSessionsPortEditor.showAddBox()">+</div>';
        }
    }
};
