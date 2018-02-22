<?php
// 推箱子
// http://zhushou.360.cn/detail/index/soft_id/750360

error_reporting(E_ERROR | E_CORE_ERROR | E_USER_ERROR);

define('BOARD_MAX_X', 6);
define('BOARD_MAX_Y', 9);

$puzzles = [
	'火星 23' => [
		'.......',
		'.......',
		'.......',
		'.......',
		'....G..',
		'..G.R..',
		'..G.R..',
		'..R.G..',
		'..G.R..',
		'..G.R..',
	],

	'火星 24' => [
		'.......',
		'.......',
		'.......',
		'.......',
		'.B.....',
		'.YBY...',
		'.SSB...',
		'.WWS...',
		'.RRW...',
		'.RYW.WW',
	],

	'金星 23' => [
		'.......',
		'.......',
		'...Y...',
		'...W...',
		'..YRW..',
		'..BRS..',
		'..BGS..',
		'..GBG..',
		'.YSRBW.',
		'.SBSSB.',
	],

	'彗星 20' => [ // 此关只能找到最少 5 步的解法，无法过关 :(
		'.......',
		'.......',
		'.......',
		'...R...',
		'...R...',
		'...G...',
		'..GRG..',
		'..RGR..',
		'..RGR..',
		'.GGRGG.',
	],
];

function loadPuzzle($name) {
	global $puzzles;
	$puzzle = $puzzles[$name];
	$lines = array_reverse($puzzle);

	$idx = 0;
	$boxes = [];
	$board = [];
	$counter = [];
	foreach (range(0, BOARD_MAX_X) as $x) {
		foreach (range(0, BOARD_MAX_Y) as $y) {
			$color = $lines[$y][$x];
			if ($color >= 'A' && $color <= 'Z') {
				$boxes[$idx] = [$color, $x, $y];
				$board[$x][$y] = $idx ++;
				$counter[$color] ++;
			}
		}
	}

	return [$boxes, $board, $counter];
}

/*
 * 递归求解。
 * 返回 true 表示找到解法，否则返回 false。
 */
