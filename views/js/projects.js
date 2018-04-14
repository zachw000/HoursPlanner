Array.prototype.dataMap = function() {
    return this.map((data) => {
        return `<tr><th scope="row">${data.projnum}</th><td>${data.name}</td><td>${data.projname}</td><td>${data.active ? "<i class='fa fa-check-circle'></i>" : "<i class='fa fa-times'></i>"}</td></tr>`
    }).join('\n')
}
$(document).ready(() => {
    selector = $();
    eventEmitter.on('loggedIn', () => {/*LOG IN SPECIFIC ACTIONS*/})
    eventEmitter.on('projRead', () => {
        let tableRows = record.projects.projects.dataMap()
        $("#p_list").html(tableRows)
        selector = $("tr th, td");
    })
    /*$("table").on("click", function () {
        alert($(this).text());
    });*/
    $("td").on('click', function() {
        alert($(this).text())
      })
    if ((record.projects === null)) {
        readProjects((err, ret) => {
            if (err !== null) return;
            eventEmitter.emit('projRead')
        })
    }
})