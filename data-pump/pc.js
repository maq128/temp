/**
	pump container

	PumpContainer 外部接口：以 HTTP 形式提供以下访问接口 -

		shutdown- 关闭整个容器并退出（比直接杀进程好一点，会尽量通知所有 pump 友好退出）

		mods	- 列出所有可用的 pump 模块，及其所有实例的运行状况报告

		load	- 加载一个指定的 pump

		unload	- 卸载一个指定的 pump

	PumpContainer 与 pump 之间的通信接口 -

		-> command: start

		-> command: stop

		<- notify: stopped

		-> command: report
*/

require("collections/shim-object");
var backgrounder = require("backgrounder");
var Dict = require("collections/dict");
var http = require('http');
var fs = require('fs');
var util = require('util');
var Promise = require('promise');

// 避免因简单失误导致程序退出
process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
});

var PumpContainer = {
	pumps: new Dict()
};

// 装载 pump
PumpContainer.load = function(mod_name, onLoaded) {
	var pump = backgrounder.spawn(__dirname + '/pumps/' + mod_name + '.pump.js', {
		// pump config
		'children-count': 1,
		'auto-restart'	: false
	}, function(pump) {
		// 在容器中添加 pump 记录
		pump.id = Object.hash(pump);
		pump.mod_name = mod_name;
		PumpContainer.pumps.set(pump.id, pump);

		// 接收 pump 发来的消息
		pump.on("message", function(message) {
			if (message.notify == 'stopped') {
				// pump 发来“已停止”通知
				pump.terminate();
			}
		});

		// 加载完成后立即发送“启动”命令
		pump.send({
			command: 'start'
		});

		if (typeof(onLoaded) == 'function') {
			onLoaded(pump);
		}
	});
	return pump;
};

// 卸载 pump
PumpContainer.unload = function(pump_id, onUnloaded) {
	var pump = PumpContainer.pumps.get(pump_id);
	if (!pump) return;

	// 等待卸载完成
	pump.on("message", function(message) {
		if (message.notify == 'stopped') {
			if (typeof(onUnloaded) == 'function') {
				onUnloaded(pump_id);
			}
		}
	});

	// 向 pump 发送“停止”命令
	pump.send({
		command: 'stop'
	});

	// 从容器中删除 pump 记录
	PumpContainer.pumps['delete'](pump_id);
	return pump;
};

// 关闭 pump container
PumpContainer.shutdown = function(onFinish) {
	var onUnloadedOne = function() {
		if (PumpContainer.pumps.length > 0) return;
		if (typeof(onFinish) == 'function') {
			onFinish();
		}
	};
	PumpContainer.pumps.forEach(function(value, pump_id, object, depth) {
		PumpContainer.unload(pump_id, onUnloadedOne);
	});
	onUnloadedOne();
};

// 创建 HTTP 服务
var server = http.createServer();
server.listen(8509, 'localhost');

// 接收 pump manager 的请求
server.on('request', function(req, resp) {
    // 当收到 body 数据时...
    var body = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        body += chunk;
    });

    // 当收到“request 完毕”信号时...
    req.on('end', function() {
        var promis = dispatchRequest(req, body, resp);
        promis.then(function() {
            resp.end();
            req.connection.destroy();
        });
    });

    // 当发现连接关闭时...
    req.on('close', function(error) {
        console.log('close');
        // TODO: 如何处理？
    });

    // 当发生错误时...
    req.on('error', function(error) {
        console.log('error');
        // TODO: 如何处理？
    });
});

function dispatchRequest(req, body, resp)
{
	var tokens = req.url.split('/');

	if (tokens[1] == 'shutdown') {
		return doShutdown(req, resp);
	}

	if (tokens[1] == 'mods') {
		return doMods(req, resp);
	}

	if (tokens[1] == 'load' && tokens.length == 3) {
		return doLoad(req, resp, tokens[2]);
	}

	if (tokens[1] == 'unload' && tokens.length == 3) {
		return doUnload(req, resp, tokens[2]);
	}

	return new Promise(function (resolve, reject) {
		resp.write('false');
		resolve(true);
	});
}

function doShutdown(req, resp)
{
	return new Promise(function(resolve) {
		resp.end('true');
		PumpContainer.shutdown(function() {
			process.exit();
		});
	});
}

var readdir = Promise.denodeify(fs.readdir);

function doMods(req, resp)
{
	var mods = [];
	return readdir(__dirname + '/pumps/')
		// 从文件系统得到模块文件列表
		.then(function(files) {
			if (util.isArray(files)) {
				files.forEach(function(filename) {
					var suffix = filename.substring(filename.length - 8);
					if (suffix != '.pump.js') return;
					mods.push({
						name: filename.substring(0, filename.length - 8),
						instances: []
					});
				});
			}
			return true;
		})

		// 查询所有的实例
		.then(function() {
			// 并行发送查询消息，合并结果，收集完成后再继续下一步
			var queries = [];
			PumpContainer.pumps.forEach(function(pump, pump_id, object, depth) {
				var promise = new Promise(function (resolve, reject) {
					pump.send({
						command: 'report'
					}, function(report) {
						mods.forEach(function(mod) {
							if (mod.name == pump.mod_name) {
								report.mod_name = pump.mod_name;
								report.id = pump_id;
								mod.instances.push(report);
							}
						});
						resolve(true);
					});
				});
				queries.push(promise);
			});
			return Promise.all(queries);
		})

		// 输出响应内容
		.then(function() {
			resp.setHeader('Content-Type', 'application/json');
			resp.write(JSON.stringify(mods));
			return true;
		});
}

function doLoad(req, resp, mod_name)
{
	return new Promise(function(resolve) {
		PumpContainer.load(mod_name, function(pump) {
			resolve(true);
		});
	});
}

function doUnload(req, resp, pump_id)
{
	return new Promise(function(resolve) {
		PumpContainer.unload(pump_id, function(pump_id) {
			resolve(true);
		});
	});
}
