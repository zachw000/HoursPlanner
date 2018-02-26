/*jshint esversion: 6 */
const session = require('electron').remote.session;
var ses = session.fromPartition('persist:name');
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

function setScroll() {
        window.scrollBy({
                top: 100, // could be negative value
                left: 0,
                behavior: 'smooth'
        });

        // Scroll to a certain element
        document.querySelector('.hello').scrollIntoView({
                behavior: 'smooth'
        });
}

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
    console.eror(error);
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

var AnsiDate = (mmddyyy) => {};


var d = new Date();
var degreesRotated = 0;

var dateObj = {
        "day": d.getDate(),
        "month": stringMonth(d.getMonth()),
        "year": d.getFullYear()
};

var currentPage = function() {
  return window.location.pathname.split('/')[window.location.pathname.split('/').length - 1];
};

jQuery.fn.rotate = function(degrees) {
    $(this).css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 'transform' : 'rotate('+ degrees +'deg)'});
    return $(this);
};

$(document).ready(function () {
  loggedIn((err, li, name) => {
    if (err !== null) {
      console.error(err);
    } else if (li) {
      document.title = "Hours Planner - Welcome " + name;
    }
  });

  $('.nav-rotate').on('click', function() {
          degreesRotated += 180;
          degreesRotated %= 360;
          $(this).find("i").rotate(degreesRotated);
  });

  $('.date-anc').text(dateObj.month + " " + dateObj.day + ", " + dateObj.year);

  if (currentPage() === "index.ejs") {
    // This code will only execute on index.ejs
    readMilestones((err, ret) => {

    });
    readNIO(function(err, ret) {
      if (err !== null) {
        window.alert("" + err);
      } else {
        // If there was no read Error
        var calendar_events_pto = [];
        var calendar_events_ooo = [];
        for (var i = 0; i < ret.notinoffice.length; i++) {
          // Stored as MM/DD/YYYY, Need YYYY-MM-DD
          // Re-arrange dates to ISO 8601 format
          if (ret.notinoffice[i].type == "pto" && !ret.notinoffice[i].hasOwnProperty("dateend")) {
            calendar_events_pto.push({
              title: ret.notinoffice[i].name,
              start: ret.notinoffice[i].date.split("/")[2] + "-" +
                (ret.notinoffice[i].date.split("/")[0] < 10 ? "0" + ret.notinoffice[i].date.split("/")[0]:ret.notinoffice[i].date.split("/")[0]) + "-" +
                (ret.notinoffice[i].date.split("/")[1] < 10 ? "0" + ret.notinoffice[i].date.split("/")[1]:ret.notinoffice[i].date.split("/")[1])
            });
            //console.log(calendar_events_pto[calendar_events_pto.length - 1]);
          } else if (ret.notinoffice[i].type == "pto" && ret.notinoffice[i].hasOwnProperty("dateend")) {
            calendar_events_pto.push({
              title: ret.notinoffice[i].name,
              start: ret.notinoffice[i].date.split("/")[2] + "-" +
                (ret.notinoffice[i].date.split("/")[0] < 10 ? "0" + ret.notinoffice[i].date.split("/")[0]:ret.notinoffice[i].date.split("/")[0]) + "-" +
                (ret.notinoffice[i].date.split("/")[1] < 10 ? "0" + ret.notinoffice[i].date.split("/")[1]:ret.notinoffice[i].date.split("/")[1]),
              end: ret.notinoffice[i].dateend.split("/")[2] + "-" +
                (ret.notinoffice[i].dateend.split("/")[0] < 10 ? "0" + ret.notinoffice[i].dateend.split("/")[0]:ret.notinoffice[i].dateend.split("/")[0]) + "-" +
                (ret.notinoffice[i].dateend.split("/")[1] < 10 ? "0" + ret.notinoffice[i].dateend.split("/")[1]:ret.notinoffice[i].dateend.split("/")[1])
            });
          } else if (ret.notinoffice[i].type == "ooo" && !ret.notinoffice[i].hasOwnProperty("dateend")) {
            calendar_events_ooo.push({
              title: ret.notinoffice[i].name,
              start: ret.notinoffice[i].date.split("/")[2] + "-" +
                (ret.notinoffice[i].date.split("/")[0] < 10 ? "0" + ret.notinoffice[i].date.split("/")[0]:ret.notinoffice[i].date.split("/")[0]) + "-" +
                (ret.notinoffice[i].date.split("/")[1] < 10 ? "0" + ret.notinoffice[i].date.split("/")[1]:ret.notinoffice[i].date.split("/")[1])
            });
            //console.log(calendar_events_ooo[calendar_events_ooo.length - 1]);
          } else if (ret.notinoffice[i].type == "ooo" && ret.notinoffice[i].hasOwnProperty("dateend")) {
            calendar_events_ooo.push({
              title: ret.notinoffice[i].name,
              start: ret.notinoffice[i].date.split("/")[2] + "-" +
                (ret.notinoffice[i].date.split("/")[0] < 10 ? "0" + ret.notinoffice[i].date.split("/")[0]:ret.notinoffice[i].date.split("/")[0]) + "-" +
                (ret.notinoffice[i].date.split("/")[1] < 10 ? "0" + ret.notinoffice[i].date.split("/")[1]:ret.notinoffice[i].date.split("/")[1]),
              end: ret.notinoffice[i].dateend.split("/")[2] + "-" +
                (ret.notinoffice[i].dateend.split("/")[0] < 10 ? "0" + ret.notinoffice[i].dateend.split("/")[0]:ret.notinoffice[i].dateend.split("/")[0]) + "-" +
                (ret.notinoffice[i].dateend.split("/")[1] < 10 ? "0" + ret.notinoffice[i].dateend.split("/")[1]:ret.notinoffice[i].dateend.split("/")[1])
            });
          }
        }
        $('#calendar').fullCalendar({
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
            }
          ]
        });
      }
    });
  }

  // If current page is the login page
  if (currentPage() === "login.ejs") {
    readEmployees(function (err, ret) {
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
  $("#login").on('click', function() {
    // Make sure this is the correct page
    if (currentPage() === "login.ejs") {
      // Debug: Popup window with selected name
      alert($("#nameList").val());
      var name = "name";
      var value = $("#nameList").val();

      setLoginCookie({
        url: "http://127.0.0.1",
        name: name,
        value: value
      }, function (err) {
        if (err !== null) alert("An error has occurred.\n" + err);
      });
    }
  });
});
