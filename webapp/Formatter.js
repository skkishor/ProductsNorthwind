sap.ui.define(function() {
	"use strict";

	var Formatter = {

		status: function(sStatus) {
			if (sStatus === "Completed") {
				return "Success";
			} else if (sStatus === "In Progress") {
				return "Warning";
			} else if (sStatus === "Not Started") {
				return "Error";
			} else {
				return "None";
			}
		},

		prodStatus: function(sStatus) {
			if (sStatus === "Active") {
				return "Success";
			} else if (sStatus === "Blocked") {
				return "Error";
			} else {
				return "None";
			}
		}
	};

	return Formatter;

}, /* bExport= */ true);