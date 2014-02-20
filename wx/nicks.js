// javascript:void((function(){var d=document,e=d.createElement('script');e.setAttribute('charset','UTF-8');e.setAttribute('src','https://maq128.github.io/temp/wx/nicks.js?'+Math.floor(new Date/1E5));d.body.appendChild(e)})());

(function() {
	var chatrootId = '3426879703@chatroom';
	var nicks = {
		'巴方': '可欣妈',
		'春暖花开_Anna': '徐绮妈',
		'周耿华': '雨霏爸',
		'孟嘉': '雨霏妈',
		'看雪': '淅淅妈',
		'同在阳光下': '艾晨爸',
		'权哥': '子涵爸',
		'香儿泪': '子涵妈',
		'友军': '泽征爸',
		'格格': '天鑫妈',
		'井': '淅淅爸',
		'逸赫妈': '逸赫妈',
		'席洋洋': '懿璇妈',
		'zero': '梓涵妈',
		'梅梅': '逸凡妈',
		'dd': '凯文妈',
		'曾曾': '昱祺妈',
		'石头': '怡然妈',
		'张凌川': '天鑫爸',
		'yangfeng(衡妈)': '杰衡妈',
		'人在江湖': '紫萱爸',
		'多': '涵旸妈',
		'曾吉文': '广慧爸',
		'鹏鹏@妈': '艾鹏妈',
		'李浩': '绍恒妈',
		'施毅': '棋匀爸',
		'严刚': '绍恒爸',
		'化': '艾鹏爸',
		'张悦龙': '妙涵爸',
		'刚刚': '泽征妈',
		'maq': '伊彤爸',
		'肖雨燕': '肖睿妈',
		'肖华军': '肖华军',
		'Alina': '靖涵妈',
		'富伊': '伊彤妈',
		'小龙女': '雅涵妈',
		'燕芳-sonya': '钦源妈',
		'娜美': '思妍妈'
	};

	var members = {};
	$.each(window._oContacts[chatrootId].MemberList, function(idx, member) {
		var username = member.UserName;
		var nickname = member.NickName;
		var realname = nicks[nickname] || '？';
		members[username] = nickname + '（' + realname + '）';
	});

	var chatroom = window._oContacts[chatrootId];
	$('.chatItem.you .chatItemContent').each(function(idx, div) {
		var content = $(div);
		var img = content.children('img');
		var name = content.children('.hack-name');
		if (name.length == 0) {
			name = document.createElement('div');
			name.className = 'hack-name';
			name = $(name);
			name.css({
				'text-align': 'left',
				'padding-left': '50px'
			});
			name.insertAfter(img);
		}
		var username = img.attr('username');
		name.text(members[username]);
	});
})();
