This is a fork of the bootstrap-datepicker library located here: https://github.com/zybreak/bootstrap-datepicker

I added a disabled class and 3 new parameters that are useful:

	noOffset: <boolean> - Useful for using the datepicker in the bootstrap-modal plugin; disables the plugin from automatically offsetting the calendar.

	preventPast: <boolean> - Prevents users from selecting a date that is in the past.

	limit: <Date Object or integer representing a offset from today, in milliseconds> - Allows developer to set a limit on the dates that are available for the user to select.

Usage:

$(selector).datepicker({
	noOffset: true,
	preventPast: true,
	limit: new Date("1/1/2012")
})

or 

$(selector).datepicker({
	noOffset: false,
	preventPast: true,
	limit: (60 * 60 * 24 * 7) * 1000 // a week
})

Example: http://cs.txstate.edu/~bm1362/bootstrap-datepicker/