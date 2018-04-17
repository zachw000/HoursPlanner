// Division display variables
let dphx = true, dlax = true, dataMap = (arr) => 
  arr.sort((a, b) => {return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;}).map((data) => {
    return `<tr><td>${data.name}</td><td>${data.division}</td><td>${data.role}</td><td>${totalHours(data.hours)}</td></tr>`;});
$(document).ready(() => {
  eventEmitter.on('notLoggedIn', () => {
      $("#nlo-modal").modal()
  })
  $("#nlo-modal").on("hidden.bs.modal", () => {
      window.location.href = "login.ejs"
  })
  $("input[type='checkbox']").on('change', function () {
    dlax = document.getElementById("division-lax").checked; dphx = document.getElementById("division-phx").checked;
    let nset = dataMap(record.employees.Employees.filter((element) => {
      if (dlax) return element.division.toLowerCase() == "lax";
      if (dphx) return element.division.toLowerCase() == "phx";})).join('\n')
    $("#empTable").html(nset)
  });
  eventEmitter.on('empRead', () => {
    let tableRow = dataMap(record.employees.Employees).join('\n');
    $("#empTable").html(tableRow)
  });
  $("#empTable").on("click", "tr", function() {
    $("#edit-modal").modal()
    $("#editName").val($(this).find("td").first().text())
  })
  $("#addEmpBtn").on("click", () => {
    $("#addnew-modal").modal();
  })
  if ((record.employees === null) && typeof record.employees === 'object') {
    readEmployees((err, ret) => {
      if (err !== null) return;
      eventEmitter.emit('empRead');
    });
  }
});