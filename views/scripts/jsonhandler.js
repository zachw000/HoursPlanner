/*jshint esversion: 6 */
let jsonfile = require('jsonfile');
const prepend = "json/";
var filenames = ["Employee.json", "Milestones.json", "NIO.json", "Projects.json"];
var obj_preload;
var events = require('events');
var eventEmitter = new events.EventEmitter();

var record = {
  "employees": Object,
  "milestones": Object,
  "NIO": Object,
  "Projects": Object
};

// Checks whether the employee data is valid, if the data is not valid, then return false
function checkEmployeeObject(obj) {
  var ret = true;
  if (obj === null || typeof obj != 'object') ret = false;

  // Checks that all of the following properties exists
  ret = obj.hasOwnProperty('name') ? ret:false;
  ret = obj.hasOwnProperty('division') ? ret:false;
  ret = obj.hasOwnProperty('projectmanager') ? ret:false;
  ret = obj.hasOwnProperty('role') ? ret:false;
  ret = obj.hasOwnProperty('hours') ? ret:false;

  return ret;
}

// Checks milestone data for validity.
function checkMilestoneData(obj) {
  var ret = true;
  if (obj === null || typeof obj != 'object') ret = false;

  ret = obj.hasOwnProperty('name') ? ret:false;
  ret = obj.hasOwnProperty('projnum') ? ret:false;
  ret = obj.hasOwnProperty('date') ? ret:false;
  ret = obj.hasOwnProperty('type') ? ret:false;

  return ret;
}

function hasNull(target) {
  for (var prop in target) {
    if (target[prop] == null) return true;
  }

  return false;
}

var readEmployees = function(callback) {
  jsonfile.readFile(prepend + filenames[0], function(err, ret) {
    if (err !== null) {
      console.log(err);
      eventEmitter.emit('readError');
    }

    record.employees = ret;
    return callback(err, ret);
  });
};

// Reads milestone data
var readMilestones = function(callback) {
    jsonfile.readFile(prepend + filenames[1], function(err, ret) {
      if (err !== null) {
        console.log(err);
        eventEmitter.emit('readError');
      }

      record.milestones = ret;
      return callback(err, ret);
    });
};

// return false if createObject fails
var createEmployee = function(data, callback) {
  // Makes sure the item is an object, and isn't null
  if (!(data !== null && typeof data === 'object'))
    return callback("Input data is not of type 'object' or is null.");
  // Checks whether the object is a valid employee object, with no nulls
  if (!checkEmployeeObject(data) || hasNull(data))
    return callback("Input data is not a valid 'Employee' object, or contains null properties.");

  // Read Employee JSON file, and use the object to write to list
  readEmployees(function (err, ret) {
    // "ret" is the object with the JSON data,
    // record.employees.Employees contains public data, push to public for quick changes
    if (err !== null) {
      eventEmitter.emit('readError');
      return callback(err);
    }
    record.employees.Employees.push(data);

    // Now write all data to the JSON file
    jsonfile.writeFile(prepend + filename[0], record.employees, function (err) {
      // Go to callback and return control to previous function
      if (err !== null) return callback(err);
      else return callback(null);
    });
  });
};
