/*jshint esversion: 6 */
/**
*@author Zachary Waldron
*@desc Handles Paid Time Off/Out of Office Time
*
*
**/
var crec = null;

var getRecordByEvent = (eventData) => {

};

$(document).ready(function() {
  eventEmitter.on('nio', (page_t, callback) => {
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
  * who's PTO to set and display
  */
  eventEmitter.on('notLoggedIn', () => {
    alert("You must be logged in to access this page.\n"+
      "You will be redirected.");
    window.location.href = "index.ejs";
  });

  eventEmitter.on('loggedIn', () => {
    // check if records has been set
    eventEmitter.emit('nio', 'pto', (out) => {
      if (out === null) {
        var recSet = record.nio.notinoffice;
        var events_calendar = [];
        for (var i = 0; i < recSet.length; i++) {
          if (recSet[i].name == lname) {
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
        console.log(JSON.stringify(events_calendar));
        $('#calendar').fullCalendar({
          header: {
            left: 'prev,next today',
            center: 'title',
            right: ''
          },
          editable: true,
          eventLimit: true,
          eventOverlap: false,
          eventSources: [
            {
              events: events_calendar,
              color: 'rgba(238, 51, 78, 0.4)',
              textColor: 'rgba(255, 255, 255, 1)'
            }
          ],
          eventResizeStart: function(event, jsEvent, ui, view) {
            // Load crec
            getRecordByEvent(event);
          }
        });
      } else {
        console.error(out);
        alert("An error has occurred:\n"+out);
      }
    });
  });
});
