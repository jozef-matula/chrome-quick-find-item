var elemToWorkWith = null;
var elemDivCover = null;
var elemDivPopup = null;
var elemQueryInput = null;
var elemResultsList = null;

document.addEventListener("mousedown", function(event) {
	if(event.button == 2) { //right click
		elemToWorkWith = event.target;
	}
}, true);

var killFocus = function() {
	elemDivCover.style.display = 'none';
	elemDivPopup.style.display = 'none';
	elemToWorkWith.focus();
}

var escapeHTML = function (s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

var updateInputDisplay = function() {
	elemQueryInput.innerHTML = escapeHTML(elemQueryInput.value).replace(' ', '&nbsp;') + '&nbsp;';
}

var handleKeyDown = function(event) {
	if(elemDivPopup != null && elemDivPopup.style.display != 'none') {
		if(event.key == "Escape") {
			killFocus();
		}
		else if(event.key == "Backspace") {
			if(elemQueryInput.value.length) {
				elemQueryInput.value = elemQueryInput.value.substring(0, elemQueryInput.value.length - 1);
				elemQueryInput.innerText = elemQueryInput.value;
				elemQueryInput.dispatchEvent(new Event('change', {}));
			}
		}
		else if(event.key.length == 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
			elemQueryInput.value += event.key;
			elemQueryInput.innerText = elemQueryInput.value;
			elemQueryInput.dispatchEvent(new Event('change', {}));
		}
		else if(event.key == "ArrowDown" || event.key == "ArrowUp") {
			var selectedIndex = 0;
			var options = elemResultsList.getElementsByTagName('li');
			for(var i = 0; i < options.length; ++i) {
				if(options[i].className == "selected") {
					selectedIndex = i;
					options[i].className = "";
				}
			}
			if(event.key == "ArrowDown" && selectedIndex + 1 < options.length)
				++selectedIndex;
			if(event.key == "ArrowUp" && selectedIndex - 1 >= 0)
				--selectedIndex;
			if(selectedIndex < options.length) {
				options[selectedIndex].className = "selected";
				options[selectedIndex].scrollIntoView(false);
			}
		}
		else if(event.key == "Enter") {
			var options = elemResultsList.getElementsByTagName('li');
			var selectedIndex = -1;
			for(var i = 0; i < options.length; ++i) {
				if(options[i].className == "selected") {
					selectedIndex = i;
				}
			}
			if(selectedIndex >= 0) {
				elemToWorkWith.value = options[selectedIndex].data;
				killFocus();
			}
		}
		else {
			return; // default handling
		}
		updateInputDisplay();
		event.preventDefault();
	}
}

var handleItemClick = function(event) {
	elemToWorkWith.value = this.data;
	killFocus();
}

var updateResults = function() {
	elemResultsList.innerHTML = ''; // remove all children
	if(!elemQueryInput.value) {
		return;
	}
	var allOptions = elemToWorkWith.getElementsByTagName('option');
	var foundItems = 0;
	var query = elemQueryInput.innerText.toLowerCase();
	for(var i = 0; i < allOptions.length; ++i) {
		if(allOptions[i].innerText.toLowerCase().indexOf(query) >= 0) {
			var elemItem = document.createElement('li');
			elemItem.data = allOptions[i].value;
			elemItem.innerText = allOptions[i].innerText;
			elemItem.onclick = handleItemClick;
			elemItem.onclick = handleItemClick;
			if(foundItems == 0)
				elemItem.className = "selected";
			elemResultsList.appendChild(elemItem);
			++foundItems;
		}
	};
	elemResultsList.size = foundItems;
	if(foundItems == 0)
		elemResultsList.innerHTML = '<small>No match</small>';
}

var cumulativeOffset = function(element) {
	var top = 0, left = 0;
	do {
		top += element.offsetTop  || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while(element);

	return {
		top: top,
		left: left
	};
};

document.addEventListener("keydown", handleKeyDown, true);

chrome.runtime.onMessage.addListener(function(request, sender/*, sendResponse*/) {
	if(request == "quickFindItemInFromRightClicked")
		;
	else if(request = "quickFindItemInFromFocus")
		elemToWorkWith = document.activeElement;
	else
		return;
	if(elemToWorkWith && elemToWorkWith.tagName == 'OPTION')
		elemToWorkWith = elemToWorkWith.parentElement;
	if(!elemToWorkWith || elemToWorkWith.tagName != 'SELECT') {
		alert('This function works only on SELECT elements.');
		return;
	}
	elemToWorkWith.blur(); // close pop-up not to interfere with our UI

	elemDivPopup = document.getElementById('quick-find-item-popup');

	if(elemDivPopup == null) {
		elemDivPopup = document.createElement("div");
		elemDivPopup.id = 'quick-find-item-popup';
		elemDivPopup.innerHTML = '<div id="quick-find-item-input"></div>' +
				'<div id="quick-find-item-results"/><ul id="quick-find-item-list"></ul></div>';

		var body = document.getElementsByTagName('body')[0];

		elemDivCover = document.createElement("div");
		elemDivCover.id = 'quick-find-item-cover';
		body.appendChild(elemDivCover);

		body.appendChild(elemDivPopup);
	}
	elemQueryInput = document.getElementById('quick-find-item-input');
	elemResultsList = document.getElementById('quick-find-item-list');

	elemQueryInput.value = '';
	updateInputDisplay();
	elemQueryInput.onchange = function(event) { updateResults(); };

	var pos = cumulativeOffset(elemToWorkWith);
	elemDivCover.style.display = 'block';
	elemDivPopup.style.left = (pos.left - 8) + "px";
	elemDivPopup.style.top = (pos.top - 8) + "px";
	elemDivPopup.style.display = 'block';
	var style = window.getComputedStyle(elemToWorkWith);
	elemDivPopup.style.fontFamily = style.fontFamily;
	elemDivPopup.style.fontSize = style.fontSize;
	elemDivPopup.style.fontWeith = style.fontWeight;
	elemDivPopup.style.fontStyle = style.fontStyle;
	elemQueryInput.style.height = '1em';
	elemQueryInput.style.minWidth = style.width;
	elemResultsList.innerHTML = '<small>Start typing...</small>';

	//sendResponse({});
}); // chrome.runtime.onMessage.addListener