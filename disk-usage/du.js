var fs = require('fs');

String.prototype.padding = function(width) {
	var s = ' '.repeat(width) + this;
	return s.substring(s.length - width);
};

String.prototype.comma = function(width) {
	var segs = [];
	s = this;
	while (s.length > width) {
		segs.unshift(s.substr(s.length - width));
		s = s.substr(0, s.length - width);
	}
	if (s.length > 0) {
		segs.unshift(s);
	}
	return segs.join(',');
};

// helps
if (process.argv.length <= 2) {
	console.log('Usage:');
	console.log('    node du.js <dir> [,<depth>]');
	console.log('');
	console.log('Example:');
	console.log('    node du.js "C:/" > du.log');
	process.exit();
}

// command line parameters
var depth = parseInt(process.argv[3]);
if (isNaN(depth)) depth = 100;

var path = fs.realpathSync(process.argv[2]);
var stats = fs.statSync(path);
if (!stats.isDirectory()) {
	console.error('Not a directory !');
	process.exit();
}

var info = usage(path, 0);
clearCurrentLine(process.stderr);

print(info, 0);
process.stderr.write('\r\nfinished.\r\n');

function usage(fullpath, level)
{
	clearCurrentLine(process.stderr);
	process.stderr.write(fullpath);

	var info = {
		subdirs: [],
		files: [],
		filenum: 0,
		dirnum: 0,
		size: 0
	};

	try {
		fs.readdirSync(fullpath).forEach(function(subname) {
			var subpath = fullpath + '/' + subname;
			try {
				var stats = fs.statSync(subpath);
			} catch (e) {
				return;
			}

			if (stats.isFile()) {

				// for files
				var fileinfo = {
					name: subname,
					size: stats.size
				};
				info.size += fileinfo.size;
				info.filenum ++;
				info.files.push(fileinfo);

			} else if (stats.isDirectory()) {

				// for sub-directories
				var dirinfo = usage(subpath, level + 1);
				dirinfo.name = subname;
				info.size += dirinfo.size;
				info.dirnum += dirinfo.dirnum + 1;
				info.filenum += dirinfo.filenum;
				info.subdirs.push(dirinfo);
			}
		});
	} catch (e) {
	}

	info.subdirs.sort(function(a, b) {
		if (a.size > b.size) return -1;
		if (a.size < b.size) return 1;
		return 0;
	});
	info.files.sort(function(a, b) {
		if (a.size > b.size) return -1;
		if (a.size < b.size) return 1;
		return 0;
	});

	return info;
}

function clearCurrentLine(stream)
{
	// ref: https://github.com/fknsrs/jetty/blob/master/index.js
	stream.write(Buffer([0x1b, 0x5b]));
	stream.write('H');
	stream.write(Buffer([0x1b, 0x5b]));
	stream.write('K');
}

function print(info, level)
{
	if (level == 0) {
		console.log('size'.padding(16), 'files'.padding(10), '', 'name');
		console.log('----------'.padding(16), '--------'.padding(10), '', '----------');
	}

	info.subdirs.forEach(function(subinfo) {
		if (level >= depth) {
			console.log(('' + subinfo.size).comma(3).padding(16), ('' + subinfo.filenum).padding(10), '   '.repeat(level), '/' + subinfo.name + '/...');
			return;
		}
		console.log(('' + subinfo.size).comma(3).padding(16), ('' + subinfo.filenum).padding(10), '   '.repeat(level), '/' + subinfo.name);
		print(subinfo, level + 1);
	});
	info.files.forEach(function(fileinfo) {
		console.log(('' + fileinfo.size).comma(3).padding(16), ''.padding(10), '   '.repeat(level), fileinfo.name);
	});

	if (level == 0) {
		console.log('total:');
		console.log(('' + info.size).comma(3).padding(16), ('' + info.filenum).padding(10), '', info.dirnum + ' dirs');
	}
}
