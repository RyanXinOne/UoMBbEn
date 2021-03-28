
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
                courses[i].getElementsByClassName("hidebtn")[0].remove();
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

    getEditButtonHTML(index) {
        return '<button class="editbtn" title="Edit this Entry" onclick="LiveSessionsPortEditor.toggleEditBox(' + index + ')"><svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M861.635303 523.955265v323.584171c0 17.702782-14.406255 32.109037-32.109037 32.109037H173.067709c-17.702782 0-32.109037-14.406255-32.109037-32.109037V200.36039c0-17.702782 14.406255-32.109037 32.109037-32.109036h328.229279v-74.921087H173.067709c-59.102034 0-107.030123 47.928089-107.030123 107.030123v647.189749c0 59.102034 47.928089 107.030123 107.030123 107.030123h656.458557c59.102034 0 107.030123-47.928089 107.030123-107.030123V523.955265h-74.921086z"></path><path d="M580.413655 512.984677a37.481949 37.481949 0 0 1-52.979911 0 37.481949 37.481949 0 0 1 0-52.979911l325.425089-325.425089a37.481949 37.481949 0 0 1 52.979911 0 37.481949 37.481949 0 0 1 0 52.979911L580.413655 512.984677zM404.969877 733.370404a37.460543 37.460543 0 1 1 0-74.921087h192.654222a37.460543 37.460543 0 1 1 0 74.921087h-192.654222z"></path></svg></button>';
    },

    getEditBoxHTML(index) {
        let html = '<div><span>Course</span><input></div><div><span>Tag</span><input></div><div><span>Link</span><input></div><div><span>Passcode</span><input placeholder="(optional)"></div><div>';
        if (index !== -1)
            html += '<button class="editboxbtn" onclick="LiveSessionsPortEditor.deleteConfig(' + index + ')">Delete</button>';
        html += '<button class="editboxbtn" onclick="LiveSessionsPortEditor.confirmConfig(' + index + ')">' + (index !== -1 ? 'Confirm' : 'Add') + '</button>';
        html += '<button class="editboxbtn" onclick="LiveSessionsPortEditor.hideEditBox(' + index + ')">Cancel</button>';
        html += '</div>';
        return html;
    },

    getAddButtonHTML() {
        return '<div class="addbtn" title="Add a New Entry" onclick="LiveSessionsPortEditor.showAddBox()">+</div>';
    },

    getDirectShortcutSVG() {
        return '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M661.781677 828.365032 579.267595 587.177594C570.726098 562.210926 545.191576 545.703058 519.010014 548.045861L264.736013 571.017253 824.242564 143.903963 661.781677 828.365032ZM857.835024 10.904978 105.706959 585.060706C100.900626 588.729734 96.709919 592.889576 93.165524 598.242621 85.75648 609.432393 82.488074 623.585122 88.340942 639.041243 94.255788 654.661022 106.30893 663.161161 119.467424 666.518991 125.760712 668.12494 131.712968 668.376539 137.782634 667.833405L526.615483 633.039592C513.72255 634.193286 502.732704 627.088445 498.528533 614.799714L624.895371 984.168107C626.877374 989.961509 629.561192 995.333973 633.632077 1000.446903 642.018284 1010.979596 654.589872 1018.437608 671.06296 1017.591467 687.489003 1016.74752 699.192811 1008.095817 706.473207 996.819017 710.004363 991.349516 712.144672 985.757745 713.558351 979.804038L932.157666 59.170658C943.011422 13.459944 895.042872-17.498563 857.835024 10.904978L857.835024 10.904978Z"></path></svg>';
    },

    editLivePort() {
        // enter edit mode of Live Sessions
        this.isLiveEditing = !this.isLiveEditing;
        let liveList = document.getElementById("livePort").getElementsByTagName("ul")[0];
        let entries = liveList.getElementsByTagName("li");
        if (this.isLiveEditing) {
            for (let i = 0; i < entries.length; i++) {
                // render edit button
                entries[i].innerHTML += this.getEditButtonHTML(i);
                // render edit box (none display by default)
                entries[i].innerHTML += '<div class="liveEditBox" style="display:none;">' + this.getEditBoxHTML(i) + '</div>';
            }
            //render add box
            liveList.innerHTML += '<li><div class="liveEditBox">' + this.getAddButtonHTML() + '</div></li>';
        }
        else {
            for (let i = 0; i < entries.length - 1; i++) {
                entries[i].getElementsByClassName("editbtn")[0].remove();
                entries[i].getElementsByClassName("liveEditBox")[0].remove();
            }
            entries[entries.length - 1].remove();
        }
    },

    hideEditBox(index) {
        // hide the edit box
        let editBox = document.getElementById("livePort").getElementsByClassName("liveEditBox");
        editBox = editBox[index !== -1 ? index : editBox.length - 1];
        if (index !== -1) editBox.style.display = "none";
        else editBox.innerHTML = this.getAddButtonHTML();
    },

    toggleEditBox(index) {
        // toggle display of editBoxes (triggered by edit button)
        let editBox = document.getElementById("livePort").getElementsByTagName("li")[index].getElementsByClassName("liveEditBox")[0];
        if (editBox.style.display === "none") {
            // render contents of edit box from storage
            window.postMessage({ "command": "renderLiveEditBox", "data": index });
        }
        else this.hideEditBox(index);
    },

    showAddBox() {
        // show Adding edit box
        let addBox = document.getElementById("livePort").getElementsByClassName("liveEditBox");
        addBox = addBox[addBox.length - 1];
        addBox.innerHTML = this.getEditBoxHTML(-1);
    },

    deleteConfig(index) {
        // delete an entry
        window.postMessage({ "command": "deleteLive", "data": index });
        // update ui
        let entries = document.getElementById("livePort").getElementsByTagName("li");
        // update index number of onclick
        let updateClickFunc = (ele, index) => {
            let clickFunc = ele.getAttribute("onclick");
            clickFunc = clickFunc.replace(/\(\d+?\)/, '(' + index + ')');
            ele.setAttribute("onclick", clickFunc);
        };
        for (let i = index + 1; i < entries.length - 1; i++) {
            // update copy button
            let cpBtns = entries[i].getElementsByClassName("cpbtn");
            if (cpBtns.length) updateClickFunc(cpBtns[0], i - 1);
            // update edit box buttons
            let btnEles = entries[i].getElementsByTagName("button");
            for (let j = 0; j < btnEles.length; j++) {
                updateClickFunc(btnEles[j], i - 1);
            }
        }
        entries[index].remove();
    },

    confirmConfig(index) {
        // add or confirm editing of entries in Live Sessions port
        let editBox = document.getElementById("livePort").getElementsByClassName("liveEditBox");
        let addBoxIndex = editBox.length - 1;
        editBox = editBox[index !== -1 ? index : addBoxIndex];
        let data = {
            "group": editBox.getElementsByTagName("input")[0].value.trim(),
            "title": editBox.getElementsByTagName("input")[1].value.trim(),
            "link": editBox.getElementsByTagName("input")[2].value.trim(),
            "passcode": editBox.getElementsByTagName("input")[3].value.trim()
        };
        if (index !== -1) {
            window.postMessage({ "command": "editLive", "data": [index, data] }, '*');
            // update ui (edit)
            let entry = document.getElementById("livePort").getElementsByTagName("li")[index];
            let anchorEle = entry.getElementsByTagName("a")[0];
            anchorEle.setAttribute("href", data.link);
            anchorEle.innerText = data.group + ' - ' + data.title;
            let editBtn = entry.getElementsByClassName("editbtn")[0];
            // update copy button
            let cpBtns = entry.getElementsByClassName("cpbtn");
            if (cpBtns.length) cpBtns[0].remove();
            if (data.passcode) {
                let cpBtn = document.createElement("span");
                cpBtn.className = "cpbtn";
                cpBtn.setAttribute("title", "Copy Passcode");
                cpBtn.setAttribute("onclick", "LiveSessionsPortEditor.copyPasscode(" + index + ")");
                cpBtn.innerText = data.passcode;
                editBtn.parentNode.insertBefore(cpBtn, editBtn);
            }
            // update direct shortcut
            let shortcut = entry.getElementsByClassName("shortcut");
            if (shortcut.length) shortcut[0].remove();
            if (data.link.indexOf('zoom.us') > -1) {
                let roomNo = data.link.match(/j\/(\d+)/);
                if (roomNo && roomNo.length === 2) {
                    roomNo = roomNo[1];
                    let dlink = 'zoommtg://zoom.us/join?confno=' + roomNo + '&pwd=' + data.passcode + '&zc=0';
                    let shortcut = document.createElement("a");
                    shortcut.className = "shortcut";
                    shortcut.setAttribute("title", "Direct Shortcut");
                    shortcut.setAttribute("href", dlink);
                    shortcut.innerHTML = this.getDirectShortcutSVG();
                    editBtn.parentNode.insertBefore(shortcut, editBtn);
                }
            }
        }
        else {
            window.postMessage({ "command": "addLive", "data": data }, '*');
            // update ui (add)
            let newEntryEle = document.createElement("li");
            newEntryEle.innerHTML = '<a href="' + data.link + '" target="_blank">' + data.group + ' - ' + data.title + '</a>';
            // update copy button
            if (data.passcode) {
                newEntryEle.innerHTML += '<span class="cpbtn" title="Copy Passcode" onclick="LiveSessionsPortEditor.copyPasscode(' + addBoxIndex + ')">' + data.passcode + '</span>';
            }
            // update direct shortcut
            if (data.link.indexOf('zoom.us') > -1) {
                let roomNo = data.link.match(/j\/(\d+)/);
                if (roomNo && roomNo.length === 2) {
                    roomNo = roomNo[1];
                    let dlink = 'zoommtg://zoom.us/join?confno=' + roomNo + '&pwd=' + data.passcode + '&zc=0';
                    newEntryEle.innerHTML += '<a class="shortcut" title="Direct Shortcut" href="' + dlink + '">' + this.getDirectShortcutSVG() + '</a>';
                }
            }
            // update edit button and edit box
            newEntryEle.innerHTML += this.getEditButtonHTML(addBoxIndex);
            newEntryEle.innerHTML += '<div class="liveEditBox" style="display:none;">' + this.getEditBoxHTML(addBoxIndex) + '</div>';
            editBox.parentNode.parentNode.insertBefore(newEntryEle, editBox.parentNode);
        }
        this.hideEditBox(index);
    },

    copyPasscode(index) {
        // copy passcode into clipboard
        let entry = document.getElementById("livePort").getElementsByTagName("li")[index];
        let pcdBtn = entry.getElementsByClassName("cpbtn")[0];
        // execute copy
        var aux = document.createElement("input");
        aux.setAttribute("value", pcdBtn.innerText);
        document.body.appendChild(aux);
        aux.select();
        let isSuccessful = document.execCommand("copy");
        document.body.removeChild(aux);
        // write copy feedback
        let cpFeedback = document.createElement("span");
        cpFeedback.className = "cpfeedback";
        cpFeedback.innerText = isSuccessful ? "Copied" : "Copy Failed";
        let editBtns = entry.getElementsByClassName("editbtn");
        if (editBtns.length) editBtns[0].parentNode.insertBefore(cpFeedback, editBtns[0]);
        else entry.appendChild(cpFeedback);
        // register mouseleave event to delete copy feedback
        let rmFeedback = () => {
            entry.getElementsByClassName("cpfeedback")[0].remove();
            entry.removeEventListener("mouseleave", rmFeedback, false);
        };
        entry.addEventListener("mouseleave", rmFeedback, false);
    }
};

let PortletEditor = {
    toggleCollapse(index) {
        // collapse (or expand) the main body of a portlet
        let portlet = document.getElementsByClassName("portlet")[index];
        let title = portlet.getElementsByClassName("moduleTitle")[0].innerText;
        let mainbody = portlet.getElementsByClassName("collapsible")[0];
        let collapseBtn = portlet.getElementsByClassName("collabtn")[0];
        if (mainbody.style.display === "none") {
            mainbody.style.display = "block";
            collapseBtn.setAttribute("title", "Collapse this Portlet");
            collapseBtn.getElementsByTagName("svg")[0].classList.remove("rotated");
            // store user setting
            window.postMessage({ "command": "expandPortlet", "data": title });
        }
        else {
            mainbody.style.display = "none";
            collapseBtn.setAttribute("title", "Expand this Portlet");
            collapseBtn.getElementsByTagName("svg")[0].classList.add("rotated");
            // store user setting
            window.postMessage({ "command": "collapsePortlet", "data": title });
        }
    }
};
