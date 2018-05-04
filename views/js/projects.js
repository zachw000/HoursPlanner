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