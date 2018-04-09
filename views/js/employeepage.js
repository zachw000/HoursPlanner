// Division display variables
var dphx = true;
var dlax = true;
var projmanager = false;
$(document).ready(function() {
  $("input[type='checkbox']").on('change', function () {
    dlax = document.getElementById("division-lax").checked;
    dphx = document.getElementById("division-phx").checked;
    let nset = record.employees.Employees.filter((element) => {
      let re = false;
      if (dlax) re = element.division.toLowerCase() == "lax";
      if (dphx && !re)re = element.division.toLowerCase() == "phx";
      return re;
    }).map((data) => {
      return `<tr><td>${data.name}</td><td>${data.division}</td><td>${data.role}</td><td>${totalHours(data.hours)}</td></tr>`;
    }).join("\n");
    $("#empTable").html(nset);
  });
  eventEmitter.on('empRead', () => {
    var empSet = record.employees.Employees;
    let tableRow = empSet.map((data) => {
      return `<tr><td>${data.name}</td><td>${data.division}</td><td>${data.role}</td><td>${totalHours(data.hours)}</td></tr>`;
    }).join('\n');
    $("#empTable").html(tableRow);
  });
});
$(document).ready(() => {
  // Check the login status
  eventEmitter.on('loggedIn', () => {
    if ((record.employees === null) && typeof record.employees === 'object') {
      // if the record set is empty load into memory
      readEmployees((err, ret) => {
        if (err !== null) {
          eventEmitter.emit('readError');
          console.error(err);
          return; // leave function
        } else {
          projmanager = checkManager(ret);
          // Emit the event so the employee file is only read once.
          //if (projmanager) alert(lname + " is a project manager.");
        }
      });
    } else {
      // the recordset is already available, use for speed.
      projmanager = checkManager(record.employees);
      //if (projmanager) alert(lname + " is a project manager. RECORDSET");
    }
  });
  if (record.employees === null || typeof record.employees !== 'object') {
    readEmployees((err, ret) => {
      eventEmitter.emit('empRead');
    });
  }
});