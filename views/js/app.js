/*jshint esversion: 6 */
const session = require('electron').remote.session;
var ses = session.fromPartition('persist:name');
var login = false;
var lname = "";
// Create Rotation upon document load
// Converts the month number to a readable string
var stringMonth = function(monthInteger) {
        switch (monthInteger) {
                case 0:
                        return "January";
                case 1:
                        return "February";
                case 2:
                        return "March";
                case 3:
                        return "April";
                case 4:
                        return "May";
                case 5:
                        return "June";
                case 6:
                        return "July";
                case 7:
                        return "August";
                case 8:
                        return "September";
                case 9:
                        return "October";
                case 10:
                        return "November";
                case 11:
                        return "December";
                default:
                        return monthInteger;
        }
};

var getCookie = (cname, callback) => {
  var value = {name: cname};
  ses.cookies.get(value, (error, cookies) => {
    return callback(error, cookies);
  });
};

// Store the login information for the current user (on the local machine)
var setLoginCookie = (cookie_inf, callback) => {
  if (!(cookie_inf !== null && typeof cookie_inf === 'object'))
    return callback("Data is null or is not of type 'object'.");
  var valid_cookie = true;
  valid_cookie = cookie_inf.hasOwnProperty('url') ? valid_cookie:false;
  valid_cookie = cookie_inf.hasOwnProperty('name') ? valid_cookie:false;
  valid_cookie = cookie_inf.hasOwnProperty('value') ? valid_cookie:false;

  if (!valid_cookie) return callback("Invalid cookie data.");

  // Set the cookie, and display an error if an error occurrs.
  ses.cookies.set(cookie_inf, (error) => {
    if (error !== null) console.log(error);
    else {
      lname = cookie_inf.value;
      login = true;
      eventEmitter.emit('loggedIn');
      // Open loading page for testing
      window.location.href = "loading.ejs";
    }
  });
};

var loggedIn = (callback) => {
  getCookie("name", (error, cookies) => {
    if (error !== null || cookies[0] === undefined) {
      if (error !== null)
        return callback(null, false, null);
      else
        return callback(error, false, null);
    }

    if (cookies[0] !== undefined && cookies[0].hasOwnProperty('value')) {
      // Return true with the name
      return callback(null, true, cookies[0].value);
    }
  });
};

var ISO86Date = (mmddyyy, t) => {
  // Stored as MM/DD/YYYY, Need YYYY-MM-DD
  var parts = mmddyyy.split('/');
  parts = parts[2] + "-" + (parts[0] < 10 ? "0" + parts[0]:parts[0]) + "-" +
    (parts[1] < 10 ? "0" + parts[1]:parts[1]);
  if (t != '8hr') {
    if (t == '4am') {
      parts += "T09:00:00";
    } else if (t == '4pm') {
      parts += "T13:00:00";
    }
  }
  return parts;
};

var checkManager = (records) => {
  var pmanager = false;
  for (var i = 0; i < records.Employees.length; i++) {
    if (records.Employees[i].name == lname) {
      pmanager = records.Employees[i].projectmanager;
      break;
    }
  }

  return pmanager;
};

var totalHours = (hours) => {
  var th = 0;
  for (var i = 0; i < hours.length; i++)
    th += hours[i].time;
  return th;
};


var d = new Date();

var dateObj = {
        "day": d.getDate(),
        "month": stringMonth(d.getMonth()),
        "year": d.getFullYear()
};

var currentPage = function() {
  return window.location.pathname.split('/')[window.location.pathname.split('/').length - 1];
};

// Arrow function version, NO REFERENCE TO THIS
$(document).ready(() => {
  eventEmitter.on('loggedIn', () => {
    // Executed when log in is confirmed
    document.title = "Hours Planner - Welcome " + lname;
    $(".login-link").text("Switch User");
    $(".loginName").html("<strong>"+lname+"</strong>");
    if (currentPage() === 'login.ejs') $("#login").text("Switch User");
  });
});

