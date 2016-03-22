#### 微博定制

	javascript:(function(){var z=16,d=document,s=d.head.appendChild(d.createElement("style"));s.appendChild(d.createTextNode(""));s.sheet.insertRule(".W_f14{font-size:"+z+"px}",0);s.sheet.insertRule(".WB_expand,.WB_sonFeed .WB_text,.WB_main_c{font-size:"+(z-1)+"px}",0);d.querySelector('.WB_feed_v3').classList.remove('WB_feed_v3');})()

	(function() {
		var z = 16,
			d = document,
			s = d.head.appendChild(d.createElement("style"));
        // 增大字号
		s.appendChild(d.createTextNode(""));
		s.sheet.insertRule(".W_f14{font-size:" + z + "px}", 0);
		s.sheet.insertRule(".WB_expand,.WB_sonFeed .WB_text,.WB_main_c{font-size:" + (z - 1) + "px}", 0);
		// 去掉 v3 新版效果，恢复旧的布局（小图）
		d.querySelector('.WB_feed_v3').classList.remove('WB_feed_v3');
	})()

#### XDEBUG

	javascript:(function(){document.location+=(document.location.href.indexOf('?')>0?'&':'?')+'XDEBUG_SESSION_START=ECLIPSE_DBGP'+'&KEY='+(new Date().getTime())})()

	(function() {
		document.location +=
			(document.location.href.indexOf('?') > 0 ? '&' : '?') +
			'XDEBUG_SESSION_START=ECLIPSE_DBGP' +
			'&KEY=' + (new Date().getTime())
	})()

#### 网页插入脚本

	javascript:(function(){var e=document.createElement('script');e.setAttribute('type','text/javascript');e.setAttribute('charset','UTF-8');e.setAttribute('src','http://a.tbcdn.cn/s/aplus_v2.js');document.body.appendChild(e)})()

	(function() {
		var e = document.createElement('script');
		e.setAttribute('type', 'text/javascript');
		e.setAttribute('charset', 'UTF-8');
		e.setAttribute('src', 'http://a.tbcdn.cn/s/aplus_v2.js');
		document.body.appendChild(e)
	})()

#### DCloud免折行

	http://ask.dcloud.net.cn/question/14304
	javascript:(function(){var i=$('iframe').get(0),d=(i&&i.contentDocument)||document,s=d.head.appendChild(d.createElement("style"));s.appendChild(d.createTextNode(""));s.sheet.insertRule("pre.prettyprint{overflow-x:scroll;}",0);s.sheet.insertRule("pre.prettyprint code{word-wrap:initial;white-space:pre;}",0);})()

	(function() {
		var i = $('iframe').get(0),
			d = (i && i.contentDocument) || document,
			s = d.head.appendChild(d.createElement("style"));
		s.appendChild(d.createTextNode(""));
		s.sheet.insertRule("pre.prettyprint{overflow-x:scroll;}", 0);
		s.sheet.insertRule("pre.prettyprint code{word-wrap:initial;white-space:pre;}", 0);
	})()
