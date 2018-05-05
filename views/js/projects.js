Array.prototype.dataMap = function () {
    return this.map((data) => {
        return `<tr><th scope="row">${data.projnum}</th><td>${data.name}</td><td>${data.projname}</td><td>${data.active ? 
            "<i class='fa fa-check-circle'></i> Active" : "<i class='fa fa-times'></i> Not Active"}</td></tr>`
    }).join('\n')
}
let c_proj = null,
    c_index = -1,
    getCurrentProject = (element) => {
        return equalObj(c_proj, element)
    },
    writeLiveRecord = () => {
        if (!(record.projects.projects == null)) {
            jsonfile.writeFile(prepend + filenames[3], record.projects, (err) => {
                if (err) console.error(err)
            })
        }
    }
// Spawn process as asynchronous function to avoid application locking
/**
 * @desc Using the old project number, it moves through the milestones and employee data updating the project number.
 * @param {string} projn 
 * @param {number} p_index 
 */
async function updateExtern(projn, p_index) {
    readMilestones((err, ret) => {
        if (err) {
            alert("External Data could not be updated! Contact software maintainer.")
            console.error(err)
        } else {
            // No error has occurred.
            record.milestones.milestones.forEach((element, m_index) => {
                if (element.projnum == projn)
                    record.milestones.milestones[m_index].projnum = record.projects.projects[c_index].projnum
                if (!(record.milestones.milestones == null)) {
                    // console.log("WRITING")
                    jsonfile.writeFile(prepend + filenames[1], record.milestones, (err) => {
                        if (err !== null) console.error(err);
                    });
                }
            })
        }
    })

    readEmployees((err, ret) => {
        if (err) {
            alert("External Data could not be updated! Contact software maintainer.")
            console.error(err)
        } else {
            record.employees.Employees.forEach((element, e_index) => {
                element.hours.forEach((h_obj, h_index) => {
                    if (h_obj.projnum == projn)
                        record.employees.Employees[e_index].hours[h_index].projnum = record.projects.projects[c_index].projnum
                    if (!(record.employees.Employees == null)) {                
                        jsonfile.writeFile(prepend + filenames[0], record.employees, (err) => {
                            if (err !== null) console.error()
                        })
                    }
                })
            })
        }
    })
}

async function removeEmployees(projectNum) {
    for (let i = record.employees.Employees.length - 1; i >= 0; i--) {
        for (let j = record.employees.Employees[i].hours.length - 1; i >= 0; i--) {
            if (record.employees.Employees[i].hours[j].projnum == projectNum) {
                record.employees.Employees[i].hours.splice(j, 1)
            }
        }
    }
    if (!(record.employees.Employees == null)) {                
        jsonfile.writeFile(prepend + filenames[0], record.employees, (err) => {
            if (err !== null) console.error()
        })
    }
}

async function removeMilestones(projectNum) {
    for (let i = record.milestones.milestones.length - 1; i >= 0; i--) {
        if (record.milestones.milestones[i].projnum == projectNum) {
            record.milestones.milestones.splice(i, 1)
        }
    }
    if (!(record.milestones.milestones == null)) {
        jsonfile.writeFile(prepend + filenames[1], record.milestones, (err) => {
            if (err !== null) console.error(err);
        });
    }
}

async function removeExterns(projectNum) {
    if (record.employees == null || !record.employees.hasOwnProperty("Employees")) {
        // TODO: Read Employee Data
        readEmployees((err, ret) => {
            // display error message
            if (err) console.error(err)
            else {
                removeEmployees(projectNum)
            }
        })
    } else {
        // Otherwise exists
        removeEmployees(projectNum)
    }
    if (record.milestones == null || !record.milestones.hasOwnProperty("milestones")) {
        // TODO: Read Milestone Data
        readMilestones((err, ret) => {
            if (err) console.error(err)
            else {
                removeMilestones(projectNum)
            }
        })
    } else {
        // Exists.
        removeMilestones(projectNum)
    }
}

$(document).ready(() => {
    eventEmitter.on('notLoggedIn', () => {
        $("#nlo-modal").modal();
    })
    $("#nlo-modal").on("hidden.bs.modal", () => {
        window.location.href = "login.ejs";
    })
    eventEmitter.on('projRead', () => {
        let tableRows = record.projects.projects.sort((a, b) => {
            return a.projnum - b.projnum;
        }).dataMap()
        $("#p_list").html(tableRows)
        readEmployees((err, ret) => {
            if (err) console.error(err)
            let htm = record.employees.Employees.filter(element => element.projectmanager).map((element) => {
                return `<option value="${element.name}">${element.name}</option>`
            }).join('\n')
            $("#editSelect").html(htm)
            $("#newSelect").html(htm)
        })
    })
    eventEmitter.on('updateTable', () => {
        let tableRows = record.projects.projects.sort((a, b) => {
            return a.projnum - b.projnum;
        }).dataMap()
        $("#p_list").html(tableRows)
    })
    $("#p_list").on('click', 'tr', function () {
        let num = $(this).find("th").first().text()
        c_proj = getProjectByNum(num)
        c_index = (record.projects.projects.findIndex(getCurrentProject))
        $("#editProjNum").val(c_proj.projnum)
        $("#editSelect").val(c_proj.name)
        $("#editDesc").val(c_proj.projname)
        document.getElementById("editActive").checked = c_proj.active
        $("#edit-modal").modal()
    })
    $("#editProj").on('click', function () {
        if ($("#editProjNum").val() == "" || $("#editSelect").val() == "" || $("#editDesc").val() == "") {
            alert("All fields must be filled.")
        } else {
            // continue save operation
            p_set = record.projects.projects
            let prev_num = p_set[c_index].projnum
            record.projects.projects[c_index].projnum = $("#editProjNum").val()
            record.projects.projects[c_index].projname = $("#editDesc").val()
            record.projects.projects[c_index].name = $("#editSelect").val()
            record.projects.projects[c_index].active = document.getElementById("editActive").checked
            
            // TODO: if projnum is different, update milestones AND hours
            if (record.projects.projects[c_index].projnum !== prev_num) {
                updateExtern(prev_num, c_index)
            }
            writeLiveRecord()
            eventEmitter.emit("updateTable")
            $("#edit-modal").modal("hide")
        }
    })
    $("#deleteProj").on('click', () => {
        let shouldDelete = confirm("Are you sure you want to delete this project? (THIS WILL REMOVE ALL HOURS AND MILESTONES ASSOCIATED WITH THE PROJECT AS WELL)")
        if (shouldDelete) {
            // delete the currently selected project (as indicated by c_index)
            let pn = record.projects.projects[c_index].projnum
            p_set = record.projects.projects
            // delete the entry
            record.projects.projects.splice(c_index, 1)
            removeExterns(pn)
            writeLiveRecord()
            eventEmitter.emit('updateTable')
            $("#edit-modal").modal("hide")
        }
    })
    $("#addProj").on('click', function() {
        let npn = $("#newProjNum").val()
        let ns = $("#newSelect").val()
        let nd = $("#newDesc").val()
        let isActive = document.getElementById("newActive").checked

        p_set = record.projects.projects
        record.projects.projects.push({
            "name": ns,
            "projnum": npn,
            "projname": nd,
            "active": isActive
        })

        writeLiveRecord()
        eventEmitter.emit("updateTable")
        $("#addnew-modal").modal("hide")
    })
    $("#newProject").on("click", function () {
        $("#addnew-modal").modal();
    })
    if ((record.projects === null)) {
        readProjects((err, ret) => {
            if (err !== null) return;
            eventEmitter.emit('projRead')
        })
    }
})