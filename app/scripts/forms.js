// usage:
// var form = fa.forms.create(elem.querySelector('form'));
// form.add('email', [fa.forms.email]);
// form.add('pass', [fa.forms.minLen(1)]);
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
		var validators = [];
		var errorElem = null;
		
		try {
			errorElem = fa.dom.get('[data-fn=error]', fieldElem.parentNode);
		} catch (e) {
			errorElem = fa.dom.get('[data-fn=error]', fieldElem.parentNode.parentNode);
		}
		
		field.name = fieldElem.name;
		
		// returns the current value
		// for checkbox inputs, this is a boolean
		field.getValue = function() {
			if(fieldElem.tagName == 'INPUT' && fieldElem.type == 'checkbox') {
				return fieldElem.checked;
			}
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
		
		// returns the [] of field validators
		// this is used by field objects that extend this object
		field.getValidators = function() {
			return validators;
		};
		
		// checks whether the value is valid
		field.isValid = function() {
			for(var i = 0; i < validators.length; i++) {
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
	
	// returns a tags field object
	// this is a field object with added functionality
	var createTagsField = function(fieldElem) {
		var containerElem = fieldElem.parentElement;
		
		var field = createField(fieldElem);
		var tags = fjs.map('x => x.innerHTML', fa.dom.filter('span', containerElem));
		
		// returns the [] of tags (i.e. strings) comprising the current value
		// 
		// overwrites the common field's getValue() method
		field.getValue = function() {
			return tags;
		};
		
		// prevents the form's submission if there is something written in the
		// input field which has not been added yet and is invalid
		// 
		// if there is something written which is valid, it is explicitly added
		// to the field's value
		// 
		// overwrites the common field's isValid() method
		field.isValid = function() {
			if(fieldElem.value) {
				if(field.addTag(fieldElem.value)) {
					fieldElem.value = '';
				} else {
					return false;
				}
			}
			
			return true;
		};
		
		// adds the given string to the field value ([] of tags)
		// adds the respective <span> element
		// 
		// if the tag is already added, does nothing
		// 
		// the tag is checked against the field's validators
		// returns whether the tag has been added, i.e. is valid
		field.addTag = function(tag) {
			var spanElem, fieldLikeObj, i, validators;
			
			if(tags.indexOf(tag) > -1) {
				return false;
			}
			
			if(tags.length >= 5) {
				field.showError('only 5 tags per film are allowed');
				return false;
			}
			
			// validate the string
			fieldLikeObj = {getValue: function() { return tag; }};
			validators = field.getValidators();
			
			for(i = 0; i < validators.length; i++) {
				try {
					validators[i](fieldLikeObj);
				} catch (error) {
					field.showError(error);
					return false;
				}
			}
			
			// add the span elem
			spanElem = document.createElement('span');
			spanElem.appendChild(document.createTextNode(tag));
			
			containerElem.insertBefore(spanElem, fieldElem);
			
			tags.push(tag);
			return true;
		};
		
		// removes the last tag from the the field value ([] of tags)
		// removes the respective <span> element
		// 
		// if there are not tags, does nothing
		field.removeLastTag = function() {
			if(tags.length == 0) return;
			
			var spanElems = fa.dom.filter('span', containerElem);
			containerElem.removeChild(spanElems[spanElems.length-1]);
			
			tags.pop();
		};
		
		// on pressing space or comma: add tag
		// on pressing backspace: remove last tag
		fa.dom.on(fieldElem, 'keydown', function(e) {
			if(!fieldElem.value && e.keyCode == 8) {
				field.removeLastTag();
			}
			if(e.keyCode == 32 || e.keyCode == 188) {
				e.preventDefault();
				if(fieldElem.value) {
					if(field.addTag(fieldElem.value)) {
						fieldElem.value = '';
					}
				}
			}
		});
		
		return field;
	};
	
	// returns [] of field objects, one for each named field in the <form> given
	// 
	// determines which field is of what type (for now the only two types are
	// tags fields and.. common fields)
	var createFieldList = function(formElem) {
		var list = [], i;
		var elems = fa.dom.filter('[name]', formElem);
		
		for(i = 0; i < elems.length; i++) {
			if(elems[i].dataset.fn && elems[i].dataset.fn == 'tags-field') {
				list.push(createTagsField(elems[i]));
			} else {
				list.push(createField(elems[i]));
			}
		}
		
		return list;
	};
	
	// returns a form object
	// expects a <form> element and optionally a submit func
	var createForm = function(formElem) {
		var form = {};
		
		var errorElem = fa.dom.get('[data-fn=error]', formElem);
		var submitButton = fa.dom.get('[type=submit]', formElem);
		
		var fields = createFieldList(formElem);
		var submitFunc = fjs.isFunction(arguments[1]) ? arguments[1] : null;
		
		// disables and validates the form
		// if any of the fields is invalid enables the form back
		// otherwise invokes submitFunc() and returns; enabling the form back
		// in this case is left to the submitFunc
		// 
		// attached in form.enable()
		var submitEventListener = function(e) {
			e.preventDefault();
			
			form.disable();
			
			form.hideError();
			fjs.map('x => x.hideError()', fields);
			
			if(fjs.all('x => x', fjs.map('x => x.isValid()', fields))) {
				if(submitFunc) {
					submitFunc(form);
					return;
				}
			}
			
			form.enable();
		};
		
		// register a handler which is called when the form is submitted and
		// all the field values seem valid
		form.onSubmit = function(func) {
			submitFunc = func;
		};
		
		// shows an error message
		form.showError = function(error) {
			errorElem.innerHTML = error;
		};
		
		// removes the error message, if such
		form.hideError = function() {
			errorElem.innerHTML = '';
		};
		
		// returns the field object corresponding to the given field name
		form.getField = function(name) {
			return fjs.first(function(field) {
				return field.name == name;
			}, fields);
		};
		
		// register validators for a field
		// returns form in order to allow chaining
		form.add = function(name, validators) {
			var field = form.getField(name);
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
		
		// disables the submit button and detaches the submit event listener
		form.disable = function() {
			submitButton.disabled = true;
			submitButton.classList.add('loading');
			fa.dom.off(formElem, 'submit', submitEventListener);
		};
		
		// enables the submit button and attaches the submit event listener
		form.enable = function() {
			fa.dom.on(formElem, 'submit', submitEventListener);
			submitButton.classList.remove('loading');
			submitButton.disabled = false;
		};
		
		// add the event listener
		form.enable();
		
		return form;
	};
	
	
	// 
	// exports
	// 
	
	return {
		create: createForm,
		createTagsField: createTagsField,
		
		minLen: fjs.curry(minLen),
		maxLen: fjs.curry(maxLen),
		
		email: email,
		equal: fjs.curry(equal)
	};
	
}());
