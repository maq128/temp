package main

import (
	"fmt"
	"math/rand"
	"time"
)

func main() {
	const len = 10000000
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
	done := make(chan bool)
	go qsort(arr[:], done)
	<-done
	fmt.Println("qsort:", time.Now().Sub(t0))
	fmt.Println(arr[len/2-100 : len/2+100])
}

func qsort(arr []int, done chan<- bool) {
	defer func() {
		done <- true
	}()

	if len(arr) <= 1 {
		return
	}
	if len(arr) == 2 {
		if arr[0] > arr[1] {
			arr[0], arr[1] = arr[1], arr[0]
		}
		return
	}

	leftPtr := 0
	rightPtr := len(arr) - 1
	midVal := arr[leftPtr]
	findLeft := true
loop:
	for {
		switch {
		case leftPtr == rightPtr:
			arr[leftPtr] = midVal
			break loop
		case findLeft:
			if arr[rightPtr] < midVal {
				arr[leftPtr] = arr[rightPtr]
				leftPtr++
				findLeft = false
			} else {
				rightPtr--
			}
		case !findLeft:
			if arr[leftPtr] > midVal {
				arr[rightPtr] = arr[leftPtr]
				rightPtr--
				findLeft = true
			} else {
				leftPtr++
			}
		}
	}

	subdone := make(chan bool)
	go qsort(arr[:leftPtr], subdone)
	go qsort(arr[leftPtr+1:], subdone)
	<-subdone
	<-subdone
}
