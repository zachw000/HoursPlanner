// Division display variables
let dphx = true, dlax = true, dataMap = (arr) => 
  arr.map((data) => {
    return `<tr><td>${data.name}</td><td>${data.division}</td><td>${data.role}</td><td>${totalHours(data.hours)}</td></tr>`;});
$(document).ready(() => {
  $("input[type='checkbox']").on('change', function () {
    dlax = document.getElementById("division-lax").checked;
    dphx = document.getElementById("division-phx").checked;
    let nset = dataMap(record.employees.Employees.filter((element) => {
      let re = false;
      if (dlax) re = element.division.toLowerCase() == "lax";
      if (dphx && !re)re = element.division.toLowerCase() == "phx";
      return re;
    })).join('\n');
    $("#empTable").html(nset);
  });
  eventEmitter.on('empRead', () => {
    let tableRow = dataMap(record.employees.Employees).join('\n');
    $("#empTable").html(tableRow);
  });
  eventEmitter.on('loggedIn', () => {/*Log-in specific things*/});
  if ((record.employees === null) && typeof record.employees === 'object') {
    // if the record set is empty load into memory
    readEmployees((err, ret) => {
      if (err !== null) return;
      eventEmitter.emit('empRead');
    });
  }
});