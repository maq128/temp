var Pump = require('./base.js');

Pump.description = '测试 mysql。';

Pump.connectDb();

Pump.doBiz = function(callback) {
	Pump.cnt = Pump.cnt || 1;

	console.log(Pump.cnt);

	var query = Pump.dbconn.query('SELECT * FROM p2p');

	query.on('error', function(err) {
		console.log('error', err);
	}).on('fields', function(fields) {
//		console.log('fields', fields);
	}).on('result', function(result) {
		console.log('result', result.src_type, result.product_id);
	}).on('end', function() {
		console.log('end');
	});

	setTimeout(function() {
		Pump.cnt++;
		callback(3000);
	}, Math.floor(Math.random() * 500 + 200));
};
