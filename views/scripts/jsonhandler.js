/*jshint esversion: 6 */
let jsonfile = require('jsonfile');
const prepend = "json/";
var filenames = ["Employee.json", "Milestones.json", "NIO.json", "Projects.json"];
var obj_preload;
var events = require('events');
var eventEmitter = new events.EventEmitter();

var record = {
  "employees": null,
  "milestones": null,
  "nio": null,
  "projects": null
};

// Project recordset
let p_set = null;

// Checks if two objects are equal, only true iff IDENTITICAL
var equalObj = (value, other) => {
  // Get the value type
	var type = Object.prototype.toString.call(value);

	// If the two objects are not the same type, return false
	if (type !== Object.prototype.toString.call(other)) return false;

	// If items are not an object or array, return false
	if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

	// Compare the length of the length of the two items
	var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
	var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
	if (valueLen !== otherLen) return false;

	// Compare two items
	var compare = function (item1, item2) {

		// Get the object type
		var itemType = Object.prototype.toString.call(item1);

		// If an object or array, compare recursively
		if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
			if (!isEqual(item1, item2)) return false;
		}

		// Otherwise, do a simple comparison
		else {

			// If the two items are not the same type, return false
			if (itemType !== Object.prototype.toString.call(item2)) return false;

			// Else if it's a function, convert to a string and compare
			// Otherwise, just compare
			if (itemType === '[object Function]') {
				if (item1.toString() !== item2.toString()) return false;
			} else {
				if (item1 !== item2) return false;
			}

		}
	};

	// Compare properties
	if (type === '[object Array]') {
		for (var i = 0; i < valueLen; i++) {
			if (compare(value[i], other[i]) === false) return false;
		}
	} else {
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				if (compare(value[key], other[key]) === false) return false;
			}
		}
	}

	// If nothing failed, return true
	return true;

};

