var Pump = require('./base.js');

Pump.description = '测试用的数据采集模块，间隔3秒空跑一次。';

Pump.doBiz = function(callback) {
	Pump.cnt = Pump.cnt || 1;
	setTimeout(function() {
		Pump.cnt++;
		callback(3000);
	}, Math.floor(Math.random() * 500 + 200));
};
