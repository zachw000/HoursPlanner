/*jshint esversion: 6 */
/**
*@author Zachary Waldron
*@desc Handles Paid Time Off/Out of Office Time
*
*
**/

var crec = null;
var cpage = "";

var chkStr = (inStr, pos, chr) => {
  if (inStr.charAt(pos) === chr) {
    return inStr.substring(0, pos) + inStr.substring(pos + 1, inStr.length);
  }

  return inStr;
};

var Reverse8601 = (standardDate) => {
  var dt = standardDate;
  if (standardDate.indexOf('T') > -1) {
    dt.split('T');
    dt.pop();
    dt.join('');
  }
  // YYYY-MM-DD -> MM/DD/YYYY
  dt = dt.split('/');
  var date = "";
  date += chkStr(dt[0], 0, '0') + "/" + chkStr(dt[1], 0, '0') + "/" + dt[2];
  return date;
};

var writeLiveRecord = () => {
  for (var i = 0; i < record.nio.notinoffice.length; i++) {
    if (record.nio.notinoffice[i].hasOwnProperty('indicie') || record.nio.notinoffice[i].indicie != "undefined") {
      delete record.nio.notinoffice[i].indicie;
    }
  }
  //console.log(record.nio.notinoffice);
  jsonfile.writeFile(prepend + filenames[2], record.nio, (err) => {
    if (err !== null) console.error(err);
  });
};

// Also grabs the index of the event and stores it in a property called
// indicie
var getRecordByEvent = (eventData) => {
  var dateS = Reverse8601(eventData.start.format('MM/DD/YYYY'));
  // End date shouldn't be needed, it is set to not overlap.
  //var dateE = Reverse8601(eventData.end.format('MM/DD/YYYY'));
  var recs = [];

  for (var i = 0; i < record.nio.notinoffice.length; i++) {
    if (record.nio.notinoffice[i].name == lname) {
      if (record.nio.notinoffice[i].type == cpage) {
        if (record.nio.notinoffice[i].date == dateS) {
          recs.push(record.nio.notinoffice[i]);
          recs[recs.length - 1].indicie = i;
        }
      }
    }
  }

  if (recs.length == 1) return recs[0];
// If more than 1 record was returned, check end dates
  for (var rec = 0; rec < recs.length; i++) {
    var dateE = Reverse8601(eventData.end.format('MM/DD/YYYY'));
    if (recs[rec].dateend == dateE) return recs[rec];
  }

  return null;
};

