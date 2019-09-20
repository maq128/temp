/*
问题：给定长度为 n 的数组 a，计算出等长数组 b，其中每个元素都是 a 中所有元素排除相对应位置的元素之后的连乘积。
要求：时间复杂度为 O(n)，空间复杂度为 O(1)。
*/
package main

import (
	"fmt"
)

func main() {
	a := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	fmt.Println(a)

	// b 为题目要求的输出项，不记入空间复杂度。
	b := make([]int, len(a))

	// 从左向右生成数组 b，其中每个元素都是 a 中对应位置左边所有元素的乘积。
	b[0] = 1
	for i := 1; i < len(a); i++ {
		b[i] = b[i-1] * a[i-1]
	}

	// 从右向左逐个计算 a 中元素的连乘积，再生成 b 中的目标值。
	m := 1
	for i := len(a) - 2; i >= 0; i-- {
		m = m * a[i+1]
		b[i] = m * b[i]
	}
	fmt.Println(b)
	// [3628800 1814400 1209600 907200 725760 604800 518400 453600 403200 362880]
}
