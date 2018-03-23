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

var removeZeroes = (dStr) => {
    var d = dStr.split("/");
    if (d.length > 1) {
        if (d[0].charAt(0) == '0')
            d[0] = d[0].slice(1);
        if (d[1].charAt(0) == '0')
            d[1] = d[1].slice(1);
    }

    return d.join('/');
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
// writes the data to the record.
var writeLiveRecord = () => {
    // removes instances of buggy "indicie" properties.
    for (var i = 0; i < record.milestones.milestones.length; i++) {
        if (record.milestones.milestones[i].hasOwnProperty('indicie') || record.milestones.milestones[i].indicie != "undefined") {
            delete record.milestones.milestones[i].indicie;
        }
    }
    //console.log(record.milestones.milestones);
    jsonfile.writeFile(prepend + filenames[2], record.milestones, (err) => {
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

    for (var i = 0; i < record.milestones.milestones.length; i++) {
        if (record.milestones.milestones[i].name == lname) {
            if (record.milestones.milestones[i].type == cpage) {
                if (record.milestones.milestones[i].date == dateS) {
                    recs.push(record.milestones.milestones[i]);
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

$(document).ready(function () {
    cpage = currentPage().split(".")[0];
    eventEmitter.on('milestones', (callback) => {
        if (record.milestones === null) {
            readMilestones((err, ret) => {
                if (err !== null) {
                    console.error(err);
                    alert("An error has occurred reading not in office information.\n" + err);
                    return callback(err);
                }

                return callback(null);
            });
        } else if (record.milestones !== null) {
            return callback(null);
        }
    });
    // Handle log-in
    /*
     * I require logging in so the system knows
     * who's Milestones to set and display
     */
    eventEmitter.on('notLoggedIn', () => {
        alert("You must be logged in to access this page.\n" +
            "You will be redirected.");
        window.location.href = "index.ejs";
    });

    eventEmitter.on('delMilestones', () => {
        // crec should be loaded.
        //alert(JSON.stringify(crec, null, ' '));
        var confirmDelete = confirm("Are you sure you want to delete the milestone?");
        if (confirmDelete) {
            $("#calendar").fullCalendar('removeEvents', (eFilter) => {
                //console.log("Running Filter");
                //console.log(eFilter);
                //console.log(removeZeroes(eFilter.start.format("MM/DD/YYYY")));
                if (eFilter.title == crec.type && removeZeroes(eFilter.start.format("MM/DD/YYYY")) == crec.date) {
                    return true;
                }

                return false;
            });

            // Hide popup
            $("#events-modal").modal('hide');
            record.milestones.milestones.splice(crec.indicie, 1);
            writeLiveRecord();
        }
    });

    $("#datepicker").on("change", function () {
        var m = moment($(this).val());
        if (!m.isValid()) {
            var dt = new Date();
            var y = dt.getFullYear();
            var mm = dt.getMonth() + 1;
            var dd = dt.getDate();
            $(this).val(mm + "/" + dd + "/" + y);
        } else {
            var d = $(this).val();
            // remove extra 0s, for database format
            d = d.split('/');
            if (d.length > 1) {
                if (d[0].charAt(0) == '0') {
                    d[0] = d[0].slice(1);
                }
                if (d[1].charAt(0) == '0') {
                    d[1] = d[1].slice(1);
                }

                $(this).val(d.join('/'));
            }
        }
    });

    $("#datepicker2").on('change', function () {
        var m = moment($(this).val());
        if (!m.isValid()) {
            var dt = new Date();
            var y = dt.getFullYear();
            var mm = dt.getMonth() + 1;
            var dd = dt.getDate();
            $(this).val(mm + "/" + dd + "/" + y);
        } else {
            var d = $(this).val();
            // remove extra 0s, for database format
            d = d.split('/');
            if (d.length > 1) {
                if (d[0].charAt(0) == '0') {
                    d[0] = d[0].slice(1);
                }
                if (d[1].charAt(0) == '0') {
                    d[1] = d[1].slice(1);
                }

                $(this).val(d.join('/'));
            }
        }
    });

    $("#savemilestones").on('click', () => {
        // remove event
        $("#calendar").fullCalendar('removeEvents', (eFilter) => {
            if (eFilter.title == lname && removeZeroes(eFilter.start.format("MM/DD/YYYY")) == crec.date) return true;
            return false;
        });

        // remove old event from object
        //console.log(record.milestones.milestones);
        //alert(crec.indicie);
        record.milestones.milestones.splice(crec.indicie, 1);

        //console.log(record.milestones.milestones);
        // render event
        var jEvent = {};
        jEvent.name = lname;
        jEvent.date = $("#datepicker3").val();
        jEvent.type = cpage.toLowerCase();
        var nEvent = {
            title: lname,
            start: ISO86Date($("#datepicker2").val(), "8hr"),
            color: 'rgba(139, 195, 74, 0.4)',
            textColor: 'rgba(26, 26, 26, 1)'
        };
        //console.log(jEvent);
        $("#calendar").fullCalendar('renderEvent', nEvent);
        // add to json
        record.milestones.milestones.push(jEvent);
        // write
        writeLiveRecord();
        $("#events-modal").modal('hide');
    });

    $("#addmilestones").on('click', () => {
        var startdate = $("#datepicker").val();
        var m_enddate = moment($("#datepicker2").val());
        var enddate = m_enddate.add(1, 'days').format('MM/DD/YYYY');
        // Remove beginning 0s
        var d = enddate.split('/');
        if (d.length > 1) {
            if (d[0].charAt(0) == '0') {
                d[0] = d[0].slice(1);
            }
            if (d[1].charAt(0) == '0') {
                d[1] = d[1].slice(1);
            }
        }

        enddate = d.join('/');
        var multiday = document.getElementById('isMultiDay').checked;
        var timeoffam = document.getElementById('timeOffAm').checked;
        var timeoffpm = document.getElementById('timeOffPm').checked;
        var timeoffallday = document.getElementById('timeOffFullDay').checked;
        var times = ["4am", "4pm", "8hr"];
        var tget = 0;
        if (timeoffpm) tget = 1;
        if (timeoffallday) tget = 2;
        // Use renderEvent to display new event on screen
        // Add event to the record.milestones.milestones array
        // Use writeLiveRecord() funciton to write new data
        // Hide modal dialog

        var nEvent = {};
        var nAppend = {};
        nEvent.start = ISO86Date(startdate, times[tget]);
        nEvent.title = lname;
        nEvent.color = cpage === "pto" ? 'rgba(238, 51, 78, 0.4)' : 'rgba(0, 0, 255, 0.4)';
        nEvent.textColor = 'rgba(255, 255, 255, 1)';
        if (multiday) {
            nEvent.end = ISO86Date(enddate, times[tget]);
        }
        $("#calendar").fullCalendar('renderEvent', nEvent);
        $("#addnew-modal").modal('hide');
        // Create nAppend
        nAppend.name = lname;
        nAppend.date = startdate;
        nAppend.time = times[tget];
        nAppend.type = cpage;
        if (multiday) nAppend.dateend = enddate;
        record.milestones.milestones.push(nAppend);
        writeLiveRecord();
    });

    eventEmitter.on('loggedIn', () => {
        // check if records has been set
        eventEmitter.emit('milestones', (out) => {
            if (out === null) {
                var recSet = record.milestones.milestones;
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
                    themeSystem: 'bootstrap4',
                    customButtons: {
                        AddNew: {
                            text: "Add New " + cpage.toUpperCase(),
                            click: function () {
                                $("#addnew-modal").modal();
                                $("#addnew-title").html("<i class='fa fa-file'></i> Add New " + cpage.toUpperCase());
                            }
                        }
                    },
                    header: {
                        left: 'prev today AddNew',
                        center: 'title',
                        right: 'next'
                    },
                    editable: true,
                    eventLimit: true,
                    weekNumbers: true,
                    eventOverlap: false,
                    eventSources: [{
                        events: events_calendar,
                        color: cpage === "pto" ? 'rgba(238, 51, 78, 0.4)' : 'rgba(0, 0, 255, 0.4)',
                        textColor: 'rgba(255, 255, 255, 1)'
                    }],
                    eventRender: function (eventObj, $el) {
                        $el.popover({
                            title: eventObj.title,
                            content: cpage.toUpperCase() + " for " + lname,
                            trigger: 'hover',
                            placement: 'top',
                            container: 'body'
                        });
                    },
                    eventResizeStop: function (devent, jsEvent, ui, view) {
                        // Reset crec
                        crec = null;

                        // Load crec
                        crec = getRecordByEvent(devent);

                        // Debug purposes, to show crec is finding correct string,
                        // and appending the index
                        //alert(JSON.stringify(crec, null, ' '));
                    },
                    eventResize: function (devent, delta, revertFunc) {
                        if (crec !== null)
                            record.milestones.milestones.splice(crec.indicie, 1);
                        delete crec.indicie;
                        // Get start date
                        var dateS = Reverse8601(devent.start.format('MM/DD/YYYY'));
                        // Get end date (should be null if 1 day and the same)
                        var dateE = null;
                        if (devent.end !== null) dateE = Reverse8601(devent.end.format('MM/DD/YYYY'));
                        var dateSA = Reverse8601(moment(devent.start, "DD-MM-YYYY").add(1, 'days').format('MM/DD/YYYY'));
                        // Get the employee's name
                        var name = devent.title;

                        if (!confirm("Are you sure you want to resize this?")) {
                            record.milestones.milestones.push(crec);
                            revertFunc();
                        } else {

                            record.milestones.milestones.push({
                                "name": name,
                                "date": dateS,
                                "dateend": dateE,
                                "time": crec.time,
                                "type": cpage
                            });

                            if (record.milestones.milestones[record.milestones.milestones.length - 1].dateend == null)
                                delete record.milestones.milestones[record.milestones.milestones.length - 1].dateend;
                        }
                        if (typeof record.milestones.milestones[record.milestones.milestones.length - 1].indicie != 'undefined') {
                            delete record.milestones.milestones[record.milestones.milestones.length - 1].indicie;
                        }

                        writeLiveRecord();
                    },
                    eventDragStop: function (devent, jsEvent, ui, view) {
                        // Reset crec
                        crec = null;

                        // Load crec
                        crec = getRecordByEvent(devent);
                    },
                    eventDrop: function (devent, delta, revertFunc, jsEvent, ui, view) {
                        if (crec !== null)
                            record.milestones.milestones.splice(crec.indicie, 1);
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
                            record.milestones.milestones.push(crec);
                            revertFunc();
                        } else {
                            // Push new data onto the array
                            record.milestones.milestones.push({
                                "name": name,
                                "date": dateS,
                                "dateend": dateE,
                                "time": crec.time,
                                "type": cpage
                            });

                            if (record.milestones.milestones[record.milestones.milestones.length - 1].dateend == null)
                                delete record.milestones.milestones[record.milestones.milestones.length - 1].dateend;
                        }
                        if (typeof record.milestones.milestones[record.milestones.milestones.length - 1].indicie != 'undefined') {
                            delete record.milestones.milestones[record.milestones.milestones.length - 1].indicie;
                        }

                        writeLiveRecord();
                    },
                    eventClick: function (devent, jsEvent, view) {
                        // Reset crec
                        crec = null;

                        // Load crec
                        crec = getRecordByEvent(devent);
                        $("#datepicker2").val(crec.date);
                        // default to unchecked
                        
                        // When an event is clicked execute this function.
                        $('#events-modal').modal({});
                    }
                });
            } else {
                console.error(out);
                alert("An error has occurred:\n" + out);
            }
        });
    });
});