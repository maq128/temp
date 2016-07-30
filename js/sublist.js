/*
【题目】

给定一个整数数组，希望在其中找到两个不重叠的连续子序列，使其各自的元素和的差值最大。

【示例】

给定 [2, -1, -2, 1, -4, 2, 8]，符合要求的两个子序列为 [-1, -2, 1, -4] 和 [2, 8]，差值为 16

【解题思路】

首先解决一个初级问题：给定一个整数数组，希望在其中找到一个连续的子序列，其元素和为最大。下面代码中 getMaxList() 即是完成这个任务。

在此基础上考虑：N 棵树有 N-1 个空，每个空都会把这 N 棵树分隔成独立的两排。

把给定数组分隔成两个子数组，分别找到最大（最小）子序列，求出差值。遍历所有分隔方式，比较每种方式的差值，找到最大。
*/

// 在 arr 数组的 [from, to] 区间查找“最优子序列”
// sign = 1 时结果为“和最大子序列”
// sign = -1 时结果为“和最小子序列”
function getMaxList(arr, from, to, sign)
{
	var maxList = {
		begin: from,
		end: from,
		sum: arr[from] * sign
	};
	var curList = {
		begin: from,
		end: from,
		sum: arr[from] * sign
	};
	for (var i = from + 1; i <= to; i++) {
		if (curList.sum <= 0) {
			curList.begin = i
			curList.end = i
			curList.sum = arr[i] * sign;
		} else {
			curList.end = i
			curList.sum += arr[i] * sign;
		}
		if (maxList.sum < curList.sum) {
			maxList.begin = curList.begin;
			maxList.end = curList.end;
			maxList.sum = curList.sum;
		}
	}
	maxList.sum *= sign;
	return maxList;
}

var a = [2, -1, -2, 1, -4, 2, 8];
var maxDiff = 0;
var maxLeft, maxRight;
for (var i = 1; i <= a.length - 1; i++) {
	var left = getMaxList(a, 0, i - 1, -1);
	var right = getMaxList(a, i, a.length - 1, 1);
	var diff = Math.abs(left.sum - right.sum);
	if (maxDiff < diff) {
		maxDiff = diff;
		maxLeft = left;
		maxRight = right;
	}

	left = getMaxList(a, 0, i - 1, 1);
	right = getMaxList(a, i, a.length - 1, -1);
	diff = Math.abs(left.sum - right.sum);
	if (maxDiff < diff) {
		maxDiff = diff;
		maxLeft = left;
		maxRight = right;
	}
}
console.log(maxDiff, maxLeft, maxRight);
