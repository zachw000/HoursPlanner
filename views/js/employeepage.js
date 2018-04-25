// Division display variables
let dphx = true, dlax = true, cEmp = null, dataMap = (arr) => 
  arr.sort((a, b) => {return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;}).map((data) => {
    return `<tr><td>${data.name}</td><td>${data.division}</td><td>${data.role}</td><td>${totalHours(data.hours, moment())}</td><td>${totalHours(data.hours, moment().add(7, 'd'))}</td></tr>`;
  }), mapProjects = (arr) => arr.sort((a, b) => {return a.projnum < b.projnum ? -1 : a.projnum > b.projnum ? 1 : 0;}).map((data) => {
    return `<option value="${data.projnum}">${data.projnum}- ${data.projname}</option>`
  }), withinPeriod = (element) => {
    if (moment(element.date).isSameOrAfter(moment().startOf('isoWeek')) && moment(element.date).isSameOrBefore(moment().endOf("week")))
      return true
    return false
  }, withinNextPeriod = (element) => {
    if (moment(element.date).isSameOrAfter(moment().add(7, 'd').startOf('isoWeek')) && moment(element.date).isSameOrBefore(moment().add(7, 'd').endOf("week")))
      return true
    return false
  }, r_all = true, r_admin = false, r_eng = false, r_drft = false, r_insp = false, r_prog = false;
var getEmployee = (data) => {
  let obj = record.employees.Employees.filter((element) => {
    if (element.name.toLowerCase() == data.find("td").first().text().toLowerCase() &&
      element.division.toUpperCase() == data.find("td").first().next().text().toUpperCase() &&
      element.role.toLowerCase() == data.find("td").last().prev().prev().text().toLowerCase())
      return true;
    return false;
  })[0]
  let i = record.employees.Employees.findIndex((element) => {
    return obj == element
  })

  obj["index"] = i
  return obj
}
$(document).ready(() => {
  eventEmitter.on('notLoggedIn', () => {
      $("#nlo-modal").modal()
  })
  $("#nlo-modal").on("hidden.bs.modal", () => {
      window.location.href = "login.ejs"
  })
  $("input[type='checkbox'], input[name='role']").on('change', function () {
    dlax = document.getElementById("division-lax").checked; dphx = document.getElementById("division-phx").checked;
    r_all = document.getElementById("role-all").checked; r_admin = document.getElementById("role-admin").checked
    r_drft = document.getElementById("role-drafter").checked; r_eng = document.getElementById("role-engineer").checked
    r_insp = document.getElementById("role-inspector").checked; r_prog = document.getElementById("role-programmer").checked
    let nset = dataMap(record.employees.Employees.filter((element) => {
      let re = false, r2 = false;
      if (!r_all) {
        if (r_admin) re = element.role.toLowerCase() == "admin"
        if (r_drft && !re) re = element.role.toLowerCase() == "drafter"
        if (r_eng && !re) re = element.role.toLowerCase() == "engineer"
        if (r_insp && !re) re = element.role.toLowerCase() == "inspector"
        if (r_prog && !re) re = element.role.toLowerCase() == "programmer"
      } else {
        re = true
      }
      if (dlax) r2 = element.division.toLowerCase() == "lax";
      if (dphx && !r2) r2 = element.division.toLowerCase() == "phx";
      return re && r2;})).join('\n')
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
    $("#changeRole").val($(this).find("td").last().prev().prev().text().toLowerCase())
    $("#hours").val($(this).find("td").prev().last().text())
    cEmp = getEmployee($(this))
    let val = "", reject = [], projs = ""
    cEmp.hours.filter(withinPeriod).forEach(element => {
      reject.push(element.projnum)
      val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
    })

    projs = mapProjects(p_set.filter(element => element.active).filter(p => {
      let ret = true
      reject.forEach(added => {
        console.log(p.projnum)
        if (p.projnum == added) ret = false
      })
      return ret
    })).join('\n')
    document.getElementById('cWeekEdit').checked = true
    $("#availableProj").html(projs)

    $("#assignedProj").html(val)
  })
  $("#availableProj").on('dblclick', 'option', function() {
    //$("#assignedProj").append($(this))
    $("#enterHours").modal()
  })
  $("#addEmpBtn").on("click", () => {
    $("#addnew-modal").modal();
  })
  if ((record.employees === null) && typeof record.employees === 'object') {
    readEmployees((err, ret) => {
      if (err !== null) return;
      eventEmitter.emit('empRead');
      readProjects((err, ret) => {
        $("#availableProj").html(mapProjects(ret.projects).join('\n'))
        $("#selectProj").html(mapProjects(ret.projects).join('\n'))
      })
    })
  }
})