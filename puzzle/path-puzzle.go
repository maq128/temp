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
package main

import "fmt"

type node struct {
	children []*node
	x, y     int
	num      int
}

var allNodes map[string]*node

const MAX_X = 5
const MAX_Y = 4

func getNode(x, y int) *node {
	loc := fmt.Sprintf("%d_%d", x, y)
	newNode, ok := allNodes[loc]
	if ok {
		return newNode
	}
	newNode = &node{x: x, y: y}
	allNodes[loc] = newNode
	newNode.linkToChildren()
	return newNode
}

func (this *node) linkToChildren() {
	if this.x < MAX_X {
		child := getNode(this.x+1, this.y)
		this.children = append(this.children, child)
	}
	if this.y < MAX_Y {
		child := getNode(this.x, this.y+1)
		this.children = append(this.children, child)
	}
	if this.x == MAX_X && this.y == MAX_Y {
		this.num = 1
	}
}

func (this *node) getNumber() int {
	if this.num > 0 {
		return this.num
	}
	for _, child := range this.children {
		this.num += child.getNumber()
	}
	return this.num
}

func removeLink(x1, y1, x2, y2 int) {
	n1 := getNode(x1, y1)
	n2 := getNode(x2, y2)
	for idx, child := range n1.children {
		if child == n2 {
			n1.children = append(n1.children[:idx], n1.children[idx+1:]...)
		}
	}
}

func createDiagram() *node {
	root := getNode(1, 1)
	removeLink(2, 2, 2, 3)
	removeLink(3, 3, 4, 3)
	return root
}

func main() {
	allNodes = make(map[string]*node)
	root := createDiagram()
	fmt.Println("number:", root.getNumber())
}
