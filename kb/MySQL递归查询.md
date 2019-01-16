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

CREATE TABLE flow (
  id INT NOT NULL AUTO_INCREMENT,
  uid INT NOT NULL,
  money INT NOT NULL,
  PRIMARY KEY (id),
  KEY (uid)
);
INSERT INTO flow(uid, money) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(6, 1), (7, 1), (8, 1), (9, 1), (10, 1),
(11, 1), (11, 1);
```

这里有两个表，`user` 表保存了用户记录，里面通过 `parent` 字段表达了树型结构的父子关系（比如邀请关系），
`flow` 表保存了一些业务流水记录。

```
            +---+             +---+             +---+
            | 1 |             | 2 |             | 3 |
            +---+             +---+             +---+
            /   \            /    \             /    \
        +---+    +---+    +---+    +---+    +---+    +---+
        | 4 |    | 5 |    | 6 |    | 7 |    | 8 |    | 9 |
        +---+    +---+    +---+    +---+    +---+    +---+
        /   \
   +----+    +----+
   | 10 |    | 11 |
   +----+    +----+
```

现在给定一个用户，希望查出他以及下游所有子孙节点的 `uid`，并在 `flow` 表中统计所有这些用户的 `money` 总和。
比如给定 `uid=1`，那么所有参与统计的节点的 `uid` 集合应该是 (1,4,5,10,11)。

## MySQL 5.7 及更早版本下的方法

```sql
SET @given = 1;

SELECT SUM(flow.money)
FROM (
  SELECT uid
  FROM
    (SELECT * FROM user ORDER BY parent, uid) temp,
    (SELECT @pv := @given) init
  WHERE FIND_IN_SET(parent, @pv) > 0 AND @pv := CONCAT(@pv, ',', uid)
  ) children,
  flow
WHERE children.uid = flow.uid;
```
上面这个语句实际上并没有包含 uid=1 这个节点本身。把这条记录加进去并不难，为了突出要点，我这里就不做了。

## MySQL 8 开始支持的方法

```sql
WITH RECURSIVE family AS (
  SELECT uid FROM user WHERE uid = 1
  UNION ALL
  SELECT user.uid FROM family, user WHERE family.uid = user.parent
)
SELECT SUM(flow.money)
FROM family, flow
WHERE family.uid = flow.uid;
```
