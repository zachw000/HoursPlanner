/*jshint esversion: 6 */
const {session} = require('electron');
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

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
  var ua = window.navigator.userAgent;

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}

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

// This will store the login information for the current user (on the local machine)
var setLoginCookie = function(cookie_inf, callback) {
  if (!(cookie_inf !== null && typeof cookie_inf === 'object'))
    return callback("Data is null or is not of type 'object'.");
  var valid_cookie = true;
  valid_cookie = cookie_inf.hasOwnProperty('url') ? valid_cookie:false;
  valid_cookie = cookie_inf.hasOwnProperty('name') ? valid_cookie:false;
  valid_cookie = cookie_inf.hasOwnProperty('value') ? valid_cookie:false;

  if (!valid_cookie) return callback("Invalid cookie data.");

  // Set the cookie, and display an error if an error occurrs.
  session.defaultSession.cookies.set(cookie_inf, (error) => {
    if (error) console.error(error);
    else return callback(null);
  });
};


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
  $('.nav-rotate').on('click', function() {
          degreesRotated += 180;
          degreesRotated %= 360;
          $(this).find("i").rotate(degreesRotated);
  });

  $('.date-anc').text(dateObj.month + " " + dateObj.day + ", " + dateObj.year);

  var ie = detectIE();

  if (ie <= 10 && ie != false) {
    $("body").html("<h1 class='text-danger'>Sorry, this browser is not supported; please use a newer browser such as Chrome.</h1>");
  }

  if (currentPage() === "index.ejs") {
    // This code will only execute on index.ejs
    readNIO(function(err, ret) {
      if (err !== null) {
        window.alert("" + err);
      } else {
        // If there was no read Error
        var calendar_events = [];
        for (var i = 0; i < ret.notinoffice.length; i++) {
          if (ret.notinoffice[i].type == "pto") {
            calendar_events.push({
              title: ret.notinoffice[i].name,
              start: ret.notinoffice[i].date.split("/")[2] + "-" +
                (ret.notinoffice[i].date.split("/")[1] < 10 ? "0" + ret.notinoffice[i].date.split("/")[1]:ret.notinoffice[i].date.split("/")[1]) + "-" +
                (ret.notinoffice[i].date.split("/")[0] < 10 ? "0" + ret.notinoffice[i].date.split("/")[0]:ret.notinoffice[i].date.split("/")[0]),
              end: ret.notinoffice[i].date.split("/")[2] + "-" +
                (ret.notinoffice[i].date.split("/")[1] < 10 ? "0" + ret.notinoffice[i].date.split("/")[1]:ret.notinoffice[i].date.split("/")[1]) + "-" +
                (ret.notinoffice[i].date.split("/")[0] < 10 ? "0" + ret.notinoffice[i].date.split("/")[0]:ret.notinoffice[i].date.split("/")[0])
            });
          }
        }
        // Debug
        // console.log(JSON.stringify(calendar_events));
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
          data_out += "<option>" + ret.Employees[i].name + "</option>";
        }

        $("#nameList").html(data_out);
      }
    });
  }
});
