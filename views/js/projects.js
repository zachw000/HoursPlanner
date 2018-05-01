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
            record.projects.projects[c_index].projnum = $("#editProjNum").val()
            record.projects.projects[c_index].projname = $("#editDesc").val()
            record.projects.projects[c_index].name = $("#editSelect").val()
            record.projects.projects[c_index].active = document.getElementById("editActive").checked
            
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