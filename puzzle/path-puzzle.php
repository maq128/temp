<?php
/*
	路径问题：从 A 到 B，只能向右和向下走，共有多少条不同的路径。

	A---+---+---+---+
	|   |   |   |   |
	+---+---+---+---+
	|   x   |   |   |
	+---+---+ x +---+
	|   |   |   |   |
	+---+---+---+---B
*/

error_reporting(E_ERROR | E_CORE_ERROR | E_USER_ERROR);

$nodes = [];

class Node {
	public $id = 0;
	public $count = 0;
	public $parents = [];
	public $children = [];

	public function __construct($id, $parent_ids) {
		global $nodes;
		$this->id = $id;
		if (!empty($parent_ids)) {
			foreach ($parent_ids as $parent_id) {
				$this->parents[$parent_id] = true;

				$parent = $nodes[$parent_id];
				$parent->children[$this->id] = true;
			}
		}
		$nodes[$this->id] = $this;
	}

	static public function getId($x, $y) {
		return "{$x}_{$y}";
	}
}

define('MAX_X', 5);
define('MAX_Y', 4);

function init() {
	// 创建所有节点，并建立节点间的连接关系
	foreach (range(1, MAX_X) as $x) {
		foreach (range(1, MAX_Y) as $y) {
			$id = Node::getId($x, $y);
			$parent_ids = [];
			if ($x > 1) {
				$parent_ids[] = Node::getId($x - 1, $y);
			}
			if ($y > 1) {
				$parent_ids[] = Node::getId($x, $y - 1);
			}
			$node = new Node($id, $parent_ids);
		}
	}
	$node->count = 1;

	// 对连通图进行修剪，去掉一些路径
// 	removePath(3, 2, 3, 3);

// 	removePath(2, 2, 2, 3);
// 	removePath(4, 2, 4, 3);

	removePath(2, 2, 2, 3);
	removePath(3, 3, 4, 3);
}

function removePath($x1, $y1, $x2, $y2) {
	global $nodes;
	$id1 = Node::getId($x1, $y1);
	$id2 = Node::getId($x2, $y2);

	$parent = $nodes[$id1];
	unset($parent->children[$id2]);

	$child = $nodes[$id2];
	unset($child->parents[$id1]);
}

function resolve() {
	global $nodes;
	while (count($nodes) > 1) {
		// 遍历所有待处理节点
		foreach ($nodes as $id => $node) {
			if (empty($node->children)) { // 子节点已经归集完成
				// 向父节点归集
				foreach ($node->parents as $parent_id => $true) {
					$parent = $nodes[$parent_id];
					$parent->count += $node->count;

					// 归集完就解除连接关系
					unset($parent->children[$node->id]);
				}
				unset($nodes[$id]);
			}
		}
	}

	// 最后剩下的就是起始节点
	print_r($nodes);
}

init();
resolve();
