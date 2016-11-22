// usage:
// var form = fa.forms.create(elem.querySelector('form'));
// form.add('[name=email]', [fa.forms.email]);
// form.add('[name=pass]', [fa.forms.minLen(1)]);
fa.forms = (function() {
	
	"use strict";
	
	// 
	// validators
	// 
	
	var isEmpty = function(value) {
		
	};
	
	var isEmail = function(value) {
		
	};
	
	
	// 
	// constructors
	// 
	
	// returns a form object
	// expects a <form> element
	var createForm = function(formElem) {
		var form = {};
		
		var errorElem = formElem.querySelector('[data-fn=error]');
		var fields = formElem.querySelectorAll('[name]');
		
		var submitFunc = null;
		
		formElem.addEventListener('submit', function(e) {
			e.preventDefault();
			if(submitFunc) submitFunc();
		});
		
		// shows an error message
		form.showError = function(error) {
			errorElem.innerHTML = error;
		};
		
		// removes the error message, if such
		form.hideError = function() {
			errorElem.innerHTML = '';
		};
		
		// returns {field name: field value} for all named fields
		// we have to loop, because fields is a NodeList, not an Array
		form.getData = function() {
			var data = {}, i;
			
			for(i = 0; i < fields.length; i++) {
				data[fields[i].name] = fields[i].value;
			}
			
			return data;
		};
		
		// register a handler which is called when the form is submitted and
		// all the field values seem valid
		form.onSubmit = function(func) {
			submitFunc = func;
		};
		
		return form;
	};
	
	
	// 
	// exports
	// 
	
	return {
		create: createForm
	};
	
}());