$(document).ready(function() {
  cpage = currentPage().split(".")[0];
  eventEmitter.on('nio', (callback) => {
    if (record.nio === null) {
      readNIO((err, ret) => {
        if (err !== null) {
          console.error(err);
          alert("An error has occurred reading not in office information.\n" + err);
          return callback(err);
        }

        return callback(null);
      });
    } else if (record.nio !== null) {
      return callback(null);
    }
  });

  // Handle log-in
  /*
  * I require logging in so the system knows
  * who's NIO to set and display
  */
  eventEmitter.on('notLoggedIn', () => {
    alert("You must be logged in to access this page.\n"+
      "You will be redirected.");
    window.location.href = "index.ejs";
  });

  eventEmitter.on('loggedIn', () => {
    // check if records has been set
    eventEmitter.emit('nio', (out) => {
      if (out === null) {
        var recSet = record.nio.notinoffice;
        var events_calendar = [];
        for (var i = 0; i < recSet.length; i++) {
          if (recSet[i].name == lname && recSet[i].type == cpage) {
            events_calendar.push({
              title: recSet[i].name,
              start: ISO86Date(recSet[i].date, recSet[i].time)
            });

            if (recSet[i].hasOwnProperty("dateend")) {
              events_calendar[events_calendar.length - 1].end =
                ISO86Date(recSet[i].dateend, recSet[i].time);
            }
          }
        }
        //console.log(JSON.stringify(events_calendar));
        $('#calendar').fullCalendar({
          header: {
            left: 'prev,next today',
            center: 'title',
            right: ''
          },
          editable: true,
          eventLimit: true,
          eventOverlap: () => {
            return false;
          },
          eventSources: [
            {
              events: events_calendar,
              color: cpage === "pto" ? 'rgba(238, 51, 78, 0.4)' : 'rgba(0, 0, 255, 0.4)',
              textColor: 'rgba(255, 255, 255, 1)'
            }
          ],
          eventResizeStop: function(devent, jsEvent, ui, view) {
            // Reset crec
            crec = null;

            // Load crec
            crec = getRecordByEvent(devent);

            // Debug purposes, to show crec is finding correct string,
            // and appending the index
            //alert(JSON.stringify(crec, null, ' '));
          },
          eventResize: function(devent, jsEvent, ui, view) {
            if (crec !== null)
              record.nio.notinoffice.splice(crec.indicie, 1);
            delete crec.indicie;
            // Get start date
            var dateS = Reverse8601(devent.start.format('MM/DD/YYYY'));
            // Get end date (should be null if 1 day and the same)
            var dateE = null;
            if (devent.end !== null) dateE = Reverse8601(devent.end.format('MM/DD/YYYY'));
            var dateSA = Reverse8601(moment(devent.start, "DD-MM-YYYY").add(1, 'days').format('MM/DD/YYYY'));
            // Get the employee's name
            var name = devent.title;

            if (!confirm("Are you sure you want to move this?")) {
              record.nio.notinoffice.push(crec);
              revertFunc();
            } else {

            record.nio.notinoffice.push({
              "name": name,
              "date": dateS,
              "dateend": dateE,
              "time": crec.time,
              "type": cpage
            });

            if (record.nio.notinoffice[record.nio.notinoffice.length - 1].dateend == null)
              delete record.nio.notinoffice[record.nio.notinoffice.length - 1].dateend;
            }
            if (typeof record.nio.notinoffice[record.nio.notinoffice.length - 1].indicie != 'undefined') {
              delete record.nio.notinoffice[record.nio.notinoffice.length - 1].indicie;
            }

            writeLiveRecord();
          },
          eventDragStop: function(devent, jsEvent, ui, view) {
            // Reset crec
            crec = null;

            // Load crec
            crec = getRecordByEvent(devent);

            // Debug purposes, to show crec is finding correct string,
            // and appending the index
            //alert(JSON.stringify(crec, null, ' '));

          },
          eventDrop: function(devent, jsEvent, ui, view) {
            if (crec !== null)
              record.nio.notinoffice.splice(crec.indicie, 1);
            delete crec.indicie;
            // Get start date
            var dateS = Reverse8601(devent.start.format('MM/DD/YYYY'));
            // Get end date (should be null if 1 day and the same)
            var dateE = null;
            if (devent.end !== null) dateE = Reverse8601(devent.end.format('MM/DD/YYYY'));
            var dateSA = Reverse8601(moment(devent.start, "DD-MM-YYYY").add(1, 'days').format('MM/DD/YYYY'));
            // Get the employee's name
            var name = devent.title;

            if (!confirm("Are you sure you want to move this?")) {
              delete crec.indicie;
              record.nio.notinoffice.push(crec);
              revertFunc();
            } else {

            record.nio.notinoffice.push({
              "name": name,
              "date": dateS,
              "dateend": dateE,
              "time": crec.time,
              "type": cpage
            });

            if (record.nio.notinoffice[record.nio.notinoffice.length - 1].dateend == null)
              delete record.nio.notinoffice[record.nio.notinoffice.length - 1].dateend;
            }
            if (typeof record.nio.notinoffice[record.nio.notinoffice.length - 1].indicie != 'undefined') {
              delete record.nio.notinoffice[record.nio.notinoffice.length - 1].indicie;
            }

            writeLiveRecord();
          }
        });
      } else {
        console.error(out);
        alert("An error has occurred:\n"+out);
      }
    });
  });
});
