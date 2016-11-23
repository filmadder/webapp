// usage:
// var form = fa.forms.create(elem.querySelector('form'));
// form.add('[name=email]', [fa.forms.email]);
// form.add('[name=pass]', [fa.forms.minLen(1)]);
fa.forms = (function() {
	
	"use strict";
	
	// 
	// validators
	// 
	
	var minLen = function(len, field) {
		if(field.getValue().length < len) {
			throw 'too short';
		}
	};
	
	var maxLen = function(len, field) {
		if(field.getValue().length > len) {
			throw 'too long';
		}
	};
	
	var email = function(field) {
		var re = /^.+@.+$/;
		if(!re.test(field.getValue())) {
			throw 'does not look like email';
		}
	};
	
	var equal = function(field2, field) {
		field2 = field.getFormElem().querySelector('[name='+field2+']');
		if(field2.value != field.getValue()) {
			throw 'does not match';
		}
	};
	
	
	// 
	// constructors
	// 
	
	// returns a field object
	// expects a field element
	var createField = function(fieldElem) {
		var field = {};
		
		var errorElem = fieldElem.parentNode.querySelector('[data-fn=error]');
		var validators = [];
		
		field.name = fieldElem.name;
		
		// returns the current value
		field.getValue = function() {
			return fieldElem.value;
		};
		
		field.getFormElem = function() {
			return fieldElem.form;
		};
		
		field.showError = function(error) {
			errorElem.innerHTML = error;
		};
		
		field.hideError = function() {
			errorElem.innerHTML = '';
		};
		
		// accepts a func or an array of funcs
		// validator funcs are expected to throw an error if the value is bad
		field.setValidators = function(arg) {
			if(!fjs.isArray(arg)) arg = [arg];
			validators = fjs.filter(fjs.isFunction, arg);
		};
		
		// checks whether the value is valid
		field.isValid = function() {
			var i;
			
			for(i = 0; i < validators.length; i++) {
				try {
					validators[i](field);
				} catch (error) {
					field.showError(error);
					return false;
				}
			}
			
			return true;
		};
		
		return field;
	};
	
	// returns [] of field objects, one for each named field in the <form> given
	// this is needed because NodeList is not an array, so no fjs
	var createFieldList = function(formElem) {
		var list = [], i;
		var query = formElem.querySelectorAll('[name]');
		
		for(i = 0; i < query.length; i++) {
			list.push(createField(query[i]));
		}
		
		return list;
	};
	
	// returns a form object
	// expects a <form> element and optionally a submit func
	var createForm = function(formElem) {
		var form = {};
		
		var errorElem = formElem.querySelector('[data-fn=error]');
		var fields = createFieldList(formElem);
		var submitFunc = fjs.isFunction(arguments[1]) ? arguments[1] : null;
		
		formElem.addEventListener('submit', function(e) {
			e.preventDefault();
			
			form.hideError();
			fjs.each('x => x.hideError()', fields);
			
			if(fjs.all('x => x.isValid()', fields)) {
				if(submitFunc) submitFunc(form);
			}
		});
		
		// shows an error message
		form.showError = function(error) {
			errorElem.innerHTML = error;
		};
		
		// removes the error message, if such
		form.hideError = function() {
			errorElem.innerHTML = '';
		};
		
		// register validators for a field
		// returns form in order to allow chaining
		form.add = function(name, validators) {
			var field = fjs.first(function(x) {return x.name == name;}, fields);
			if(field) {
				field.setValidators(validators);
			}
			return form;
		};
		
		// returns {field name: field value} for all named fields
		// we have to loop, because fields is a NodeList, not an Array
		form.getData = function() {
			return fjs.fold(function(data, field) {
				data[field.name] = field.getValue();
				return data;
			}, {}, fields);
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
		create: createForm,
		
		minLen: fjs.curry(minLen),
		maxLen: fjs.curry(maxLen),
		
		email: email,
		equal: fjs.curry(equal)
	};
	
}());
