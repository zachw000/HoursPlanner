// Division display variables
let dphx = true, dlax = true, dataMap = (arr) => 
  arr.sort((a, b) => {return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;}).map((data) => {
    return `<tr><td>${data.name}</td><td>${data.division}</td><td>${data.role}</td><td>${totalHours(data.hours)}</td></tr>`;
  }),
  mapProjects = (arr) => arr.sort((a, b) => {return a.projnum < b.projnum ? -1 : a.projnum > b.projnum ? 1 : 0;}).map((data) => {
    return `<option value="${data.projnum}">${data.projnum}- ${data.projname}</option>`
  });
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
      let re = false;
      if (dlax) re = element.division.toLowerCase() == "lax";
      if (dphx && !re) re = element.division.toLowerCase() == "phx";
      return re;})).join('\n')
    $("#empTable").html(nset)
  });
  eventEmitter.on('empRead', () => {
    let tableRow = dataMap(record.employees.Employees).join('\n');
    $("#empTable").html(tableRow)
  });
  $("#empTable").on("click", "tr", function() {
    $("#edit-modal").modal()
    $("#editName").val($(this).find("td").first().text())
    $("#changeDivision").val($(this).find("td").first().next().text())
    $("#changeRole").val($(this).find("td").last().prev().text().toLowerCase())
    $("#hours").val($(this).find("td").last().text())
    // Send DOM object to get relevent Employee information.
    // TODO: Define activeProj and getEmployee
    //$("#assignedProj").val(activeProj(getEmployee($(this)).hours))
  })
  $("#availableProj").on('dblclick', 'option', function() {
    $("#assignedProj").append($(this))
  })
  $("#addEmpBtn").on("click", () => {
    $("#addnew-modal").modal();
  })
  if ((record.employees === null) && typeof record.employees === 'object') {
    readEmployees((err, ret) => {
      if (err !== null) return;
      eventEmitter.emit('empRead');
    })
    readProjects((err, ret) => {
      if (err !== null) return;
      console.log(ret)
      $("#availableProj").html(mapProjects(ret.projects).join('\n'))
      $("#selectProj").html(mapProjects(ret.projects).join('\n'))
    })
  }
})