/*jshint esversion: 6 */
/**
 *@author Zachary Waldron
 *@desc Handles Paid Time Off/Out of Office Time
 *
 *
 **/

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
		d = removeZeroes(d_m.format('MM/DD/YYYY');
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