// Checks whether the employee data is valid, if the data is not valid, then return false
function checkEmployeeData(obj) {
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

function checkNIOData(obj) {
  var ret = true;
  if (obj === null || typeof obj != 'object') ret = false;

  // Check object properties
  ret = obj.hasOwnProperty('name') ? ret:false;
  ret = obj.hasOwnProperty('date') ? ret:false;
  ret = obj.hasOwnProperty('time') ? ret:false;
  ret = obj.hasOwnProperty('type') ? ret:false;

  return ret;
}

function checkProjectData(obj) {
  var ret = true;
  if (obj === null || typeof obj != 'object') ret = false;

  // Check object properties
  ret = obj.hasOwnProperty('name') ? ret:false;
  ret = obj.hasOwnProperty('projnum') ? ret:false;
  ret = obj.hasOwnProperty('projname') ? ret:false;
  ret = obj.hasOwnProperty('active') ? ret:false;

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

// Get Not In Office information, such as PTO or OOO
var readNIO = function(callback) {
  jsonfile.readFile(prepend + filenames[2], function(err, ret) {
    if (err !== null) {
      console.log(err);
      eventEmitter.emit('readError');
    }

    // Place all data into the records
    record.nio = ret;
    return callback(err, ret);
  });
};

// Read all project data
var readProjects = function(callback) {
  jsonfile.readFile(prepend + filenames[3], function(err, ret) {
    if (err !== null) {
      console.log(err);
      eventEmitter.emit('readError');
    }

    // Place all data into the records
    record.projects = ret;
    return callback(err, ret);
  });
};

readProjects((err, ret) => {
  p_set = record.projects.projects
});

var getProjectByNum = (projNum) => {
	var index;
	for (var i = 0; i < p_set.length; i++) {
		if (p_set[i].projnum == projNum) {
			index = i;
			break;
		}
	}
	
	return p_set[index];
};

// Uses the records already in memory rather than reading again, much faster
// Than performing another read
function getRecord(recName) {
  switch (recName) {
    case 'employees':
      return record.employees;
    case 'milestones':
      return record.milestones;
    case 'nio':
      return record.nio;
    case 'projects':
      return record.projects;
    default:
      // Invalid recordset selected
      return null;
  }
}

// return false if createObject fails
var createEmployee = function(data, callback) {
  // Makes sure the item is an object, and isn't null
  if (!(data !== null && typeof data === 'object'))
    return callback("Input data is not of type 'object' or is null.");
  // Checks whether the object is a valid employee object, with no nulls
  if (!checkEmployeeData(data) || hasNull(data))
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

var createMilestone = function(data, callback) {
  if (!(data !== null && typeof data === 'object'))
    return callback("Input data is not of type 'object' or is null.");

  if (!checkMilestoneData(data) || hasNull(data))
    return callback("Input data is not a valid 'Milestone' object, or contains null properties.");

  readMilestones(function (err, ret) {
    if (err !== null) {
      eventEmitter.emit('readError');
      return callback(err);
    }
    // Add data to array
    record.milestones.milestones.push(data);

    // write data and update JSON file
    jsonfile.writeFile(prepend + filename[1], record.milestones, function (err) {
      if (err !== null) return callback(err);
      else return callback(null); // Null is a good thing here
    });
  });
};

var createNIO = function(data, callback) {
  if (!(data !== null && typeof data === 'object'))
    return callback("Input data is not of type 'object' or is null.");
  if (!checkNIOData(data) || hasNull(data))
    return callback("Input data is not a valid 'NIO' object, or contains null properties.");

  readNIO((err, ret) => {
    if (err !== null) {
      eventEmitter.emit('readError');
      return callback(err);
    }

    // Add data to array
    record.nio.notinoffice.push(data);

    // Write data
    jsonfile.writeFile(prepend + filename[2], record.nio, (err) => {
      if (err !== null) return callback(err);
      else return callback(null); // Successful write
    });
  });
};

var createProject = function(data, callback) {
  if (!(data !== null && typeof data === 'object'))
    return callback("Input data is not of type 'object' or is null.");
  if (!checkProjectData(data) || hasNull(data))
    return callback("Input data is not a valid 'Project' object, or contains null properties.");

  readProjects(function (err, ret) {
    if (err !== null) {
      eventEmitter.emit('readError');
      return callback(err);
    }

    // Add data to array
    record.projects.projects.push(data);

    // Write data
    jsonfile.writeFile(prepend + filename[3], record.projects, function (err) {
      if (err !== null) return callback(err);
      else return callback(null); // Successful write
    });
  });
};

var clearRecordMemory = function() {
  // Delete all record memory
  delete record.employees;
  delete record.milestones;
  delete record.nio;
  delete record.projects;

  // Recreate empty variables
  record.employees = Object;
  record.milestones = Object;
  record.nio = Object;
  record.projects = Object;
};

/*
TEMP Placeholders for future delete functions
*/

// Pass a valid employee object, which will then be matched by the JSON data
var deleteEmployeeByObject = function(data, callback) {
  // Stores all matching data indexcies.
  var match_indicies = [];

  // Check to make sure records are set
  if (!(record.employees !== null && record.hasOwnProperty('Employees')))
    return callback("Error: Please run 'readEmployees' first to set record variable.");

  // If the record contains the required properties, check if it is valid.
  if (!checkEmployeeData(data))
    return callback("Error: Object is not a valid 'employee' object, or contains null values.");

  // Will attempt to match the given data with the records
  // When using by Object, it will delete ALL IDENTITICAL Objects to the one
  // specified.
  for (i = 0; i < record.employees.Employees.length; i++) {
    // Readies data for array.slice(n)
    if (equalObj(data, record.employees.Employees[i])) match_indicies.push(i + 1);
  }

  // Deletes all values matching, this traverses backwards to retain index
  for (var j = match_indicies.length - 1; j >= 0; j--)
    record.employees.Employees.slice(match_indicies[j]);

  if (match_indicies.length > 0) {
    jsonfile.writeFile(prepend + filename[0], record.employees, function (err) {
      if (err !== null) return callback(err);
      else return callback(null);
    });
  }
};

// Pass in a String and delete all employees with that name
// Their hours would be auto removed thanks to being stored in the same object.
var deleteEmployeeByName = function(data, callback) {
  // Stores all matching data indexcies.
  var match_indicies = [];

  // Check to make sure records are set
  if (!(record.employees !== null && record.hasOwnProperty('Employees')))
    return callback("Error: Please run 'readEmployees' first to set record variable.");
  for (i = 0; i < record.employees.Employees.length; i++) {
    if (record.employees.Employees[i].name == data) match_indicies.push(i);
  }

  // Traverse matched indicies backwards to preserve array structure.
  for (n = match_indicies.length - 1; n >= 0; n--) {
    record.employees.Employees.slice(1, n);
  }
};

var deleteMilestoneByObj = function(data, callback) {

};

var deleteMilestoneByDate = function(data, callback) {

};

// Pass in Object to match and delete PTO/OOO
var deleteNIO = function(data, callback) {

};

// Pass type, name, and date
var deleteNIOByData = function(type, name, date, callback) {

};

// Pass object data into delete project.
var deleteProjectByObject = function(data, callback) {

};

// Insert Project # to find and delete project.
var deleteProejctByNum = function(projnum, callback) {

};

var deleteProjectByDescription = function(projdesc, callback) {

};
