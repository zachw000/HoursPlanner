/*jshint esversion: 6 */
/**
*@author Zachary Waldron
*@desc Handles Paid Time Off/Out of Office Time
*
*
**/
eventEmitter.on('checkLogin', (page_t, callback) => {
  if (record.nio === null) {
    readNIO((err, ret) => {
      if (err !== null) {
        console.error(err);
        alert("An error has occurred reading not in office information.\n" + err);
        return callback(err);
      }


    });
  }
});

$(document).ready(function() {
  if (currentPage() === "pto.ejs") {
    // pto.ejs specific functionality
    // check if nio records has been read
    eventEmitter.emit('nio', 'pto', (out) => {

    });
  }
});
