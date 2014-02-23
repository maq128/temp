(function() {
	if (typeof($) == 'undefined') return;

	// 针对一条对话记录，计算并显示出“显示名”
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

	// 对当前网页进行改造
	var doHack = function() {
		// 本程序的扩展程序标识
		var WxAssistExtId = document.body.getAttribute('WxAssistExtId');

		// 拦截原有的代码，每当对话记录被更新之后，为每条记录增加“显示名”
		var overrides = {};
		var fnOverride = function(target, method) {
			overrides[method] = target[method];
			target[method] = function() {
				// 执行函数原来的功能，更新对话记录
				var ret = overrides[method].apply(this, arguments);
				// 请求 extension 提供“昵称-显示名”映射表
				chrome.runtime.sendMessage(WxAssistExtId, {req:'nicks'}, function(nicks) {
					if (!nicks) return;
					// 对 DOM 做进一步处理，增加“显示名”
					$('.chatItem.you .chatItemContent').each(function(idx, divContent) {
						showHackName(nicks, $(divContent));
					});
				});
				return ret;
			};
		};

		// “显示对话记录”的控件上有 3 个接口函数可以导致记录更新: _msgDelayLoad/messageAdded/messageUpdated
		// 其中后两个可以直接拦截，但 _msgDelayLoad 内部采用了异步方式，所以函数返回时 dom 还没有真正更新，针对
		// 这个情况改为对它的 prepend 进行拦截。
		var ctrl = WebMM.getCtrlInstants('chat_chatmsglist');
		fnOverride(ctrl, 'messageAdded');
		fnOverride(ctrl, 'messageUpdated');
		fnOverride(ctrl.getDom$(), 'prepend');

		$('&nbsp; <span style="color:silver">（微信网页版助手 @ maq128）</span>').appendTo($('.webwx'));
	};

	// 检查宿主网页加载完成，然后启动改造
	var doCheck = function() {
		if (window._oContacts && window._oContacts.weixin) {
			doHack();
		} else {
			window.setTimeout(doCheck, 500);
		}
	};
	doCheck();
})();
