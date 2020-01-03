/*
	问题：在一个数组中删除一些特定的元素，不要分配额外的空间。
*/
package main

import "fmt"

// 需要保持原有顺序的情况下，从头到尾扫描，遇到需要删除的元素就把后面的元素向前平移。
func filter1(arr []int) []int {
	if len(arr) == 0 {
		return arr
	}
	// a 指向扫描后被保留的元素列表的尾部
	a := 0
	// b 指向正在被扫描的位置
	for b := 0; b < len(arr); b++ {
		// 判断当前位置的元素是否需要保留
		if !isRemove(arr[b]) {
			// 如果已经拉开了距离，说明已经出现过需要删除的元素了，后面的元素都要向前平移
			if a < b {
				arr[a] = arr[b]
			}
			a++
		}
	}
	return arr[:a]
}

// 不需要保持原有顺序的情况下，从头到尾扫描，遇到需要删除的元素就把尾部的元素移过来。
func filter2(arr []int) []int {
	if len(arr) == 0 {
		return arr
	}
	a := 0
	b := len(arr)
	for {
		// 从头向尾扫描，找到需要移除的元素的位置
		for a < b && !isRemove(arr[a]) {
			a++
		}
		// 从尾向头扫描，找到需要保留的元素
		b--
		for a < b && isRemove(arr[b]) {
			b--
		}
		// 扫描完毕则退出循环
		if a >= b {
			break
		}
		// 把尾部的元素填充到中间的空档处
		arr[a] = arr[b]
		a++
	}
	return arr[:a]
}

func isRemove(v int) bool {
	return v == 5
}

func test(arr []int) {
	fmt.Println("------->", arr)
	arr2 := append([]int{}, arr...)

	fmt.Println("filter1:", filter1(arr))
	fmt.Println("filter2:", filter2(arr2))
}

func main() {
	test([]int{})
	test([]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0})
	test([]int{1, 2, 3, 4, 5})
	test([]int{5, 2})
	test([]int{1, 2, 3})
	test([]int{5})
}
