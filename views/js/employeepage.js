// Division display variables
let dphx = true,
  dlax = true,
  cEmp = null,
  dataMap = (arr) =>
  arr.sort((a, b) => {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  }).map((data) => {
    return `<tr><td>${data.name}</td><td>${data.division}</td><td>${data.role}</td><td>${totalHours(data.hours, moment())}</td><td>${totalHours(data.hours, moment().add(7, 'd'))}</td></tr>`;
  }),
  mapProjects = (arr) => arr.sort((a, b) => {
    return a.projnum < b.projnum ? -1 : a.projnum > b.projnum ? 1 : 0;
  }).map((data) => {
    return `<option value="${data.projnum}">${data.projnum}- ${data.projname}</option>`
  }),
  withinPeriod = (element) => {
    if (moment(element.date).isSameOrAfter(moment().startOf('isoWeek')) && moment(element.date).isSameOrBefore(moment().endOf("week")))
      return true
    return false
  },
  withinNextPeriod = (element) => {
    if (moment(element.date).isSameOrAfter(moment().add(7, 'd').startOf('isoWeek')) && moment(element.date).isSameOrBefore(moment().add(7, 'd').endOf("week")))
      return true
    return false
  },
  r_all = true,
  r_admin = false,
  r_eng = false,
  r_drft = false,
  r_insp = false,
  r_prog = false,
  mode = "";
var getEmployee = (data) => {
    let i = null
    let obj = record.employees.Employees.filter((element, index) => {
      if (element.name.toLowerCase() == data.find("td").first().text().toLowerCase() &&
        element.division.toUpperCase() == data.find("td").first().next().text().toUpperCase() &&
        element.role.toLowerCase() == data.find("td").last().prev().prev().text().toLowerCase()) {
        i = index
        return true;
      }
      return false;
    })[0]

    obj["index"] = i
    return obj
  },
  writeLiveRecord = () => {
    let cIndex = null
    if (cEmp != null && cEmp.hasOwnProperty("index"))
      cIndex = cEmp.index
    if (!(record.employees.Employees == null)) {
      for (let i = 0; i < record.employees.Employees.length; i++) {
        delete record.employees.Employees[i].index
      }

      jsonfile.writeFile(prepend + filenames[0], record.employees, (err) => {
        if (err !== null) console.error()
        if (cEmp != null && cEmp.hasOwnProperty("index"))
          cEmp.index = cIndex
      })
    }
  }
