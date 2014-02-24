document.addEventListener('DOMContentLoaded', function() {
	var nicks = localStorage[ 'nicks' ] || '';
	var ta = document.getElementById( 'nicks' );
	ta.value = nicks;
});

document.querySelector('#nicks').addEventListener('blur', function( evt ) {
	var ta = document.getElementById( 'nicks' );
	localStorage[ 'nicks' ] = ta.value;
	chrome.runtime.sendMessage({req: "options"});
});
