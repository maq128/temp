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
	"time"

	_ "github.com/go-sql-driver/mysql"
)

const (
	DSN       = "root:password@tcp(127.0.0.1:3306)/test?loc=Local&parseTime=true"
	MAX_ID    = 1000000
	BATCH_NUM = 100
)

/*
CREATE TABLE holes (
  id INT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO holes(id) VALUES(1),(2),(3)
DELETE FROM holes WHERE id=100 OR id=200

// 错位 join 这种方式耗时太长
SELECT a.id
FROM holes a
  LEFT OUTER JOIN holes b ON a.id=b.id+1
WHERE b.id IS NULL
*/

var DB *sql.DB

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
	dataPrepare()
	// dataTest()
	t1 := time.Now()
	fmt.Println(t1.Sub(t0))
}

func dataPrepare() {
	row := DB.QueryRow("SELECT MAX(id) FROM holes")
	var lastID int
	err := row.Scan(&lastID)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(lastID)

	for lastID < MAX_ID {
		lastID++
		sql := fmt.Sprintf("INSERT INTO holes(id) VALUES(%d)", lastID)
		for i := 1; i < BATCH_NUM && lastID < MAX_ID; i++ {
			lastID++
			sql += fmt.Sprintf(",(%d)", lastID)
		}
		// fmt.Println(sql)
		_, err := DB.Exec(sql)
		if err != nil {
			log.Fatal(err)
		}
	}
	fmt.Println(lastID)
}

func dataTest() {
}
