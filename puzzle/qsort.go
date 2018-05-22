package main

import (
	"fmt"
	"math/rand"
	"time"
)

func main() {
	const len = 100000000
	var arr [len]int
	for i := 0; i < len; i++ {
		arr[i] = i + 1
	}
	t0 := time.Now()
	rand.Shuffle(len, func(i, j int) {
		arr[i], arr[j] = arr[j], arr[i]
	})
	fmt.Println("shuffle:", time.Now().Sub(t0))
	fmt.Println(arr[len/2-100 : len/2+100])

	t0 = time.Now()
	qsort(arr[:], nil, 1)
	fmt.Println("qsort:", time.Now().Sub(t0))
	fmt.Println(arr[len/2-100 : len/2+100])
}

const goDepth = 3

func qsort(arr []int, done chan<- bool, depth int) {
	if done != nil {
		defer func() {
			done <- true
		}()
	}

	length := len(arr)
	if length <= 1 {
		return
	}
	if length == 2 {
		if arr[0] > arr[1] {
			arr[0], arr[1] = arr[1], arr[0]
		}
		return
	}

	midVal := arr[0]
	leftPtr := 0
	rightPtr := length - 1
	for {
		for rightPtr > leftPtr && arr[rightPtr] > midVal {
			rightPtr--
		}
		for leftPtr < rightPtr && arr[leftPtr] <= midVal {
			leftPtr++
		}
		if leftPtr == rightPtr {
			var leftDone, rightDone chan bool
			if leftPtr > 0 {
				arr[0], arr[leftPtr] = arr[leftPtr], arr[0]
				if depth <= goDepth {
					leftDone = make(chan bool)
					go qsort(arr[:leftPtr], leftDone, depth+1)
				} else {
					qsort(arr[:leftPtr], nil, depth+1)
				}
			}
			if leftPtr < length-1 {
				if depth <= goDepth {
					rightDone = make(chan bool)
					go qsort(arr[leftPtr+1:], rightDone, depth+1)
				} else {
					qsort(arr[leftPtr+1:], nil, depth+1)
				}
			}
			if leftDone != nil {
				<-leftDone
			}
			if rightDone != nil {
				<-rightDone
			}
			return
		}
		arr[leftPtr], arr[rightPtr] = arr[rightPtr], arr[leftPtr]
	}
}
