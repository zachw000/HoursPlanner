/**
 *@author Zachary Waldron
 *@desc Handles Paid Time Off/Out of Office Time
 *
 *
 **/
 
 // Currently selected record, put in file's private scope
 // this prevents other sessions from interfering with one of another.
 let c_rec = null;
 
 // Project recordset
 let p_set = null;
 
 // Current version of the recordset
 let r_set = null;

/**
* removeZeroes
* @param dStr : <T>string input date
* @return date in valid ANSI format
* Takes the input datetime string, and attempts to
* convert the string to a moment object.
**/
var removeZeroes = (dStr) => {
	// Use moment to make sure this is a valid date.
	var d_m = moment(dStr);
	
	if (!d_m.isValid()) return dStr;	// Invalid input
	
	// Array with separate MM-DD-YYYY parts
	var d = d_m.format("MM/DD/YYYY").split("/");
	
	// Pop '0' from byte pointer
	if (d.length > 1) {
		if (d[0].charAt(0) == '0')
			d[0] = d[0].slice(1);
		if (d[1].charAt(0) == '0')
			d[1] = d[1].slice(1);
	}
	
	// Join array and return
	return d.join('/');
};

/**
* Reverse8601
* @param standardDate : <T>string|<t>moment
* @return Returns the date in ANSI format
* This method takes the input as either ISO-8601
* formatted string, or it can use a Moment.JS object
* to determine the needed datetime output.
**/
var Reverse8601 = (standardDate) => {
	var d_m;
	var d;
	
	if (!moment.isMoment(standardDate)) {
		// If the input was NOT a moment object.
		d_m = moment(standardDate);
	} else {
		// No need to convert to Moment
		d_m = standardDate;
	}
	
	if (d_m.isValid()) {
		d = removeZeroes(d_m.format('MM/DD/YYYY'));
		return d;
	} else {
		// An error has occurred, returns null to remain
		// TSC compliant.
		return null;
	}
};

/**
* writeLiveRecord
* @return null
* Pushes the entire array record to the JSON file.
**/
var writeLiveRecord = () => {
	// Make sure the recordset is NOT null, do nothing otherwise
	if (!record.milestones.milestones == null) {
		for (var i = 0; i < record.milestones.milestones.length; i++)
			if (record.milestones.milestones[i].hasOwnProperty('indicie') || typeof record.milestones.milestones[i].indicie != "undefined")
				delete record.milestones.milestones[i].indicie;
		jsonfile.writeFile(prepend + filenames[1], record.milestones, (err) => {
			if (err !== null) console.error(err);
		});
	}
};

/**
* getRecordByEvent
* @param eventData : <T>object
* @return null
* Grabs the event data from the available recordset.
* Useful for associating events with JSON entry.
* Returns null if no error is reported.
*/
var getRecordByEvent = (eventData) => {
	// Use the Event ID (A.K.A. Index)
	c_rec = null;
	c_rec = record.milestones.milestones[eventData.id];
	c_rec.indicie = eventData.id;
	
	return null;
};

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

$(document).ready(function() {
	
	// Make sure milestone recordset is set
	eventEmitter.on('milestones', (callback) => {
		if (record.milestones === null) {
			readMilestones((err, ret) => {
				if (err !== null) {
					console.error(err);
					
					// Pass error to callback function
					return callback(err);
				}
				
				readProjects((err, ret) => {
					if (err !== null) {
						console.error(err);
						
						return callback (err);
					}
					
					return callback(null);
				});				
			});
		} else {
			return callback(null);
		}
	});
	
	// Handle log-in
	eventEmitter.on('notLoggedIn', () => {
		$("#nlo-modal").modal();
	});
	
	// Not log in close
	$("#nlo-modal").on("hidden.bs.modal", () => {
		window.location.href = "login.ejs";
	});
	
	eventEmitter.on('delMilestone', () => {
		// do not do anything if c_rec is not loaded
		if (c_rec == null) return;
	});
	
	// Use standard function for a local reference to 'this'
	$("[id^=datepicker]").on("change", function () {
		var dt = "";
		// Scope aware variable
		let m = moment($(this).val());
		
		if (!m.isValid()) {
			dt = removeZeroes(moment().format('MM/DD/YYYY'));
		} else {
			dt = removeZeroes(m.format('MM/DD/YYYY'));
		}
		
		$(this).val(dt);
	});
	
	// TODO: Implement save milestone
	$("#savemilestone").on('click', () => {
		
	});
	
	eventEmitter.on('loggedIn', () => {
		// Initialize milestone page
		eventEmitter.emit('milestones', (out) => {
			if (out === null) {
				r_set = record.milestones.milestones;
				p_set = record.projects.projects;
				var events_calendar = [];
				
				for (var i = 0; i < r_set.length; i++)
					events_calendar.push({
						title: r_set[i].projnum + " - " + r_set[i].type,
						start: ISO86Date(r_set[i].date, "8hr") + "T17:00:00",
						end: ISO86Date(r_set[i].date, "8hr") + "T17:00:00",
						id: i
					});
				$("#calendar").fullCalendar({
					themeSystem: 'bootstrap4',
					customButtons: {
						AddNew: {
							text: "Add New Milestone",
							click: function() {
								$("#addnew-modal").modal();
								$("#addnew-title").html("<i class='fa fa-file'></i> Add New Milestone");
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
					eventOverlap: true,
					eventSources: [
						{
							events: events_calendar,
							color: 'rgba(139, 195, 74, 0.4)',
							textColor: 'rgba(26, 26, 26, 1)'
						}
					],
					eventRender: function (eventObj, $el) {
						var p_name = getProjectByNum(r_set[eventObj.id].projnum).projname;
						$el.popover({
							html: true,
							title: "Milestone",
							content: "PM: " + r_set[eventObj.id].name + "<br />Type: <strong>" +
							r_set[eventObj.id].type + "</strong><br />Project #: " + r_set[eventObj.id].projnum +
							"<br /> Project: " + p_name,
							trigger: 'hover',
							placement: 'top',
							container: 'body'
						});
					}
				});
			} else {
				alert("An error has occurred at emit(\"milestones\"), please contact application maintainer.");
			}
		});
	});
});