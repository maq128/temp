/**
	pump for http://list.lufax.com/list/listing
*/

var http = require('client-http');
var querystring = require('querystring');
var util = require('util');
var Pump = require('./base.js');

Pump.description = '陆金所网标采集模块。';

Pump.connectDb();

// 需关注的项目记录
var hot_rows = null;

function dump_hots()
{
	var x1 = [];
	for (var id in hot_rows.openning) {
		x1.push(id);
	}
	console.log('openning:', x1.join(' '));

	var x2 = [];
	for (var id in hot_rows.closed) {
		x2.push(id);
	}
	console.log('closed  :', x2.join(' '));
}

// 对最近两天发布的项目进行关注
var today_num = Math.floor(new Date().getTime() / 1000 / 86400);
Pump.dbconn.query('SELECT * FROM p2p WHERE src_type = 1 AND publish_day >= ' + (today_num - 1), function(err, rows, fields) {
	if (util.isArray(rows)) {
		hot_rows = {
			openning: {},
			closed: {}
		};
		rows.forEach(function(row, idx) {
			if (row.status == 1) {
				hot_rows.openning[row.product_id] = row;
			} else if (row.status == 2) {
				hot_rows.closed[row.product_id] = row;
			}
		});
//		dump_hots();
	}
});

// 把抓取到的数据结构转化为标准数据存储结构
function item2row(item)
{
	var dtPublish = new Date(item.publishedAt + ' ' + item.publishAtDateTime);
	var row = {
		src_type: 1,
		product_id: item.productId,
		product_title: item.productNameDisplay + item.code,
		status: item.productStatus == 'ONLINE' ? 1 : (item.productStatus == 'DONE' ? 2 : 0),
		invest_amount: item.price,
		remain_amount: item.remainingAmount,
		interest_rate: item.interestRate,
		invest_period_unit: item.investPeriodUnitDisplay == '日' ? 1 : (item.investPeriodUnitDisplay == '月' ? 2 : (item.investPeriodUnitDisplay == '年' ? 3 : 0)),
		invest_period: item.investPeriod,
		publish_time: Math.floor(dtPublish.getTime() / 1000),
		publish_day:  Math.floor(dtPublish.getTime() / 1000 / 86400)
	};
	return row;
}

Pump.doBiz = function(callback) {
	// 确保初始化完成
	if (!hot_rows) {
		callback(2000);
		return;
	}

	var qs = querystring.stringify({
		minAmount: 0,
		maxAmount: 100000000,
		minInstalments: 1,
		maxInstalments: 240,
		collectionMode: '',
		productName: '',
		column: 'publishedAt',
		order: 'desc',
		isDefault: true,
		isPromotion: '',
		pageLimit: 30,
		_: new Date().getTime()
	});

	http.request('http://list.lufax.com/list/service/product/listing/1?' + qs, function(data, err){
		if (data) {
			// 网络正常……
			if (parseData(data)) {
				// 数据正常
				cleanup();
				callback(2000);
			} else {
				// 数据问题
				callback(-1);
			}
		} else {
			// 网络问题
			callback(10000);
		}
	}, null, { 'X-Requested-With': 'XMLHttpRequest' });
};

// 解析抓取到的页面数据
function parseData(data)
{
	try {
		var data = JSON.parse(data);
		var list = data.data;
		if (util.isArray(list)) {
			list.forEach(function(item, idx) {
				// 滤掉不感兴趣的项目类型
				// 07投资 / 06竞拍 / 00？
				if (item.tradingMode != '07' && item.tradingMode != '00') return;

				// 滤掉“新客”项目
				if (item.isForNewUser) return;

				// 转换成标准记录格式
				var row = item2row(item);

				// “可投”项目
				if (row.status == 1) {
					// 已经在关注的“可投”项目，需更新“关键变动”
					if (hot_rows.openning[row.product_id] != undefined) {
						if (hot_rows.openning[row.product_id].remain_amount != row.remain_amount) {
							Pump.dbconn.update('p2p', {
								remain_amount: row.remain_amount
							}, {
								src_type: row.src_type,
								product_id: row.product_id
							});
						}
						return;
					}

					// 已经在关注的“不可投”项目，此种情况不应该出现！！！
					if (hot_rows.closed[row.product_id] != undefined) {
						return;
					}

					// 新出现的
					hot_rows.openning[row.product_id] = row;
					Pump.dbconn.inertOrDiscard('p2p', row);
					return;
				}

				// “不可投”项目
				if (row.status == 2) {
					// 已经在关注的“可投”项目
					if (hot_rows.openning[row.product_id] != undefined) {
						delete hot_rows.openning[row.product_id];
						hot_rows.closed[row.product_id] = row;

						Pump.dbconn._update('p2p', {
							status: row.status,
							remain_amount: row.remain_amount
						}, {
							src_type: row.src_type,
							product_id: row.product_id
						});
						return;
					}

					// 已经在关注的“不可投”项目，跳过
					if (hot_rows.closed[row.product_id] != undefined) {
						return;
					}

					// 新出现的（数据库中记录欠缺时会出现此种情况）
					hot_rows.closed[row.product_id] = row;
					Pump.dbconn.inertOrDiscard('p2p', row);
					return;
				}
			});
		}
	} catch(e) { }

	return true;
}

// 清理“关注”列表，剔除过期记录
function cleanup()
{
//	dump_hots();
	var day_num = Math.floor(new Date().getTime() / 1000 / 86400);
	if (day_num <= today_num) return;
	day_num --;
	for (var product_id in hot_rows.closed) {
		var row = hot_rows.closed[product_id];
		if (row.publish_day < day_num) {
			delete hot_rows.closed[product_id];
		}
	}
}
