var Const = require('./constants.js');

var Pump = {};

// pump 的当前状态
Pump.status = Const.STATUS.LOADED;

// pump 的装载时间
Pump.tLoad = new Date();

// pump 最近一次执行开始的时间（null 表示尚未执行过）
Pump.tLastRunStart = null;

// pump 最近一次执行所消耗的时间（毫秒数）（-1 表示尚未执行完成）
Pump.msLastRunCost = -1;

// 预计下一次执行开始的时间（null 表示尚未预约）
Pump.tNextRun = null;

// 自装载后累计的执行次数
Pump.nRunCount = 0;

// timeoutObject 下一轮次执行时间
Pump.timerRun = null;

// 进程创建之初接收 config 信息
Pump.onConfig = function(config, callback) {
	if (typeof(callback) == 'function') {
		callback();
	}
};

// 启用数据库连接
// 注意：由于可能因连接中断而重新连接，所以 Pump.dbconn 对象可能会重新创建，
// 所以 pump 代码应该每次直接使用 Pump.dbconn 进行数据库操作。
Pump.connectDb = function() {
	var mysql = require('mysql');
	Pump.dbconn = mysql.createConnection({
		host: 'localhost',
		port: 3306,
		user: 'root',
		password: 'n7d9k2s5',
		database: 'tuzi'
	});

	Pump.dbconn.config.queryFormat = function (query, values) {
		if (!values) return query;
		return query.replace(/\:(\w+)/g, function (txt, key) {
				if (values.hasOwnProperty(key)) {
					return this.escape(values[key]);
				}
				return txt;
			}.bind(this));
	};

	Pump.dbconn.inertOrDiscard = function(tbl, row) {
console.log('insert', row.product_id, row.status);
		var fields = [];
		var values = [];
		for (var field in row) {
			fields.push(mysql.escapeId(field));
			values.push(':' + field);
		}
		Pump.dbconn.query('INSERT IGNORE INTO ' + mysql.escapeId(tbl) + ' (' + fields.join(',') + ') VALUES(' + values.join(',') + ')', row);
	};

	Pump.dbconn._update = function(tbl, upd, criteria) {
console.log('update', JSON.stringify(upd), JSON.stringify(criteria));
		var params = {};
		var sets = [];
		var conds = [];
		for (var field in upd) {
			sets.push(mysql.escapeId(field) + '=:' + field);
			params[field] = upd[field];
		}
		for (var field in criteria) {
			conds.push(mysql.escapeId(field) + '=:' + field);
			params[field] = criteria[field];
		}
		Pump.dbconn.query('UPDATE ' + mysql.escapeId(tbl) + ' SET ' + sets.join(',') + ' WHERE ' + conds.join(' AND '), params);
	};

	Pump.dbconn.on('error', function(err) {
		if (err.code == 'PROTOCOL_CONNECTION_LOST') {
			Pump.connectDb();
			return;
		}
		Pump.dbconn = null;
	});

	Pump.dbconn.connect();
};

// 接收 message
Pump.onMessage = function(message, callback) {
	if (message.command == 'start') {

		Pump.requireStart();

	} else if (message.command == 'stop') {

		Pump.requireStop();

	} else if (message.command == 'report') {

		// 报告运行状态
		if (typeof(callback) == 'function') {
			callback(Pump.buildReport());
		}
	}
};

// 申请启动
Pump.requireStart = function()
{
	if (Pump.status == Const.STATUS.LOADED) {
		Pump.status = Const.STATUS.IDLE;
		Pump.timerRun = setTimeout(Pump.run, 100);
		Pump.tNextRun = new Date(new Date().getTime() + 100);
	}
};

// 申请停止
Pump.requireStop = function()
{
	if (Pump.status == Const.STATUS.STOPPING || Pump.status == Const.STATUS.STOPPED) {
		return;
	}

	// 如果正在执行，则只做标记
	if (Pump.status == Const.STATUS.RUNNING) {
		Pump.status = Const.STATUS.STOPPING;
		return;
	}

	// 遇到空闲则直接停止
	Pump.doStop();
};

// 停止
Pump.doStop = function()
{
	if (Pump.status == Const.STATUS.STOPPED) {
		return;
	}
	Pump.status = Const.STATUS.STOPPED;

	if (Pump.timerRun) {
		clearTimeout(Pump.timerRun);
		Pump.timerRun = null;
		Pump.tNextRun = null;
	}

	// 清理工作
	Pump.onBeforeStop();

	// 关闭数据库连接
	if (Pump.dbconn) {
		Pump.dbconn.destroy();
		Pump.dbconn = null;
	}

	// 通知 pump container 已经停止，可以 terminate() 了。
	process.send({
		notify: 'stopped'
	});
};

// 主程序接力执行
Pump.run = function()
{
	if (Pump.status != Const.STATUS.LOADED && Pump.status != Const.STATUS.IDLE) {
		return;
	}

	Pump.status = Const.STATUS.RUNNING;
	Pump.timerRun = null;
	Pump.tNextRun = null;
	Pump.tLastRunStart = new Date();
	Pump.msLastRunCost = -1;
	Pump.nRunCount ++;

	// 执行重载的业务逻辑
	Pump.doBiz(function(interval) {
		Pump.msLastRunCost = new Date().getTime() - Pump.tLastRunStart.getTime();

		// 检查是否需要停止
		if (Pump.status == Const.STATUS.STOPPING) {
			Pump.doStop();
			return;
		}

		Pump.status = Const.STATUS.IDLE;

		if (interval >= 0) {
			// 预约下一轮执行
			Pump.timerRun = setTimeout(Pump.run, interval);
			Pump.tNextRun = new Date(new Date().getTime() + interval);
		} else {
			// 停止接力
		}
	});
};

// 生成运行状态报告
Pump.buildReport = function()
{
	return {
		description		: Pump.description,
		status			: Pump.status,
		tLoad			: Pump.tLoad,
		tLastRunStart	: Pump.tLastRunStart,
		msLastRunCost	: Pump.msLastRunCost,
		tNextRun		: Pump.tNextRun,
		nRunCount		: Pump.nRunCount
	};
};

process.on('config', Pump.onConfig);
process.on('message', Pump.onMessage);

module.exports = Pump;

// ---- 以下为每个 pump 需要重载实现的内容 ---------------------------

// pump 的简要说明
// @virtual
Pump.description = '';

// 执行业务逻辑
// @virtual
// @param callback 在一轮处理完成后，必需调用 callback，并传入一个
//			毫秒数预约下一轮执行时间（-1 表示不再执行）
Pump.doBiz = function(callback) {
	callback(1000);
};

// 结束前触发执行
// @virtual
Pump.onBeforeStop = function() { };
