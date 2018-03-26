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
var Reverse8601