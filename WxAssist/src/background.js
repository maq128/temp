// http://developer.chrome.com/extensions/devguide.html

chrome.browserAction.onClicked.addListener( function( tab ) {
	// open WebMM
	chrome.tabs.create({ url: 'https://wx.qq.com/' }, function( tab ) {
	});
});

var nicks = {};

function parseNicks()
{
	var lines = localStorage[ 'nicks' ];
	if (lines == undefined) {
		lines = [
			'巴方,可欣妈',
			'春暖花开_Anna,徐绮妈',
			'周耿华,雨霏爸',
			'孟嘉,雨霏妈 ',
			'看雪,淅淅妈',
			'同在阳光下,艾晨爸',
			'权哥,子涵爸',
			'香儿泪,子涵妈',
			'友军,泽征爸',
			'格格,天鑫妈',
			'井,淅淅爸',
			'逸赫妈,逸赫妈',
			'席洋洋,懿璇妈',
			'zero,梓涵妈',
			'梅梅,逸凡妈',
			'dd,凯文妈',
			'曾曾,昱祺妈',
			'石头,怡然妈',
			'张凌川,天鑫爸',
			'yangfeng(衡妈),杰衡妈',
			'人在江湖,紫萱爸',
			'多,涵旸妈',
			'曾吉文,广慧爸',
			'鹏鹏@妈,艾鹏妈',
			'李浩,绍恒妈',
			'施毅,棋匀爸',
			'严刚,绍恒爸',
			'化,艾鹏爸',
			'张悦龙,妙涵爸',
			'刚刚,泽征妈',
			'maq,伊彤爸',
			'肖雨燕,肖睿妈',
			'肖华军,肖华军',
			'A li na,靖涵妈',
			'富伊,伊彤妈',
			'小龙女,雅涵妈',
			'燕芳-sonya,钦源妈',
			'娜美,思妍妈',
			'大熊,弘毅爸'
		].join('\n');
		localStorage[ 'nicks' ] = lines;
	}
	lines = lines.split(/\n/);
	nicks = {};
	for (var i=0; i < lines.length; i++) {
		var line = lines[i].trim();
		if (line.length == 0) continue;
		var tokens = line.split(/[\s,，]+/);
		if (tokens.length == 2) {
			nicks[tokens[0]] = tokens[1];
		}
	}
}
parseNicks();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.req == 'options') {
		parseNicks();
	}
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
	if (sender.url == 'https://wx.qq.com/') {
		if (request.req == 'nicks') {
			sendResponse(nicks);
			return;
		}
	}
});
