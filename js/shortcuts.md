#### 某艺术品拍卖网站上下载完整大图

```javascript
// https://auction.artron.net/paimai-art5182320179/
// https://auction.artron.net/showbigpic-art5182320179/
(function() {
	var m = window.location.pathname.match(/showbigpic-(.*)\//);
	if (m.length != 2) return;
	var id = m[1];

	$.ajax({
		url: 'https://hd-images.artron.net/auction/getImageOption',
		dataType: "jsonp",
		jsonp: "callback",
		data: {artCode: id},
		success: function(resp) {
			if (!resp.data) return;
			var data = resp.data;

			document.oncontextmenu = null;
			$(document.body).empty();
			var container = $('<div></div>').appendTo($(document.body));
			container.css({
				minWidth: data.w,
				minHeight: data.h,
				position: 'relative',
			});

			for (var j=0; j * 256 < data.h; j++) {
				for (var i=0; i * 256 < data.w; i++) {
					var src = 'https://hd-images.artron.net/auction/images/' + id + '/12/' + i + '_' + j + '.jpg';
					var img = $('<img/>').appendTo(container);
					img.attr('src', src);
					img.css({
						position: 'absolute',
						left: i * 256,
						top: j * 256,
					});
				}
			}
		}
	});
})()
```

#### YouTube 自动关闭广告

	javascript:(function(){window.setInterval(function(){var b=document.querySelector('button.ytp-ad-skip-button');b&&b.click();b=document.querySelector('button.ytp-ad-overlay-close-button');b&&b.click();document.querySelector('input#search').placeholder='自动关闭广告'},1000)})()

```javascript
(function() {
	window.setInterval(function() {
		var b = document.querySelector('button.ytp-ad-skip-button');
		b && b.click();
		b = document.querySelector('button.ytp-ad-overlay-close-button');
		b && b.click();
		document.querySelector('input#search').placeholder = '自动关闭广告';
	}, 1000);
})()
```

#### 自动刷新网页（抢课）

	javascript:(function(){var x=0,y=0;(function reload(){x++;document.querySelector('.btn_search').click();setTimeout(reload,30000);})();(function check(){y++;document.querySelector('.kc_title').textContent='已自动刷新 '+x+' 次 '+'▙▛▜▟'[y%4];var c=document.querySelectorAll('.dwc .ng-binding');for (var i=0;i<c.length;i++){if(c[i].textContent>1){var a=document.createElement('audio');document.body.appendChild(a);a.src='http://xmdx.sc.chinaz.com/Files/DownLoad/sound1/201709/9239.mp3';a.loop='loop';a.play();setTimeout(function(){a.pause();},10000);setInterval(function(){document.title=(document.title=='【开新课啦！】'?'【————】':'【开新课啦！】');},500);return;}}setTimeout(check,1000);})();})()

```javascript
(function(){
	var x=0,y=0;
	(function reload(){
		x++;
		document.querySelector('.btn_search').click();
		setTimeout(reload,30000);
	})();
	(function check(){
		y++;
		document.querySelector('.kc_title').textContent='已自动刷新 '+x+' 次 '+'▙▛▜▟'[y%4];
		var c=document.querySelectorAll('.dwc .ng-binding');
		for (var i=0;i<c.length;i++){
			if(c[i].textContent>4){
				var a=document.createElement('audio');
				document.body.appendChild(a);
				a.src='http://xmdx.sc.chinaz.com/Files/DownLoad/sound1/201709/9239.mp3';
				a.loop='loop';
				a.play();
				setTimeout(function(){a.pause();},10000);
				setInterval(function(){document.title=(document.title=='【开新课啦！】'?'【————】':'【开新课啦！】');},500);
				return;
			}
		}
		setTimeout(check,1000);
	})();
})()
```

#### 微博定制

	javascript:(function(){var z=16,d=document,s=d.head.appendChild(d.createElement("style"));s.appendChild(d.createTextNode(""));s.sheet.insertRule(".W_f14{font-size:"+z+"px}",0);s.sheet.insertRule(".WB_expand,.WB_sonFeed .WB_text,.WB_main_c{font-size:"+(z-1)+"px}",0);d.querySelector('.WB_feed_v3').classList.remove('WB_feed_v3');})()

```javascript
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
```

#### XDEBUG

	javascript:(function(){document.location+=(document.location.href.indexOf('?')>0?'&':'?')+'XDEBUG_SESSION_START=ECLIPSE_DBGP'+'&KEY='+(new Date().getTime())})()

```javascript
(function() {
	document.location +=
		(document.location.href.indexOf('?') > 0 ? '&' : '?') +
		'XDEBUG_SESSION_START=ECLIPSE_DBGP' +
		'&KEY=' + (new Date().getTime())
})()
```

#### 网页插入脚本

	javascript:(function(){var e=document.createElement('script');e.setAttribute('type','text/javascript');e.setAttribute('charset','UTF-8');e.setAttribute('src','http://a.tbcdn.cn/s/aplus_v2.js');document.body.appendChild(e)})()

```javascript
(function() {
	var e = document.createElement('script');
	e.setAttribute('type', 'text/javascript');
	e.setAttribute('charset', 'UTF-8');
	e.setAttribute('src', 'http://a.tbcdn.cn/s/aplus_v2.js');
	document.body.appendChild(e)
})()
```

#### DCloud免折行

	http://ask.dcloud.net.cn/question/14304
	javascript:(function(){var i=$('iframe').get(0),d=(i&&i.contentDocument)||document,s=d.head.appendChild(d.createElement("style"));s.appendChild(d.createTextNode(""));s.sheet.insertRule("pre.prettyprint{overflow-x:scroll;}",0);s.sheet.insertRule("pre.prettyprint code{word-wrap:initial;white-space:pre;}",0);})()

```javascript
(function() {
	var i = $('iframe').get(0),
		d = (i && i.contentDocument) || document,
		s = d.head.appendChild(d.createElement("style"));
	s.appendChild(d.createTextNode(""));
	s.sheet.insertRule("pre.prettyprint{overflow-x:scroll;}", 0);
	s.sheet.insertRule("pre.prettyprint code{word-wrap:initial;white-space:pre;}", 0);
})()
```
