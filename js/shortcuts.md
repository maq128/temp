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

#### Etherscan.io 下载完整版 contract source code

https://rinkeby.etherscan.io/address/0x00000000006c3852cbef3e08e8df289169ede581#code

```javascript
document.querySelectorAll('a.togglefullscreen').forEach(a => a.click())
var copySourceCode = () => {
  var lines = []
  document.querySelectorAll('pre.ace-dawn').forEach(pre => {
    lines.push('//---- ' + pre.previousSibling.querySelector('span.text-secondary').innerText + ' ----')
    lines.push(pre.querySelector('div.ace_content').innerText + '\n\n')
  })
  document.body.style['white-space'] = 'pre'
  document.body.innerText = lines.join('\n')
}
var waitFullscreen = () => {
  var bars = document.querySelectorAll('pre.ace-dawn div.ace_scrollbar-v').values()
  for (var bar = bars.next(); !bar.done; bar = bars.next()) {
    if (bar.value.style.display !== 'none') {
      setTimeout(waitFullscreen, 500)
      return
    }
  }
  copySourceCode()
}
setTimeout(waitFullscreen, 500)
```

#### 某艺术品拍卖网站上下载完整大图

```javascript
// https://auction.artron.net/paimai-art5182320179/
(function() {
	var loadBigpic = function(data) {
		$(document.body).empty();
		var bigpic = $('<div></div>').appendTo($(document.body))
			.addClass('ad-bigpic')
			.css({
				width: data.w,
				height: data.h,
				position: 'relative',
			});

		var tasks = [];
		for (var j=0; j * 256 < data.h; j++) {
			for (var i=0; i * 256 < data.w; i++) {
				tasks.push(new Promise(function(resolve, reject) {
					$('<img/>').appendTo(bigpic)
						.attr('src', 'https://hd-images.artron.net/auction/images/' + ArtWorkId + '/12/' + i + '_' + j + '.jpg')
						.css({
							position: 'absolute',
							left: i * 256,
							top: j * 256,
						})
						.load(resolve)
						.error(reject);
				}));
			}
		}
		Promise.all(tasks).then(function() {
			alert('下载完成');
		}).catch(function() {
			alert('出错了！无法下载大图的某些局部内容。')
		});
	};

	var onButtonBigpic = function() {
		// 获取大图信息
		$.ajax({
			url: 'https://hd-images.artron.net/auction/getImageOption',
			dataType: "jsonp",
			jsonp: "callback",
			data: {artCode: ArtWorkId},
			success: function(resp) {
				if (resp.code != 0) {
					alert(resp.msg);
					return;
				}
				// 加载所有碎片
				loadBigpic(resp.data);
			}
		});
	};

	// 注入【下载完整高清大图】功能按钮
	var btn = $('<button></button>').appendTo($('.imgShow'))
		.css({
			position: 'absolute',
			left: 400,
			top: '-2em',
			cursor: 'pointer',
		})
		.text('下载完整高清大图');

	var href = $('.enterHD').attr('href');
	if (href && href.indexOf('showbigpic') >= 0) {
		// 该拍品有高清大图
		btn.click(onButtonBigpic);
	} else {
		// 该拍品没有高清大图，或者当前没有登录
		btn.attr('disabled', 'true');
	}

	// 注入【打开半高清大图】功能按钮
	$('<button></button>').appendTo($('.imgShow'))
		.css({
			position: 'absolute',
			left: 530,
			top: '-2em',
			cursor: 'pointer',
		})
		.text('打开半高清大图')
		.click(() => {
			window.open($('#smallPic').attr('src'));
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

#### 微博定制（2022-04-06）

	javascript:(function(){var z=16,d=document,s=d.head.appendChild(d.createElement("style"));s.sheet.insertRule(":root{--feed-detail-og-font-size:"+z+"px;--feed-detail-re-font-size:"+z+"px;}",0);s.sheet.insertRule(".wbpro-list{font-size:"+(z-2)+"px;}",0);})()

```javascript
(function() {
	var z = 16,
		d = document,
		s = d.head.appendChild(d.createElement("style"));
	s.sheet.insertRule(":root{--feed-detail-og-font-size:"+z+"px;--feed-detail-re-font-size:"+z+"px;}", 0);
	s.sheet.insertRule(".wbpro-list{font-size:"+(z-2)+"px;}", 0);
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
