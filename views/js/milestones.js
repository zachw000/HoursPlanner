/**
 *@author Zachary Waldron
 *@desc Handles Milestones
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
	if (!(record.milestones.milestones == null)) {
		// console.log("WRITING")
		for (var i = 0; i < record.milestones.milestones.length; i++) delete record.milestones.milestones[i].indicie;
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
	c_rec = record.milestones.milestones[getIndex(eventData)];
	c_rec.indicie = getIndex(eventData);
	
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

var getIndex = (eventObj) => {
	var proj_arr = eventObj.title.split(" #");

	// Returns last object of array
	var p_num = proj_arr.pop();

	var p_name = getProjectByNum(p_num).projname;

	var s_date = removeZeroes(eventObj.start.format("MM/DD/YYYY"));

	var pid = eventObj.id.split("///").pop();

	//console.log(p_name + "\n" + p_num + "\n" + s_date + "\n" + pid);

	var i;

	for (i = 0; i < r_set.length; i++) {
		if (r_set[i].projnum == p_num) {
			if (getProjectByNum(r_set[i].projnum).projname == p_name) {
				if (r_set[i].type == pid) {
					//console.log("all but date matched")
					if (r_set[i].date == s_date) {
						//console.log("all matched.")
						break;
					}
				}
			}
		}
	}
	return i;
};

var getIndexNoDate = (eventObj) => {
	var proj_arr = eventObj.title.split(" #");

	// Returns last object of array
	var p_num = proj_arr.pop();

	var p_name = getProjectByNum(p_num).projname;

	var pid = eventObj.id.split("///").pop();

	//console.log(p_name + "\n" + p_num + "\n" + "\n" + pid);

	var i;

	for (i = 0; i < r_set.length; i++) {
		if (r_set[i].projnum == p_num) {
			if (getProjectByNum(r_set[i].projnum).projname == p_name) {
				if (r_set[i].type == pid) {
						break;
				}
			}
		}
	}
	return i;
};

var allFilled = ($fields) => {
	return $fields.filter(function () {
		if (this.value === '') {
			$(this).addClass('bg-danger');
		} else {
			$(this).removeClass('bg-danger');
		}
		return this.value === '';
	}).length == 0;
}

$(document).ready(function() {

	async function loadEmployeeList() {
		readEmployees((err, ret) => {
			if (err !== null) { 
				console.error(err);
				return;
			}

			record.employees.Employees.forEach((element) => {
				$(`#pmchooser.custom-select`).append(
					`<option value="${element.name}">${element.name}`+
					`</option>`)
			});

			record.employees.Employees.forEach((element) => {
				$(`#pmchooser2.custom-select`).append(
					`<option value="${element.name}">${element.name}`+
					`</option>`)
			});

			var options = $('#pmchooser.custom-select option');
			var arr = options.map(function(_, o) { 
				return { 
					t: $(o).text(), 
					v: o.value 
				}; 
			}).get();
			arr.sort(function(o1, o2) { 
				return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; 
			});
			options.each(function(i, o) {
				o.value = arr[i].v;
				$(o).text(arr[i].t);
			});

			options = $('#pmchooser2.custom-select option');
			arr = options.map(function(_, o) { 
				return { 
					t: $(o).text(), 
					v: o.value 
				}; 
			}).get();
			arr.sort(function(o1, o2) { 
				return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; 
			});
			options.each(function(i, o) {
				o.value = arr[i].v;
				$(o).text(arr[i].t);
			});
		});
	}
	
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
					record.projects.projects.forEach(element => {
						$("#projnum.custom-select")
							.append(
							`<option value="${element.projnum}">${element.projnum}`+ 
							`- ${element.projname}</option>`);
					});

					var options = $('select#projnum option');
					var arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value }; }).get();
					arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
					options.each(function(i, o) {
					o.value = arr[i].v;
					$(o).text(arr[i].t);
					});

					record.projects.projects.forEach(element => {
						$("#projnum2.custom-select")
							.append(
							`<option value="${element.projnum}">${element.projnum}- ${element.projname}</option>`);
					});

					options = $('select#projnum2 option');
					arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value }; }).get();
					arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
					options.each(function(i, o) {
					o.value = arr[i].v;
					$(o).text(arr[i].t);
					});

					loadEmployeeList();
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

		if (confirm("Are you sure you want to delete this milestone")) {
			// Remove event from calendar
			$("#calendar").fullCalendar('removeEvents', (devent) => {
				var pn = c_rec.projnum;
				var pd = c_rec.date;
				var type = c_rec.type;
				var pname = getProjectByNum(c_rec.projnum).projname;

				var d_title_arr = devent.title;
				var did = devent.id;
				var d_num, d_name, d_type, d_date;
				d_num = d_title_arr.split(" #").pop();
				d_name = getProjectByNum(d_num).projname;
				d_type = did.split("///").pop();
				d_date = removeZeroes(devent.start.format("MM/DD/YYYY"));

				if (d_num == pn && d_name == pname && d_type == type && d_date == pd) {
					return true;
				}

				return false;
			})

			// Removes the record from the array
			r_set.splice(c_rec.indicie, 1);

			// Set c_rec to null so object is no longer accsesible
			c_rec = null;

			// Close modal dialog
			$("#events-modal").modal("hide");

			writeLiveRecord();
		}
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

	let $addf = $('#mtype2, #datepicker, #projnum2, #pmchooser2');

	$addf.on('keyup change', function () {
		if (allFilled($addf)) {
			$("#addmilestone").removeAttr('disabled');
		} else {
			$("#addmilestone").attr('disabled', 'disabled');
		}
	});

	let $editf = $('#mtype, #datepicker2, #projnum, #pmchooser');

	$editf.on('keyup change', () => {
		if (allFilled($editf)) {
			$("#savemilestone").removeAttr('disabled');
		} else {
			$("#savemilestone").attr('disabled', 'disabled');
		}
	});

	$("#addmilestone").on('click', () => {
		// Create new JSON entry
		let nobj = {
			name: $("#pmchooser2").val(),
			projnum: $("#projnum2").val(),
			date: $('#datepicker').val(),
			type: $('#mtype2').val()
		};
		// Add to array
		record.milestones.milestones.push(nobj);

		// Write to record
		writeLiveRecord();

		// Create event object
		let max = 0;
		$("#calendar").fullCalendar('clientEvents', (eventObj) => {
			max = eventObj.id > max ? eventObj.id : max;

			// Just need IDs
			return false;
		});

		max++;
		var nevent = {
			start: ISO86Date($("#datepicker").val(), '8hr') + "T17:00:00",
			end: ISO86Date($("#datepicker").val(), '8hr') + "T17:00:00",
			title: getProjectByNum($("#projnum2").val()).projname + " #" + $("#projnum2").val(),
			id: max + "///" + $("#mtype2").val(),
			color: 'rgba(139, 195, 74, 0.4)',
			textColor: 'rgba(26, 26, 26, 1)'
		};
		// Render event object
		$("#calendar").fullCalendar('renderEvent', nevent);

		// Close modal dialog
		$("#addnew-modal").modal('hide');
	});
	
	// TODO: Implement save milestone
	$("#savemilestone").on('click', () => {
		// Make sure date is valid
		let d = moment($("#datepicker2").val());
		if (!d.isValid()) {
			// Date is not valid, do not accept
		} else {
			// Obtain original event from memory, edit reference
			var obj = $("#calendar").fullCalendar('clientEvents', (oevent) => {
				if (oevent.title.split(" #").pop() == c_rec.projnum &&
					removeZeroes(oevent.start.format("MM/DD/YYYY")) == c_rec.date &&
					oevent.id.split("///").pop() == c_rec.type)
					return true;
				return false;
			});
			// Change JSON data, and update calendar
			console.log(r_set[c_rec.indicie])
			r_set[c_rec.indicie].date = removeZeroes(d.format("MM/DD/YYYY"));
			r_set[c_rec.indicie].type = $("#mtype").val();
			r_set[c_rec.indicie].projnum = $("#projnum").val();
			r_set[c_rec.indicie].name = $("#pmchooser").val();
			console.log(r_set[c_rec.indicie])
			// obj is an array, use first element of array
			obj[0].title = getProjectByNum(r_set[c_rec.indicie].projnum).projname + " #" + $("#projnum").val();
			obj[0].id = obj[0].id.split('///')[0] + "///" + $("#mtype").val();
			obj[0].start = ISO86Date(removeZeroes(d.format('MM/DD/YYYY')), '8hr') + "T17:00:00";
			obj[0].end = ISO86Date(removeZeroes(d.format('MM/DD/YYYY')), '8hr') + "T17:00:00";
			record.milestones.milestones = r_set;
			writeLiveRecord();
			$("#calendar").fullCalendar('updateEvent', obj[0]);
			$("#events-modal").modal('hide');
		}
	});
	
	eventEmitter.on('loggedIn', () => {
		eventEmitter.emit('milestones', (out) => {
			if (out === null) {
				r_set = record.milestones.milestones;
				p_set = record.projects.projects;
				var events_calendar = [];
				
				for (var i = 0; i < r_set.length; i++)
					events_calendar.push({
						title: getProjectByNum(r_set[i].projnum).projname + " #" + r_set[i].projnum,
						start: ISO86Date(r_set[i].date, "8hr") + "T17:00:00",
						end: ISO86Date(r_set[i].date, "8hr") + "T17:00:00",
						// separate index id by slash
						id: i + "///" + r_set[i].type
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
					eventDragStop: function(devent, jsEvent, ui, view) {
						getRecordByEvent(devent);
					},
					eventDrop: function(devent, delta, revertFunc, jsEvent, ui, view) {
						if (c_rec !== null && confirm("Are you sure you want to move the milestone?")) {
							record.milestones.milestones[c_rec.indicie].date = removeZeroes(devent.start.format('MM/DD/YYYY'));
							delete record.milestones.milestones[c_rec.indicie].indicie;
						} else {
							revertFunc();
						}
					},
					eventRender: function (eventObj, $el) {
						console.log(eventObj)
						var p_name = getProjectByNum(r_set[getIndexNoDate(eventObj)].projnum).projname;
						$el.popover({
							html: true,
							title: "Milestone",
							content: "PM: <strong>" + r_set[getIndexNoDate(eventObj)].name + "</strong><br />Type: <strong>" +
							r_set[getIndexNoDate(eventObj)].type + "</strong><br />Project #: <strong>" + r_set[getIndexNoDate(eventObj)].projnum +
							"</strong><br /> Project: <strong>" + p_name + "</strong>",
							trigger: 'hover',
							placement: 'top',
							container: 'body'
						});
					},
					eventClick: function(devent, jsEvent, view) {
						// load c_rec variable
						getRecordByEvent(devent);

						// run and open modal dialog
						$("#events-modal").modal();
						$("#datepicker2").val(c_rec.date);
						$(`#projnum.custom-select option:selected`).removeAttr("selected");
						$(`#projnum.custom-select option[value='${c_rec.projnum}']`).attr('selected', 'selected');
						// use event emitter to control actions
						$("#projm").html(`<strong>${c_rec.name}</strong> (Current)`);
						$(`#pmchooser.custom-select option:selected`).removeAttr("selected");
						$(`#pmchooser.custom-select option[value='${c_rec.name}']`).attr('selected', 'selected');
						$("#mtype").val(c_rec.type);
					}
				});
			} else {
				alert("An error has occurred at emit(\"milestones\"), please contact application maintainer.");
			}
		});
	});
});