function resolve($boxes, $board, $counter, $steps, $mvIdx, $mvDir = null) {
	// 移动一步
	$otherBoxIdx = null;
	if (isset($mvDir)) {
		$x = $boxes[$mvIdx][1];
		$y = $boxes[$mvIdx][2];
		switch ($mvDir) {
		case 'left':
			if ($x <= 0) return false; // 左边界
			$otherBoxIdx = $board[$x - 1][$y];
			if (isset($otherBoxIdx)) {
				if ($boxes[$otherBoxIdx][0] === $boxes[$mvIdx][0]) return false; // 相同颜色时无效移动
				$boxes[$otherBoxIdx][1] ++;
				$board[$x][$y] = $otherBoxIdx;
			} else {
				unset($board[$x][$y]);
			}
			$boxes[$mvIdx][1] --;
			$board[$x - 1][$y] = $mvIdx;
			break;

		case 'right':
			if ($x >= BOARD_MAX_X) return false; // 右边界
			$otherBoxIdx = $board[$x + 1][$y];
			if (isset($otherBoxIdx)) {
				if ($boxes[$otherBoxIdx][0] === $boxes[$mvIdx][0]) return false; // 相同颜色时无效移动
				$boxes[$otherBoxIdx][1] --;
				$board[$x][$y] = $otherBoxIdx;
			} else {
				unset($board[$x][$y]);
			}
			$boxes[$mvIdx][1] ++;
			$board[$x + 1][$y] = $mvIdx;
			break;

		case 'up':
			if ($y >= BOARD_MAX_Y) return false; // 上边界
			$otherBoxIdx = $board[$x][$y + 1];
			if (!isset($otherBoxIdx)) return false; // 向上只能对换，不能悬空
			if ($boxes[$otherBoxIdx][0] === $boxes[$mvIdx][0]) return false; // 相同颜色时无效移动
			$boxes[$otherBoxIdx][2] --;
			$board[$x][$y] = $otherBoxIdx;
			$boxes[$mvIdx][2] ++;
			$board[$x][$y + 1] = $mvIdx;
			break;

		case 'down':
			if ($y <= 0) return false; // 下边界
			$otherBoxIdx = $board[$x][$y - 1];
			if (!isset($otherBoxIdx)) return false; // 悬空？！
			if ($boxes[$otherBoxIdx][0] === $boxes[$mvIdx][0]) return false; // 相同颜色时无效移动
			$boxes[$otherBoxIdx][2] ++;
			$board[$x][$y] = $otherBoxIdx;
			$boxes[$mvIdx][2] --;
			$board[$x][$y - 1] = $mvIdx;
			break;
		}
	}

	// 处理移动后产生的效果
	$changed = false;
	$firstRound = true;
	while (true) {
		// 悬空的箱子坠落
		$falling = false;
		foreach (range(0, BOARD_MAX_X) as $x) {
			if (count($board[$x]) == 0) continue;
			$column = [];
			$height = 0;
			foreach ($board[$x] as $y => $idx) {
				$column[$height] = $idx;
				if ($height !== $y) {
					$falling = true;
					$boxes[$idx][2] = $height;
				}
				$height ++;
			}
			$board[$x] = $column;
		}
		if ($falling) $changed = true;

		// 若非第一轮，无坠落则退出循环
		if (!$firstRound && !$falling) break;
		$firstRound = false;

		// 超过 3 个箱子连成直线则一起爆掉
		// 算法：遍历每个箱子，若其与两侧（左右，或上下）颜色相同，则 3 个一起爆掉
		$blast = [];
		foreach ($boxes as $idx => $box) {
			$x = $boxes[$idx][1];
			$y = $boxes[$idx][2];

			$idxA = $board[$x - 1][$y];
			$idxB = $board[$x + 1][$y];
			if (isset($idxA) && isset($idxB) && $boxes[$idxA][0] === $box[0] && $boxes[$idxB][0] === $box[0]) {
				$blast[$idxA] = true;
				$blast[$idxB] = true;
				$blast[$idx] = true;
			}
			$idxA = $board[$x][$y - 1];
			$idxB = $board[$x][$y + 1];
			if (isset($idxA) && isset($idxB) && $boxes[$idxA][0] === $box[0] && $boxes[$idxB][0] === $box[0]) {
				$blast[$idxA] = true;
				$blast[$idxB] = true;
				$blast[$idx] = true;
			}
		}

		// 如果没有箱子爆掉则退出循环
		if (empty($blast)) break;
		$changed = true;

		// 清除爆掉的箱子
		foreach ($blast as $idx => $true) {
			$box = $boxes[$idx];
			unset($boxes[$idx]);
			unset($board[$box[1]][$box[2]]);
			$counter[$box[0]] --;
		}

		// 若无剩余的箱子，则求解成功
		if (count($boxes) == 0) return true;
	}

	// 若步数已用尽，则此路径无解
	if ($steps <= 0) return false;

	// 若某种颜色的箱子剩余数量不足 3 个，则此路径已然无解
	foreach ($counter as $color => $cnt) {
		if ($cnt < 3) return false;
	}

	// 遍历每个箱子的 4 个移动方向，递归求解
	foreach ($boxes as $idx => $box) {
		foreach (['left', 'right', 'up', 'down'] as $dir) {
			// 排除同一个箱子简单来回移动
			if (!$changed && $idx === $mvIdx) {
				if ($mvDir === 'left' && $dir === 'right') continue;
				if ($mvDir === 'right' && $dir === 'left') continue;
				if ($mvDir === 'up' && $dir === 'down') continue;
				if ($mvDir === 'down' && $dir === 'up') continue;
			}
			if (!$changed && $idx === $otherBoxIdx && $mvDir === $dir) continue;

			// 递归求解，若成功，则输出此步走法（最终输出为倒序），递归结束
			if (resolve($boxes, $board, $counter, $steps - 1, $idx, $dir)) {
				echo "  ({$box[1]}, {$box[2]}) - {$dir}\n";
				return true;
			}
		}
	}
	return false;
}

function printPuzzle($boxes, $board) {
	$lines = [];
	foreach (range(BOARD_MAX_Y, 0, -1) as $y) {
		$line = $y;
		foreach (range(0, BOARD_MAX_X) as $x) {
			$idx = $board[$x][$y];
			$line .= ' ' . (isset($idx) ? $boxes[$idx][0] : '.');
		}
		$lines[] = $line;
	}
	$lines[] = '  ' . implode(' ', range(0, BOARD_MAX_X));
	echo implode("\n", $lines) . "\n\n";
	echo 'total: ' . count($boxes) . " boxes\n\n";
}

// 数据结构初始化
list($boxes, $board, $counter) = loadPuzzle('彗星 20');
printPuzzle($boxes, $board);

// 探索最多 5 步的解法
foreach (range(1, 5) as $maxSteps) {
	$t0 = time();
	$succ = resolve($boxes, $board, $counter, $maxSteps);
	$t = time() - $t0;
	echo "[{$maxSteps}] cost {$t} seconds.\n";
	if ($succ) break;
}