$(document).ready(function () {
  loggedIn((err, li, name) => {
    if (err !== null) {
      console.error(err);
    } else if (li) {
      lname = name;
      login = true;
      eventEmitter.emit('loggedIn');
    } else {
      eventEmitter.emit('notLoggedIn');
    }
  });

  $('.date-anc').text(dateObj.month + " " + dateObj.day + ", " + dateObj.year);

  if (currentPage() === "index.ejs") {
    // This code will only execute on index.ejs
    readNIO((err, ret) => {
      if (err !== null) {
        console.error(err);
        return;
      }
      var calendar_events_pto = [];
      var calendar_events_ooo = [];

      for (var i = 0; i < ret.notinoffice.length; i++) {
        if (ret.notinoffice[i].type == "pto" &&
          !ret.notinoffice[i].hasOwnProperty("dateend")) {
          calendar_events_pto.push({
            title: ret.notinoffice[i].name,
            start: ISO86Date(ret.notinoffice[i].date, ret.notinoffice[i].time)
          });
        } else if (ret.notinoffice[i].type == "pto" &&
          ret.notinoffice[i].hasOwnProperty("dateend")) {
          calendar_events_pto.push({
            title: ret.notinoffice[i].name,
            start: ISO86Date(ret.notinoffice[i].date, ret.notinoffice[i].time),
            end: ISO86Date(ret.notinoffice[i].dateend, ret.notinoffice[i].time)
          });
        } else if (ret.notinoffice[i].type == "ooo" &&
          !ret.notinoffice[i].hasOwnProperty("dateend")) {
          calendar_events_ooo.push({
            title: ret.notinoffice[i].name,
            start: ISO86Date(ret.notinoffice[i].date, ret.notinoffice[i].time)
          });
          //console.log(calendar_events_ooo[calendar_events_ooo.length - 1]);
        } else if (ret.notinoffice[i].type == "ooo" &&
          ret.notinoffice[i].hasOwnProperty("dateend")) {
          calendar_events_ooo.push({
            title: ret.notinoffice[i].name,
            start: ISO86Date(ret.notinoffice[i].date, ret.notinoffice[i].time),
            end: ISO86Date(ret.notinoffice[i].dateend, ret.notinoffice[i].time)
          });
        }
      }

      readMilestones((err, ret) => {
        var milestones_events = [];
        if (err !== null) {
          console.error(err);
          return;
        }
        // record.milestones is an array stored in RAM
        readProjects((error, proj) => {
          for (var i = 0; i < ret.milestones.length; i++) {
            for (var j = 0; j < proj.projects.length; j++) {
              if (ret.milestones[i].projnum == proj.projects[j].projnum) {
                milestones_events.push({
                  title: proj.projects[j].projname,
                  start: ISO86Date(ret.milestones[i].date, ret.milestones[i].time)
                });
                continue;
              }
            }
          }
          $('#calendar').fullCalendar({
            header: {
              left: 'prev,next today',
              center: 'title',
              right: ''
            },
            eventLimit: true,
            eventSources: [
              {
                events: calendar_events_pto,
                color: 'rgba(238, 51, 78, 0.4)',
                textColor: 'rgba(255, 255, 255, 1)'
              },
              {
                events: calendar_events_ooo,
                color: 'rgba(0, 0, 255, 0.4)',
                textColor: 'rgba(255, 255, 255, 1)'
              },
              {
                events: milestones_events,
                color: 'rgba(139, 195, 74, 0.4)',
                textColor: 'rgba(26, 26, 26, 1)'
              }
            ]
          });
        });
      });
    });
  }

  // If current page is the login page
  if (currentPage() === "login.ejs") {
    readEmployees((err, ret) => {
      if (err !== null) {
        window.alert("" + err);
      } else {
        // Debug only
        //window.alert("No error.");
        var data_out = "";

        for (i = 0; i < ret.Employees.length; i++) {
          data_out += "<option value=\"" + ret.Employees[i].name + "\">" + ret.Employees[i].name + "</option>";
        }
        $("#nameList").html(data_out);
      }
    });
  }
  // What happens when the login button is clicked
  $("#login").on('click', () => {
    // Set value before async func to prevent null
    var name = "name";
    var value = $("#nameList").val();
    // Make sure this is the correct page
    if (currentPage() === "login.ejs") {
      // Debug: Popup window with selected name
      setLoginCookie({
        url: "http://127.0.0.1",
        name: name,
        value: value
      }, (err) => {
        if (err !== null) alert("An error has occurred.\n" + err);
      });
    }
  });
});
