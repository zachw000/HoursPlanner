/*jshint esversion: 6 */
// Division display variables
var dphx = true;
var dlax = true;
var projmanager = false;

var filterEmployeeData = (key, dval) => {
  // This function will rely on data already being loaded into RAM
  var empSet = record.employees.Employees;
  var newEmpSet = [];
  for (var i = 0; i < empSet.length; i++) {
    if (empSet[i][key] !== dval) newEmpSet.push(empSet[i]);
  }

  return newEmpSet;
};

var matchEmployeeData = (key, dval) => {
  // This function will rely on data already being loaded into RAM
  var empSet = record.employees.Employees;
  var newEmpSet = [];
  for (var i = 0; i < empSet.length; i++) {
    if (empSet[i][key] === dval) newEmpSet.push(empSet[i]);
  }

  return newEmpSet;
};

$(document).ready(function() {
  // Run when page is loaded.
  $('#division-phx').change(function() {
    dphx = this.checked;
    var empRows = $("#empTable").html().split('\n');
    if (!dphx) {
      var empSet = filterEmployeeData("division", "PHX");
      var tableRow = [];
      for (var i = 0; i < empSet.length; i++) {
        tableRow.push("<td>" + empSet[i].name + "</td><td>" +
        empSet[i].division + "</td><td>" + empSet[i].role + "</td><td>" + totalHours(empSet[i].hours) +
        "</td>");
        tableRow[tableRow.length - 1] = "<tr>" + tableRow[tableRow.length - 1] + "</tr>\n";
      }
      $("#empTable").html(tableRow.join(''));
    } else {
      var empSet = matchEmployeeData("division", "PHX");
      var tableRow = [];
      for (var i = 0; i < empSet.length; i++) {
        tableRow.push("<td>" + empSet[i].name + "</td><td>" +
        empSet[i].division + "</td><td>" + empSet[i].role + "</td><td>" + totalHours(empSet[i].hours) +
        "</td>");
        tableRow[tableRow.length - 1] = "<tr>" + tableRow[tableRow.length - 1] + "</tr>\n";
        for (var j = 0; j < empRows.length; j++) {
          if (tableRow[tableRow.length - 1] == empRows[j])
            tableRow.pop();
        }
      }
      $("#empTable").html(empRows.join('\n') + tableRow.join(''));
    }
    //alert("Filter PHX changed");
  });

  $('#division-lax').change(function() {
    dlax = this.checked;
    var empRows = $("#empTable").html().split('\n');
    if (!dlax) {
      var empSet = filterEmployeeData("division", "LAX");
      var tableRow = [];
      for (var i = 0; i < empSet.length; i++) {
        tableRow.push("<td>" + empSet[i].name + "</td><td>" +
        empSet[i].division + "</td><td>" + empSet[i].role + "</td><td>" + totalHours(empSet[i].hours) +
        "</td>");
        tableRow[tableRow.length - 1] = "<tr>" + tableRow[tableRow.length - 1] + "</tr>\n";
      }
      $("#empTable").html(tableRow.join(''));
    } else {
      var empSet = matchEmployeeData("division", "LAX");
      var tableRow = [];
      for (var i = 0; i < empSet.length; i++) {
        tableRow.push("<td>" + empSet[i].name + "</td><td>" +
        empSet[i].division + "</td><td>" + empSet[i].role + "</td><td>" + totalHours(empSet[i].hours) +
        "</td>");
        tableRow[tableRow.length - 1] = "<tr>" + tableRow[tableRow.length - 1] + "</tr>\n";
        for (var j = 0; j < empRows.length; j++) {
          if (tableRow[tableRow.length - 1] == empRows[j])
            tableRow.pop();
        }
      }
      $("#empTable").html(tableRow.join('') + empRows.join('\n'));
    }
    //alert("Filter LAX changed");
  });

  eventEmitter.on('empRead', () => {
    var empSet = record.employees.Employees;
    var tableRow = [];
    //alert(JSON.stringify(empSet, null, ' '));
    for (var i = 0; i < empSet.length; i++) {
      tableRow.push("<td>" + empSet[i].name + "</td><td>" +
      empSet[i].division + "</td><td>" + empSet[i].role + "</td><td>" + totalHours(empSet[i].hours) +
      "</td>");
      tableRow[tableRow.length - 1] = "<tr>" + tableRow[tableRow.length - 1] + "</tr>\n";
    }

    $("#empTable").html(tableRow.join(''));
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
