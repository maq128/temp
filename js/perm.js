/*
	生成全排列的算法。

	本程序可以作为 permutations & combinations 的生成器来使用。

	直接的目的是解决如下问题 —— 小学二年级的题目 :(
	
	[5]	[ ]	[ ]	[ ]		[1]
	[ ]					[ ]
	[ ]					[ ]
	[ ]	[ ]	[ ]	[ ]		[ ]
				[ ]		[ ]
				[ ]		[ ]
	[ ]	[ ]	[ ]	[ ]		[ ]

	请把 1 - 25 中的 21 个数（1 和 5 除外）分别填入上面的空格里，
	使得三个横行和三个竖行的数字之和分别都是 51。
*/

// ****************
// **** 样本池 ****
function Pool( samples )
{
	this.samples = samples;
	this.len = samples.length;
	this.flags = [];
	for (var i=0; i < this.len; i++) {
		this.flags[i] = false;
	}
}

// 在样本池中找出一个空闲的位置，并占用它
Pool.prototype.find = function(idx) {
	while (idx < this.len) {
		if (!this.flags[idx]) {
			this.flags[idx] = true;
			return idx;
		}
		idx ++;
	}
	return false;
};

// 在样本池中释放一个位置
Pool.prototype.free = function(idx) {
	if (!this.flags[idx]) {
		console.log('not used yet: ' + idx);
		throw new Exception('not used yet: ' + idx);
	}
	this.flags[idx] = false;
};

// 创建一个“排列”生成器
Pool.prototype.startPerm = function(num) {
	return new Pool.Perm(this, num);
};

// 创建一个“组合”生成器
Pool.prototype.startComb = function(num) {
	return new Pool.Comb(this, num);
};

// ************************
// **** “排列”生成器 ****
Pool.Perm = function(pool, num)
{
	this.pool = pool;
	this.ptr = [];
	for (var i=0; i < num; i++) {
		this.ptr[i] = -1;
	}
};

// 获取当前“排列”的序列
Pool.Perm.prototype.values = function()
{
	var values = [];
	for (var i=0; i < this.ptr.length; i++) {
		values[i] = this.pool.samples[this.ptr[i]];
	}
	
	return values;
}

// 获取一个“排列”
Pool.Perm.prototype.next = function()
{
	return this.nextHelper(this.ptr.length - 1);
}
Pool.Perm.prototype.nextHelper = function(pos)
{
	// 释放本节点
	if (this.ptr[pos] >= 0) {
		this.pool.free(this.ptr[pos]);
	}

	var from = -1;

	if (this.ptr[pos] < 0) {
		// 首次出发
		if (pos > 0) {
			if (this.nextHelper(pos - 1) === false) {
				return false;
			}
		}
		// 本节点从头开始
		from = 0;
	} else {
		// 本节点继续向下找
		from = this.ptr[pos] + 1;
	}

	var idx = this.pool.find(from);
	if (idx === false && pos > 0) {
		if (this.nextHelper(pos - 1) === false) {
			return false;
		}
		idx = this.pool.find(0);
	}
	if (idx === false) {
		return false;
	}

	this.ptr[pos] = idx;
	return true;
}

// ************************
// **** “组合”生成器 ****
Pool.Comb = function(pool, num)
{
	this.pool = pool;
	this.ptr = [];
	for (var i=0; i < num; i++) {
		this.ptr[i] = -1;
	}
};

// 获取当前“组合”的序列
Pool.Comb.prototype.values = function()
{
	var values = [];
	for (var i=0; i < this.ptr.length; i++) {
		values[i] = this.pool.samples[this.ptr[i]];
	}

	return values;
}

// 获取当前“组合”的和数
Pool.Comb.prototype.sum = function()
{
	var values = this.values();
	var sum = 0;
	for (var i=0; i < values.length; i++) {
		sum += values[i];
	}
	return sum;
}

// 获取一个“组合”
Pool.Comb.prototype.next = function()
{
	return this.nextHelper(this.ptr.length - 1) !== false;
}
Pool.Comb.prototype.nextHelper = function(pos)
{
	// 先不要释放本节点，避免被上级节点挤压

	var from = -1;

	if (this.ptr[pos] < 0) {
		// 首次出发
		if (pos > 0) {
			if (this.nextHelper(pos - 1) === false) {
				return false;
			}
		}
		// 本节点从头开始
		from = 0;
	} else {
		// 本节点继续向下找
		from = this.ptr[pos] + 1;
	}

	var idx = this.pool.find(from);
	if (idx === false && pos > 0) {
		from = this.nextHelper(pos - 1);
		// 递归完成后释放本节点
		if (this.ptr[pos] >= 0) {
			this.pool.free(this.ptr[pos]);
		}
		if (from === false) {
			return false;
		}
		idx = this.pool.find(from + 1);
	} else {
		// 释放本节点
		if (this.ptr[pos] >= 0) {
			this.pool.free(this.ptr[pos]);
		}
	}
	if (idx === false) {
		return false;
	}

	this.ptr[pos] = idx;
	return idx;
}

/*
	5	a	a	a		1
	b					f
	b					f
	x	c	c	x		f
				d		f
				d		f
	e	e	e	x		f
*/
var t0 = new Date().getTime();

var cnt = 0;
var pool = new Pool([2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]);

var f = pool.startComb(6);
toploop:
while (f.next()) {
	if (f.sum() != 51 - 1) continue;
	var perm = pool.startPerm(3);
	while (perm.next()) {
		var x = perm.values();
		var a = pool.startComb(3);
		while (a.next()) {
			if (a.sum() != 51 - 5) continue;
			var b = pool.startComb(2);
			while (b.next()) {
				if (b.sum() != 51 - 5 - x[0]) continue;
				var c = pool.startComb(2);
				while (c.next()) {
					if (c.sum() != 51 - x[0] - x[1]) continue;
					var d = pool.startComb(2);
					while (d.next()) {
						if (d.sum() != 51 - x[1] - x[2]) continue;
						var e = pool.startComb(3);
						while (e.next()) {
							if (e.sum() != 51 - x[2]) continue;
							var out = [].concat(a.values(), '[5]', b.values(), '['+x[0]+']', c.values(), '['+x[1]+']', d.values(), '['+x[2]+']', e.values(), '--', '[1]', f.values());
							console.log(out.join('  '));
							cnt ++;
							//if (cnt>=100) break toploop;
						}
					}
				}
			}
		}
	}
}

var t1 = new Date().getTime();

console.log('总共 ' + cnt + ' 条符合要求的答案');
console.log('耗时 ' + (t1 - t0)/1000 + ' 秒');
