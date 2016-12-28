// change status
fa.status = (function() {
	
	var openStatusContainer = function(e) {
		document.getElementByIdtarget.dataset.status.remove('hidden');
	}

/*	var closeStatusContainer = function(e) {
		document.getElementById(e.target.dataset.close)
		.classList.add('hidden');
	}*/

	var status = function() {
		var elements = document.getElementsByClassName('change-status');
		for(var element=0; element<elements.length; element++) {
			elements[element].addEventListener('click', openStatusContainer);
		}

	}

/*	var close = function() {
		document.getElementById('change-status')
		.addEventListener('click', closeStatusContainer);
	}*/

	return {
		init: function() {
			status();
			// close();
		}
	};
	
}());