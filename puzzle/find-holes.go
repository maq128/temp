/*
	假设一个订单的编号规则是AAAAOrder2020-0000001，AAAAOrder2020-0000002....后面的数字是
	自增长，如果订单号码达到AAAAOrder2020-1000000(100万)，数据库中应该有100万条数据，此时
	随机删除2条数据（物理删除，且不考虑日志和备份），请问怎么找到删掉的数据的编号？
	需要在1秒内运行得到。
*/
package main

import (
	"database/sql"
	"fmt"
	"log"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

const (
	DSN    = "root:password@tcp(127.0.0.1:3306)/test?loc=Local&parseTime=true"
	MAX_ID = 1000000
)

/*
CREATE TABLE holes (
  id INT NOT NULL,
  sid VARCHAR(21) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY(sid)
) ENGINE=InnoDB;

INSERT INTO holes(id) VALUES(1),(2),(3);
DELETE FROM holes WHERE id=123 OR id=456;

// 错位 join 这种方式耗时太长
SELECT a.id
FROM holes a
  LEFT OUTER JOIN holes b ON a.id=b.id+1
WHERE b.id IS NULL
*/

var DB *sql.DB

var holeIDs []int
var queryCnt int

func dbInit() {
	var err error
	DB, err = sql.Open("mysql", DSN)
	if err != nil {
		log.Fatalln("open db fail:", err)
	}

	DB.SetMaxOpenConns(20)
	DB.SetMaxIdleConns(15)

	err = DB.Ping()
	if err != nil {
		log.Fatalln("ping db fail:", err)
	}
}

func main() {
	t0 := time.Now()
	dbInit()
	// dataPrepare()
	binarySearch3()
	t1 := time.Now()
	fmt.Println(t1.Sub(t0))
}

func dataPrepare() {
	row := DB.QueryRow("SELECT MAX(id) FROM holes")
	var sqlLastID sql.NullInt64
	err := row.Scan(&sqlLastID)
	if err != nil {
		log.Fatal(err)
	}

	lastID := 0
	if sqlLastID.Valid {
		lastID = int(sqlLastID.Int64)
	}
	for lastID < MAX_ID {
		lastID++
		sql := fmt.Sprintf("INSERT INTO holes(id,sid) VALUES(%d,'AAAAOrder2020-%07d')", lastID, lastID)
		for i := 1; i < 100 && lastID < MAX_ID; i++ {
			lastID++
			sql += fmt.Sprintf(",(%d,'AAAAOrder2020-%07d')", lastID, lastID)
		}
		// fmt.Println(sql)
		_, err := DB.Exec(sql)
		if err != nil {
			log.Fatal(err)
		}
	}
	fmt.Println(lastID)
}

// 二分法查找
func binarySearch() {
	fromID := 1
	toID := MAX_ID
	row := DB.QueryRow("SELECT COUNT(*) FROM holes")
	queryCnt++
	var total int
	row.Scan(&total)
	fmt.Println(fromID, toID, total)

	holeIDs = make([]int, 0, 2)
	binarySearchRecursive(fromID, toID, total)
	fmt.Println(holeIDs, queryCnt)
}

// 分段 + 二分法查找
func binarySearch2() {
	holeIDs = make([]int, 0, 2)
	segLen := 2000
	// 分成每 2000 条记录一个片段，分别查找
	for fromID := 1; fromID < MAX_ID; fromID += segLen {
		toID := fromID + segLen - 1
		if toID > MAX_ID {
			toID = MAX_ID
		}

		sql := fmt.Sprintf("SELECT COUNT(*) FROM holes WHERE sid >= 'AAAAOrder2020-%07d' AND sid <= 'AAAAOrder2020-%07d'", fromID, toID)
		// fmt.Println(sql)
		row := DB.QueryRow(sql)
		queryCnt++
		var total int
		row.Scan(&total)
		// fmt.Println(fromID, toID, total)

		// 如果这个片段里有删除的记录，则启动二分法查找
		if total < toID-fromID+1 {
			binarySearchRecursive(fromID, toID, total)
		}
	}
	fmt.Println(holeIDs, queryCnt)
}

// 并发分段 + 二分法查找
// FIXME: holeIDs 并发访问冲突
func binarySearch3() {
	holeIDs = make([]int, 0, 2)
	segLen := 2000
	var wg sync.WaitGroup
	// 分成每 2000 条记录一个片段，分别查找
	for fromID := 1; fromID < MAX_ID; fromID += segLen {
		wg.Add(1)
		go func(fromID int) {
			defer wg.Done()
			toID := fromID + segLen - 1
			if toID > MAX_ID {
				toID = MAX_ID
			}

			sql := fmt.Sprintf("SELECT COUNT(*) FROM holes WHERE sid >= 'AAAAOrder2020-%07d' AND sid <= 'AAAAOrder2020-%07d'", fromID, toID)
			// fmt.Println(sql)
			row := DB.QueryRow(sql)
			queryCnt++
			var total int
			row.Scan(&total)
			// fmt.Println(fromID, toID, total)

			// 如果这个片段里有删除的记录，则启动二分法查找
			if total < toID-fromID+1 {
				binarySearchRecursive(fromID, toID, total)
			}
		}(fromID)
	}
	wg.Wait()
	fmt.Println(holeIDs, queryCnt)
}

func binarySearchRecursive(fromID, toID, total int) {
	// 找一个中间点
	midID := (fromID + toID) / 2

	// 查询出左侧的记录数
	sql := fmt.Sprintf("SELECT COUNT(*) FROM holes WHERE sid >= 'AAAAOrder2020-%07d' AND sid <= 'AAAAOrder2020-%07d'", fromID, midID)
	row := DB.QueryRow(sql)
	queryCnt++
	var leftCnt int
	row.Scan(&leftCnt)

	if fromID == midID { // 左侧已经递归到底
		if leftCnt == 0 {
			// 找到一条被删除的记录
			holeIDs = append(holeIDs, fromID)
		}
	} else {
		// 若左侧有被删除的记录，则递归查找
		if leftCnt < midID-fromID+1 {
			binarySearchRecursive(fromID, midID, leftCnt)
		}
	}

	// 计算出右侧的记录数
	rightCnt := total - leftCnt
	if midID+1 == toID { // 右侧已经递归到底
		if rightCnt == 0 {
			// 找到一条被删除的记录
			holeIDs = append(holeIDs, toID)
		}
	} else {
		// 若右侧有被删除的记录，则递归查找
		if rightCnt < toID-midID {
			binarySearchRecursive(midID+1, toID, rightCnt)
		}
	}
}