$(document).ready(() => {
  eventEmitter.on('notLoggedIn', () => {
    $("#nlo-modal").modal()
  })
  $("#nlo-modal").on("hidden.bs.modal", () => {
    window.location.href = "login.ejs"
  })
  $("#enterHours").on('hidden.bs.modal', () => {
    // When the modal is closed
  })
  $("#ehours").on('keyup', function () {
    if ($(this).val() != "") {
      $("#saveTime").attr('disabled', false)
    } else {
      $("#saveTime").attr('disabled', true)
    }
  })
  $("#saveTime").on('click', () => {
    let cweek = document.getElementById("cWeekEdit").checked
    let nweek = document.getElementById("nWeekEdit").checked
    let p_num = $("#cpn").text().split(' ')[$("#cpn").text().split(' ').length - 1]
    let proj = getProjectByNum(p_num)
    let hours_t = $("#ehours").val()
    if (mode == "addproj" && cweek && hours_t != 0) {
      cEmp.hours.push({
        "projnum": p_num,
        "date": moment().format("YYYY-MM-DD"),
        "time": (parseInt(hours_t) > 0 ? parseInt(hours_t) : 1)
      })

      let val = "",
        reject = [],
        projs = ""
      cEmp.hours.filter(withinPeriod).forEach(element => {
        reject.push(element.projnum)
        val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
      })
      record.employees.Employees[cEmp.index].hours = cEmp.hours

      projs = mapProjects(p_set.filter(element => element.active).filter(p => {
        let ret = true
        reject.forEach(added => {
          //console.log(p.projnum)
          if (p.projnum == added) ret = false
        })
        return ret
      })).join('\n')
      document.getElementById('cWeekEdit').checked = true

      $("#hours").val(totalHours(cEmp.hours, moment()))
      $("#availableProj").html(projs)

      $("#assignedProj").html(val)
    } else if (mode == "addproj" && nweek && hours_t != "0") {
      cEmp.hours.push({
        "projnum": p_num,
        "date": moment().add(7, 'd').format("YYYY-MM-DD"),
        "time": (parseInt(hours_t) > 0 ? parseInt(hours_t) : 1)
      })
      let val = "",
        reject = [],
        projs = ""
      cEmp.hours.filter(withinNextPeriod).forEach(element => {
        reject.push(element.projnum)
        val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
      })
      record.employees.Employees[cEmp.index].hours = cEmp.hours
      projs = mapProjects(p_set.filter(element => element.active).filter(p => {
        let ret = true
        reject.forEach(added => {
          //console.log(p.projnum)
          if (p.projnum == added) ret = false
        })
        return ret
      })).join('\n')
      document.getElementById('nWeekEdit').checked = true

      $("#hours").val(totalHours(cEmp.hours, moment().add(7, 'd')))
      $("#availableProj").html(projs)

      $("#assignedProj").html(val)

    } else if (mode == "editproj") {
      if (nweek) {
        for (let i = 0; i < cEmp.hours.length; i++) {
          if (p_num == cEmp.hours[i].projnum && withinNextPeriod(cEmp.hours[i])) {
            cEmp.hours[i].time = (parseInt(hours_t) > 0 ? parseInt(hours_t) : 1)
          }
        }
        let val = "",
          reject = [],
          projs = ""
        cEmp.hours.filter(withinNextPeriod).forEach(element => {
          reject.push(element.projnum)
          val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
        })
        record.employees.Employees[cEmp.index].hours = cEmp.hours
        projs = mapProjects(p_set.filter(element => element.active).filter(p => {
          let ret = true
          reject.forEach(added => {
            //console.log(p.projnum)
            if (p.projnum == added) ret = false
          })
          return ret
        })).join('\n')
        document.getElementById('nWeekEdit').checked = true

        $("#hours").val(totalHours(cEmp.hours, moment().add(7, 'd')))
        $("#availableProj").html(projs)

        $("#assignedProj").html(val)
      } else if (cweek) {
        for (let i = 0; i < cEmp.hours.length; i++) {
          if (p_num == cEmp.hours[i].projnum && withinPeriod(cEmp.hours[i])) {
            cEmp.hours[i].time = (parseInt(hours_t) > 0 ? parseInt(hours_t) : 1)
          }
        }
        let val = "",
          reject = [],
          projs = ""
        cEmp.hours.filter(withinPeriod).forEach(element => {
          reject.push(element.projnum)
          val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
        })
        record.employees.Employees[cEmp.index].hours = cEmp.hours
        projs = mapProjects(p_set.filter(element => element.active).filter(p => {
          let ret = true
          reject.forEach(added => {
            //console.log(p.projnum)
            if (p.projnum == added) ret = false
          })
          return ret
        })).join('\n')
        document.getElementById('cWeekEdit').checked = true

        $("#hours").val(totalHours(cEmp.hours, moment()))
        $("#availableProj").html(projs)

        $("#assignedProj").html(val)
      }
    }
    writeLiveRecord()
    eventEmitter.emit('updateTable')
  })
  $("input[type='checkbox'], input[name='role']").on('change', function () {
    dlax = document.getElementById("division-lax").checked;
    dphx = document.getElementById("division-phx").checked;
    r_all = document.getElementById("role-all").checked;
    r_admin = document.getElementById("role-admin").checked
    r_drft = document.getElementById("role-drafter").checked;
    r_eng = document.getElementById("role-engineer").checked
    r_insp = document.getElementById("role-inspector").checked;
    r_prog = document.getElementById("role-programmer").checked
    let nset = dataMap(record.employees.Employees.filter((element) => {
      let re = false,
        r2 = false;
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
      return re && r2;
    })).join('\n')
    $("#empTable").html(nset)
  });
  eventEmitter.on('empRead', () => {
    let tableRow = dataMap(record.employees.Employees).join('\n');
    $("#empTable").html(tableRow)
  });
  eventEmitter.on('updateTable', function () {
    dlax = document.getElementById("division-lax").checked;
    dphx = document.getElementById("division-phx").checked;
    r_all = document.getElementById("role-all").checked;
    r_admin = document.getElementById("role-admin").checked
    r_drft = document.getElementById("role-drafter").checked;
    r_eng = document.getElementById("role-engineer").checked
    r_insp = document.getElementById("role-inspector").checked;
    r_prog = document.getElementById("role-programmer").checked
    let nset = dataMap(record.employees.Employees.filter((element) => {
      let re = false,
        r2 = false;
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
      return re && r2;
    })).join('\n')
    $("#empTable").html(nset)
  })
  $("#empTable").on("click", "tr", function () {
    $("#edit-modal").modal()
    $("#editName").val($(this).find("td").first().text())
    $("#changeDivision").val($(this).find("td").first().next().text())
    $("#changeRole").val($(this).find("td").last().prev().prev().text().toLowerCase())
    $("#hours").val($(this).find("td").last().prev().text())
    cEmp = getEmployee($(this))
    let val = "",
      reject = [],
      projs = ""
    cEmp.hours.filter(withinPeriod).forEach(element => {
      reject.push(element.projnum)
      val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
    })

    projs = mapProjects(p_set.filter(element => element.active).filter(p => {
      let ret = true
      reject.forEach(added => {
        //console.log(p.projnum)
        if (p.projnum == added) ret = false
      })
      return ret
    })).join('\n')
    document.getElementById('cWeekEdit').checked = true
    $("#availableProj").html(projs)

    $("#assignedProj").html(val)
  })
  // Adding Project to hours log mode = "addproj"
  $("#availableProj").on('dblclick', 'option', function () {
    //$("#assignedProj").append($(this))
    $("#ehours").val("")
    $("#cpn").text("Project #: " + $(this).text().split('-')[0])
    $("#enterHours").modal()
    $("#saveTime").attr('disabled', true)
    $("#deleteTime").hide()
    mode = "addproj"
  })
  $("input[name='weekSelect']").on('change', function () {
    let cweek = document.getElementById("cWeekEdit").checked
    let nweek = document.getElementById("nWeekEdit").checked
    if (cweek) {
      $("#hours").val(totalHours(cEmp.hours, moment()))
      let val = "",
        reject = [],
        projs = ""
      cEmp.hours.filter(withinPeriod).forEach(element => {
        reject.push(element.projnum)
        val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
      })

      projs = mapProjects(p_set.filter(element => element.active).filter(p => {
        let ret = true
        reject.forEach(added => {
          //console.log(p.projnum)
          if (p.projnum == added) ret = false
        })
        return ret
      })).join('\n')
      $("#availableProj").html(projs)

      $("#assignedProj").html(val)
    } else if (nweek) {
      $("#hours").val(totalHours(cEmp.hours, moment().add(7, 'd')))
      let val = "",
        reject = [],
        projs = ""
      cEmp.hours.filter(withinNextPeriod).forEach(element => {
        reject.push(element.projnum)
        val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
      })

      projs = mapProjects(p_set.filter(element => element.active).filter(p => {
        let ret = true
        reject.forEach(added => {
          if (p.projnum == added) ret = false
        })
        return ret
      })).join('\n')
      $("#availableProj").html(projs)

      $("#assignedProj").html(val)
    }
  })
  $("#assignedProj").on('dblclick', 'option', function () {
    $("#ehours").val($(this).text().split(' ')[$(this).text().split(' ').length - 2])
    $("#cpn").text("Project #: " + $(this).text().split('-')[0])
    $("#enterHours").modal()
    $("#deleteTime").show()
    mode = "editproj"
  })
  $("#deleteTime").on('click', () => {
    // Grabs current project number to delete
    let p_num = $("#cpn").text().split(' ').pop()
    let cweek = document.getElementById("cWeekEdit").checked
    let nweek = document.getElementById("nWeekEdit").checked
    let purgeIndex = null
    let confirmDelete = confirm("Are you sure you want to delete the hours entry?")
    //let arr_active = null
    if (confirmDelete) {
      if (cweek) {
        cEmp.hours.filter((data, index, ar) => {
          if (data.projnum == p_num) {
            purgeIndex = index
            return true
          }
          return false
        }).filter(withinPeriod)
      } else if (nweek) {
        cEmp.hours.filter((data, index, ar) => {
          if (data.projnum == p_num) {
            purgeIndex = index
            return true
          }
          return false
        }).filter(withinNextPeriod)
      }
      // Check if null
      if (typeof purgeIndex !== 'object' && purgeIndex !== null) {
        cEmp.hours.splice(purgeIndex, 1)
        record.employees.Employees[cEmp.index].hours = cEmp.hours
      }

      if (cweek) {
        let val = "",
          reject = [],
          projs = ""
        cEmp.hours.filter(withinPeriod).forEach(element => {
          reject.push(element.projnum)
          val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
        })
        record.employees.Employees[cEmp.index].hours = cEmp.hours
        projs = mapProjects(p_set.filter(element => element.active).filter(p => {
          let ret = true
          reject.forEach(added => {
            if (p.projnum == added) ret = false
          })
          return ret
        })).join('\n')
        document.getElementById('cWeekEdit').checked = true

        $("#hours").val(totalHours(cEmp.hours, moment()))
        $("#availableProj").html(projs)

        $("#assignedProj").html(val)
      }

      if (nweek) {
        let val = "",
          reject = [],
          projs = ""
        cEmp.hours.filter(withinNextPeriod).forEach(element => {
          reject.push(element.projnum)
          val += `<option value="${element.projnum}">${element.projnum}-${getProjectByNum(element.projnum).projname} ${element.time} Hour${element.time > 1 ? "s" : ""}</option>\n`
        })
        record.employees.Employees[cEmp.index].hours = cEmp.hours
        projs = mapProjects(p_set.filter(element => element.active).filter(p => {
          let ret = true
          reject.forEach(added => {
            if (p.projnum == added) ret = false
          })
          return ret
        })).join('\n')
        document.getElementById('nWeekEdit').checked = true

        $("#hours").val(totalHours(cEmp.hours, moment().add(7, 'd')))
        $("#availableProj").html(projs)

        $("#assignedProj").html(val)
      }

      writeLiveRecord()
      eventEmitter.emit("updateTable")
    }
  })
  $("#addEmpBtn").on("click", () => {
    // Reset Name
    $("#newName").val("")
    $("#addEmp").prop('disabled', true)
    $("#newPM").prop('checked', false)
    $("#addnew-modal").modal();
  })
  $("#newName").on("keyup", function (){
    if ($(this).val() == "") {
      $("#addEmp").prop('disabled', true)
    } else {
      $("#addEmp").prop('disabled', false)
    }
  })
  $("#addEmp").on("click", () => {
    let newName = $("#newName").val()
    let division = $("#setDivision").val()
    let newPM = $("#newPM").prop('checked')
    let newRole = $("#setRole").val()

    // check if name already exists, if so, just update role
    let index = record.employees.Employees.findIndex((element, index) => {
      return (element.name.toLowerCase() == newName.toLowerCase())
    })

    if (index !== -1) {
      alert("Error: Name is already in database.")
      // exit function, do not close modal.
      return
    }
    newName = newName.replace(/(\b\w)/gi, (m) => { return m.toUpperCase() })
    newRole = newRole.replace(/(\b\w)/gi, (m) => { return m.toUpperCase() })
    record.employees.Employees.push({
      "name": newName,
      "division": division.toUpperCase(),
      "projectmanager": newPM,
      "role": newRole,
      "hours": []
    })

    writeLiveRecord()
    eventEmitter.emit("updateTable")
    $("#addnew-modal").modal('hide')
  })
  $("#updateEmp").on('click', () => {
    record.employees.Employees[cEmp.index].name = $("#editName").val()
    record.employees.Employees[cEmp.index].division = $("#changeDivision").val()
    record.employees.Employees[cEmp.index].role = $("#changeRole").val()

    $("#edit-modal").modal('hide')
    writeLiveRecord()
    eventEmitter.emit("updateTable")
  })
  if ((record.employees === null) && typeof record.employees === 'object') {
    readEmployees((err, ret) => {
      if (err !== null) return;
      eventEmitter.emit('empRead');
      readProjects((err, ret) => {
        $("#availableProj").html(mapProjects(ret.projects).join('\n'))
      })
    })
  }
})
