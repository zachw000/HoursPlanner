Array.prototype.dataMap = function() {
    return this.map((data) => {
        return `<tr><td>${data.projnum}</td><td>${data.name}</td><td>${data.projname}</td><td>${data.active ? "<i class='fa fa-check'></i>" : "<i class='fa fa-times'></i>"}</td></tr>`
    }).join('\n')
}
$(document).ready(() => {
    eventEmitter.on('loggedIn', () => {/*LOG IN SPECIFIC ACTIONS*/})
    eventEmitter.on('projRead', () => {
        let tableRows = record.projects.projects.dataMap()
        $("#p_list").html(tableRows)
    })
    if ((record.projects === null)) {
        readProjects((err, ret) => {
            if (err !== null) return;
            eventEmitter.emit('projRead')
        })
    }
})