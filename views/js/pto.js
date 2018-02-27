/*jshint esversion: 6 */
/**
*@author Zachary Waldron
*@desc Handles Paid Time Off/Out of Office Time
*
*
**/

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

  if (currentPage() === "pto.ejs") {
    // pto.ejs specific functionality
    // check if nio records has been read

    eventEmitter.emit('nio', 'pto', (out) => {
      if (out === null) {
        console.log("Successful record set.");
      }
    });
  }
});
