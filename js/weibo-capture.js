/*
	使用方法：

	进入新浪微博某个博主的微博列表页面，把下面的代码复制粘贴到 console 并运行。
	点击页面左上角的“抓”按钮可以提取当前页面中的微博内容。
	点击“保存”按钮可以把已经提取出的内容保存到文件。

	程序会自动向下滚屏直至列表显示完整，提取完当前页后会自动翻到下一页。
*/
(function() {

// 把文本内容保存到文件里
function saveToFile(str, filename, mime)
{
	var blob = new window.Blob([str], {type: mime});
	var url = window.URL.createObjectURL(blob)
	var a = document.createElement('a');
	a.href = url;
	a.setAttribute('download', filename);
	a.innerHTML = 'saving...';
	document.body.appendChild(a);
	setTimeout(function() {
		a.click();
		document.body.removeChild(a);
		setTimeout(function() {
			self.URL.revokeObjectURL(a.href);
		}, 250);
	}, 66);
}

// 从一个给定的 DOM 元素中按照微博格式提取出其中的文本内容
function extractWeiboText(div)
{
	var text = '';
	var node = div.firstChild;
	while (node) {
		if (node.nodeName == '#text') {
			text += node.textContent.trim();
		} else if (node.nodeName == 'A') {
			if (node.title) {
				text += '[' + node.title + ']';
			} else {
				text += node.innerText;
			}
		} else if (node.nodeName == 'IMG') {
			text += node.title;
		} else {
			text += node.innerText;
		}
		node = node.nextSibling;
	}
	return text.trim();
}

var results = [];

// 提取当前页面中的微博内容
function capture()
{
	// 遍历列表项
	var details = document.getElementsByClassName('WB_detail');
	for (var i=0; i < details.length; i++) {
		var detail = details[i];
		var time = '-';
		var client = '-';
		var text = '-';
		var refer = null;

		for (var j=0; j < detail.children.length; j++) {
			var div = detail.children[j];

			// 本条微博正文
			if (div.className == 'WB_text W_f14') {
				text = extractWeiboText(div);
			}

			// 被转发的原微博
			if (div.className == 'WB_feed_expand') {
				var expand = div.getElementsByClassName('WB_expand')[0];
				var info = expand.getElementsByClassName('WB_info')[0];
				if (info) {
					refer = info.firstElementChild.innerText.trim();
					refer += '\t|\t' + extractWeiboText(expand.getElementsByClassName('WB_text')[0]);
				} else {
					// 原微博已被删除
					refer = '-\t|\t' + expand.innerText.trim();
				}
			}

			// 本条微博的发布时间及客户端
			if (div.className == 'WB_from S_txt2') {
				var infos = div.getElementsByTagName('A');
				time = infos[0].innerText.trim();
				client = infos[1].innerText.trim();
			}
		}

		var result = time + '\t|\t' + client + '\t|\t' + text;
		if (refer) {
			result += '\t->\t' + refer;
		} else {
			result += '\t ';
		}
		results.push(result);
	}
	btnSave.innerHTML = '存(' + results.length + ')';

	// 自动翻到下一页
	var btnNext = document.getElementsByClassName('page next')[0]
	if (btnNext) {
		btnNext.click();
	} else {
		alert('finished.');
	}
}

function clear()
{
	results = [];
	btnSave.innerHTML = '存(0)';
}

function save()
{
	saveToFile(results.join('\r\n'), 'weibo-capture.txt', 'text/plain');
}

// 创建三个操作按钮
var divBoard = document.createElement('div');
divBoard.style.position = 'fixed';
divBoard.style.zIndex = 10000;
divBoard.style.left = '0px';
divBoard.style.top = '0px';
divBoard.style.border = '5px solid #B3D9F0';
divBoard.style.padding = '5px';
divBoard.style.backgroundColor = 'yellow';
document.body.appendChild(divBoard);

var btnCapture = document.createElement('button');
divBoard.appendChild(btnCapture);
btnCapture.innerHTML = '抓';
btnCapture.style.cursor = 'pointer';
btnCapture.addEventListener('click', capture);

var btnClear = document.createElement('button');
divBoard.appendChild(btnClear);
btnClear.innerHTML = '清';
btnClear.style.cursor = 'pointer';
btnClear.addEventListener('click', clear);

var btnSave = document.createElement('button');
divBoard.appendChild(btnSave);
btnSave.innerHTML = '存(0)';
btnSave.style.cursor = 'pointer';
btnSave.addEventListener('click', save);

// 强制滚屏到底，显示当前页的完整列表
setInterval(function() {
	window.scrollTo(0, 100000);
}, 500);

})();
