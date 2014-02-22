// http://developer.chrome.com/extensions/devguide.html

(function() {
	if (typeof($) == 'undefined') return;

	var showHackName = function(nicks, divContent) {
		var username = divContent.children('img.avatar').attr('userName');
		var you = window._oContacts[username];
		if (!you) return;
		var nickname = you.NickName;
		var showname = nickname;
		if (nicks[nickname]) {
			showname += '（' + nicks[nickname] + '）';
		}

		var divHackName = divContent.children('.hack-name');
		if (divHackName.length == 0) {
			divHackName = $(document.createElement('div'));
			divHackName.addClass('hack-name');
			divHackName.css({'float':'left', 'padding-left':'10px'});
			divHackName.appendTo(divContent);
		}
		divHackName.text(showname);
	};

	var doHack = function() {
		var ctrl = WebMM.getCtrlInstants('chat_chatmsglist');
		var WxAssistExtId = document.body.getAttribute('WxAssistExtId');
		var overrides = {};
		$.each('_msgDelayLoad messageAdded messageUpdated'.split(' '), function(idx, name) {
			overrides[name] = ctrl[name];
			ctrl[name] = function() {
				var ret = overrides[name].apply(this, arguments);
				chrome.runtime.sendMessage(WxAssistExtId, {req:'nicks'}, function(nicks) {
					if (!nicks) return;
					$('.chatItem.you .chatItemContent').each(function(idx, divContent) {
						showHackName(nicks, $(divContent));
					});
				});
				return ret;
			};
		});
		$('&nbsp; <span style="color:silver">（微信网页版助手 @ maq128）</span>').appendTo($('.webwx'));
	};

	var doCheck = function() {
		if (window._oContacts && window._oContacts.weixin) {
			doHack();
		} else {
			window.setTimeout(doCheck, 500);
		}
	};
	doCheck();
})();
