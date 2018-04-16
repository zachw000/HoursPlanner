Array.prototype.dataMap = function () {
    return this.map((data) => {
        return `<tr><th scope="row">${data.projnum}</th><td>${data.name}</td><td>${data.projname}</td><td>${data.active ? 
            "<i class='fa fa-check-circle'></i> Active" : "<i class='fa fa-times'></i> Not Active"}</td></tr>`
    }).join('\n')
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
    })
    $("#wrapper").on('click', 'tbody tr', function () {
        alert($(this).html().split("</"))
        // get all data from the current table row
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