# MySQL 递归查询

有时会遇到这样的问题：在一个表中保存的数据记录之间存在父子关系，所有记录按照父子关系呈现为树型结构，
需要在给定一个节点的情况下查找出这个节点下游所有节点的集合。

举个例子，用户之间有邀请关系，每个用户都有可能关联到一个邀请者（也可能没有邀请者，但不会有多个）。
现在给定一个用户，希望查找到由他直接或间接邀请到的所有用户的集合。这种查询就属于递归查询。

在 Oracle 中可以使用 `CONNECT BY` 来描述递归关系，从而一个 SQL 语句就可以得到全部结果。

在 MySQL 的 5.7 版本及以前，一直没有对递归查询的直接支持，最笨的办法就是用程序反复查询，这种的效率肯定不高。

网上看到有人给出了一个[巧妙的办法](https://stackoverflow.com/a/33737203)，可以在一个 SQL 语句里解决问题。
但毕竟太过 tricky，效率也不会很高，当数据量比较大的时候可能会出现问题。

直到 MySQL 8 出现，开始支持 [Common Table Expressions](https://dev.mysql.com/doc/refman/8.0/en/with.html) 了，
在 `WITH` 语法的强大支持下，递归查询被很轻易地解决了。

## 演示环境准备

```sql
CREATE TABLE user (
  uid INT NOT NULL AUTO_INCREMENT,
  parent INT NOT NULL,
  PRIMARY KEY (uid)
);
INSERT INTO user(uid, parent) VALUES
(1, 0), (2, 0), (3, 0),
(4, 1), (5, 1),
(6, 2), (7, 2),
(8, 3), (9, 3),
(10, 4), (11, 4);

CREATE TABLE trade (
  id INT NOT NULL AUTO_INCREMENT,
  uid INT NOT NULL,
  amount INT NOT NULL,
  PRIMARY KEY (id),
  KEY (uid)
);
INSERT INTO trade(uid, amount) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(6, 1), (7, 1), (8, 1), (9, 1), (10, 1),
(11, 1), (11, 1);
```

这里有两个表，`user` 表保存了用户记录，里面通过 `parent` 字段表达了树型结构的父子关系（比如邀请关系），
`trade` 表保存了一些业务流水记录。

```
            +---+           +---+           +---+
            | 1 |           | 2 |           | 3 |
            +---+           +---+           +---+
            /   \           /   \           /   \
        +---+   +---+   +---+   +---+   +---+   +---+
        | 4 |   | 5 |   | 6 |   | 7 |   | 8 |   | 9 |
        +---+   +---+   +---+   +---+   +---+   +---+
        /   \
   +----+   +----+
   | 10 |   | 11 |
   +----+   +----+
```

现在给定一个用户，希望查出他以及下游所有子孙节点的 `uid`，并在 `trade` 表中统计所有这些用户 `amount` 的总和。
比如给定 `uid=1`，那么所有参与统计的节点的 `uid` 集合应该是 (1,4,5,10,11)。

## MySQL 5.7 及更早版本下的方法

```sql
SET @given = '1';

SELECT SUM(trade.amount)
FROM (
  SELECT uid
  FROM
    (SELECT * FROM user ORDER BY parent, uid) temp,
    (SELECT @pv := @given) init
  WHERE FIND_IN_SET(parent, @pv) > 0 AND @pv := CONCAT(@pv, ',', uid)
  ) children,
  trade
WHERE children.uid = trade.uid;
```
_上面这个语句实际上并没有包含 `uid=1` 这个节点本身。把这条记录加进去并不难，为了突出要点，我这里就不做了。_

`children` 这个子查询就是要查找出给定 `uid` 下游所有的子孙节点。它设置了一个变量 `@pv` 来保存所有已经找到的
`uid`（利用 WHERE 子句的条件计算来实现这一点），并通过 `FIND_IN_SET()` 函数来识别符合条件的记录。

## MySQL 8 开始支持的方法

```sql
WITH RECURSIVE family AS (
  SELECT uid FROM user WHERE uid = 1
  UNION ALL
  SELECT user.uid FROM family, user WHERE family.uid = user.parent
)
SELECT SUM(trade.amount)
FROM family, trade
WHERE family.uid = trade.uid;
```
`WITH` 语法本质上是定义了一个临时表，由于使用了 `RECURSIVE` 关键字，这个临时表会按照递归的逻辑来生成，
直到把所有符合条件的记录都添加进来。

可以看到，`WITH` 语法的作用远不限于递归查询，像**批量更新**、**批量删除**等逻辑都很容易用这种方式来表达，
而**递归查询**只是被顺便同时解决了。
[CONNECT BY is dead, long live CTE!](https://mariadb.com/resources/blog/connect-by-is-dead-long-live-cte-in-mariadb-server-10-2/)
