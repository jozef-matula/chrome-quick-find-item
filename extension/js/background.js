var parentId = chrome.contextMenus.create({
	title: "Quick find item...",
	contexts: ["page"],
	onclick: function(info, tab) {
		chrome.tabs.sendMessage(tab.id, "quickFindItemInFromRightClicked", /*function() {} */);
	}
});

chrome.commands.onCommand.addListener(function(command) {
	if(command == 'quick_find_item') {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, "quickFindItemFromFocus", /*function() {} */);
		});
	}
});