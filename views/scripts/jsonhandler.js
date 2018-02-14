/*jshint esversion: 6 */
let jsonfile = require('jsonfile');
const preprend = "../../json/";
var filenames = ["Employee.json", "Milestones.json", "NIO.json", "Projects.json"];
var obj_preload;

// Checks whether the employee data is valid, if the data is not valid, then return false
function checkEmployeeObject(obj) {
  var ret = true;
  if (obj === null) ret = false;
  else {
    // Run checks
    ret = obj.hasOwnProperty('name') ? ret:false;
    ret = obj.hasOwnProperty('division') ? ret:false;
    ret = obj.hasOwnProperty('projectmanager') ? ret:false;
    ret = obj.hasOwnProperty('role') ? ret:false;
    ret = obj.hasOwnProperty('hours') ? ret:false;
  }
  return ret;
}

// return false if createObject fails
var createEmployee = function(data) {
  if (!checkEmployeeObject(data))
    return false;

};
