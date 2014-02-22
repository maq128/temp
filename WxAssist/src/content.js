// http://developer.chrome.com/extensions/devguide.html

(function() {
	document.body.setAttribute('WxAssistExtId', chrome.runtime.id);

	var sc = document.createElement('script');
	sc.setAttribute('charset','UTF-8');
	sc.setAttribute('src', chrome.extension.getURL('page.js'));
	document.body.appendChild(sc);
})();
