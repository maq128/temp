var Winreg = require('winreg');
var Promise = require('promise');

var entries = [];

Promise.resolve(true)
.then(function() {
	return searchEntries(Winreg.HKCU, '\\Software\\PremiumSoft\\Data');
})
.then(function() {
	return searchEntries(Winreg.HKCU, '\\Software\\Classes\\CLSID');
})
.then(function(res) {
	console.log('Windows Registry Editor Version 5.00');
	console.log('');
	for (var i in entries) {
		var key = entries[i];
		console.log('[-HKEY_CURRENT_USER' + key + ']');
		console.log('');
	}
});

function searchEntries(hive, key)
{
	return new Promise(function (resolve, reject) {
		var regKey = new Winreg({
			hive: hive,
			key: key
		});

		regKey.keys(function (err, keys) {
			if (err) {
				reject(err);
				return;
			}

			var p = Promise.resolve(true);
			for (var i in keys) {
				p = checkKey(keys[i], p);
			}
			p.then(function() {
				resolve(true);
			});
		});
	});
}

function checkKey(key, p)
{
	return new Promise(function (resolve, reject) {
		p.then(function() {
			key.keys(function (err, subkeys) {
				if (err) {
					reject(err);
					return;
				}

				resolve(true);
				if (subkeys.length != 1) return;
				if (subkeys[0].key.substr(-5) != '\\Info') return;
				entries.push(key.key);
			});
		});
	});
}
