# tars 小白安装必成手册

最近开始了解和学习 tars [1]，如果可能的话，准备在实践中使用。官方文档虽然内容不少，但是对于初学者来说
似乎缺乏系统的指导，导致不少像我这样的菜鸟小白四处碰壁，起步过程充满了挫折。

这里把本人在开始安装试用过程中遇到的问题以及解决的办法做个记录，主要是自己备忘，同时也希望能帮到
有需要的人。


# 知识准备

需要对 Linux 有一定的使用经验，至少像 yum 安装软件包、ifconfig 查看网卡名称、sed 修改文本文件内容
这些要知道如何操作。我们对 tars 是小白，但对于 Linux 系统的日常操作不完全是小白，对吧？

另外，对 tars 的几个概念要有所了解，比如对下面这几个词，都要给自己提一个问题：什么是 XX？XX 有什么用？
如果暂时不是特别清楚的话，就带着这些问题做后面的实验。

	基础服务, 核心基础服务, web管理系统, 服务模板, 服务发布


# 系统环境准备

小白上手，最重要的是“成功一次”，建立信心。为了避免环境差异导致的各种坑，如果你想按照本文描述的
内容体验一次成功的话，最好先设法建立一套相同的系统环境。实验成功之后，你对 tars 的安装和运行都有
了一个初步的感性认识，然后就可以着手在你实际使用的目标环境中开始构建安装了，如果遇到什么问题的话，
至少你有一个成功环境可以用来参考对比。

我这里使用的是 VirtualBox + CentOS 7，网络连接方式设置为“桥接网卡”，虚拟机系统就像局域网上一台单独
的电脑一样，可以通过 IP 地址跟宿主系统互相访问。

关于如何安全地使用 Linux 系统不是本文的议题。为了减少不必要的干扰，操作系统安装好之后，如果需要的
话，关闭 SELinux [5] 和 firewalld [6]。以下所有操作都以 root 帐号来完成。


# 软件环境准备

	# 安装编译环境
	yum install gcc gcc-c++ cmake yasm glibc-devel flex bison ncurses-devel zlib-devel autoconf

	# 安装并启动 mariadb （使用上等同于 mysql）
	yum install mariadb-devel mariadb-libs mariadb-server
	systemctl enable mariadb
	systemctl start mariadb

	# mysql 初始化安全设置（root 密码设置为 password）
	mysql_secure_installation

	# 设置环境变量（这里的 IP 地址是 CentOS 7 系统分配到的 IP，请按照实际情况修改）
	export MY_TARS_IP=192.168.1.140
	export MY_MYSQL_IP=192.168.1.140
	export MY_MYSQL_ROOT_PASSWORD=password


# 下载 Tars 源代码

	# （可选）如果你的电脑无法直接访问 github 的话，请设置适当的代理服务器 [7]。

	# 下载全部源代码
	mkdir /data
	cd /data
	git clone https://github.com/TarsCloud/Tars.git --recursive

	# 调整数据和脚本文件，并进行数据库初始化
	cd /data/Tars/framework/sql
	sed -i "s/192.168.2.131/${MY_TARS_IP}/g" `grep 192.168.2.131 -rl ./*`
	sed -i "s/db.tars.com/${MY_TARS_IP}/g" `grep db.tars.com -rl ./*`
	sed -i "s/root@appinside/${MY_MYSQL_ROOT_PASSWORD}/g" exec-sql.sh
	chmod u+x exec-sql.sh
	./exec-sql.sh
	mysql -P3306 -uroot -p${MY_MYSQL_ROOT_PASSWORD} -e "grant all on *.* to 'tars'@'%' identified by 'tars2015' with grant option;"
	mysql -P3306 -uroot -p${MY_MYSQL_ROOT_PASSWORD} -e "grant all on *.* to 'tars'@'localhost' identified by 'tars2015' with grant option;"
	mysql -P3306 -uroot -p${MY_MYSQL_ROOT_PASSWORD} -e "flush privileges;"

	# 调整与 mysql server 安装位置相关的文件内容
	# 【坑】本系统环境中 mariadb(mysql) 的安装位置跟 tars 源代码中预期的不一样，需调整。
	cd /data/Tars
	sed -i "s@/usr/local/mysql/include@/usr/include/mysql@g" framework/CMakeLists.txt
	sed -i "s@/usr/local/mysql/lib@/usr/lib64/mysql@g"       framework/CMakeLists.txt
	sed -i "s@/usr/local/mysql/include@/usr/include/mysql@g" framework/tarscpp/CMakeLists.txt
	sed -i "s@/usr/local/mysql/lib@/usr/lib64/mysql@g"       framework/tarscpp/CMakeLists.txt

	# 调整 mysql client 为动态连接
	# 【坑】本系统环境中 mariadb(mysql) 没有提供静态连接库，需改为动态连接。
	# 官方文档推荐使用静态连接，以避免可执行程序对运行环境的依赖，本实验仅限于单机，不受影响。
	sed -i "s@libmysqlclient.a@libmysqlclient.so@g" cpp/test/testUtil/CMakeLists.txt
	sed -i "s@libmysqlclient.a@libmysqlclient.so@g" framework/CMakeLists.txt
	sed -i "s@libmysqlclient.a@libmysqlclient.so@g" framework/tarscpp/test/testUtil/CMakeLists.txt

	# 调整网卡名相关的文件内容
	# 【坑】tars 源代码预期网卡名为 eth0，本系统环境中实际网卡名为 enp0s3。请根据实际情况修改。
	sed -i "s@eth0@enp0s3@g" deploy/comm/tarsUtil.py

	# 【坑】调整数据库密码相关的文件内容
	sed -i "s@tars12345@${MY_MYSQL_ROOT_PASSWORD}@g" deploy/comm.properties

源代码都准备好之后，接下来你可以选择【快速部署】或者是【手工编译部署】。

如果你想两种方式都实验一下，那现在就可以在 VirtualBox 里做个系统快照了。


# 快速部署 [2]

	cd /data/Tars/deploy
	python ./deploy.py all

执行上面命令的过程时间比较长，期间陆续会看到下面这些输出：

	pullFramework start ...
	pullFramework success
	pullWeb start ...
	pullWeb success
	build start ...
	build sucess
	initDB start ...
	initDB success 
	deploy frameServer start ...
	deploy frameServer success
	deploy web start ... 
	install nvm start...
	install nvm success
	deploy web success
	test fail,tarsweb cannot visit
	tarweb cannot visit

【坑】如果哪一步卡了很长时间没有动静，那很可能是因为网络原因卡死了。比如 install nvm 过程中会调用 wget
访问 https://raw.githubusercontent.com/ ，不行的话只能自己想办法了。有时候重试一次也许管用（这时候你需要
回滚到之前在 VirtualBox 做的系统快照重新开始，不要简单地重新运行 deploy.py，那样会有副作用）。

最末两行输出的内容貌似报错，但可以不用管它，已经安装好了。

最终的安装位置在：

	# 基础服务的安装位置
	/usr/local/app/tars

	# 基础服务的日志文件
	/usr/local/app/tars/app_log/tars

	# web 管理系统的安装位置
	/usr/local/app/web

	# web 管理系统的日志文件
	/usr/local/app/web/log

web 管理系统访问网址：

	http://192.168.1.140:3000

【坑】此时 web 管理系统中的大部分功能都是工作正常的，只是访问“服务监控”功能的时候会报错“错误: 系统内部错误”。
这应该是系统的一个 BUG，不必在意。因为没有相关的监控数据才报错，第二天就会自愈了。

查看 tars 服务进程：

	ps -ef | grep tars/


# 手工编译部署 [3]

## 准备工作

	cd /data/Tars/framework/build
	./build.sh all

## 构建核心基础服务模块

	make framework-tar

	# 安装核心基础服务模块
	mkdir -p /usr/local/app/tars
	mv framework.tgz /usr/local/app/tars

	cd /usr/local/app/tars
	tar xzfv framework.tgz
	sed -i "s/192.168.2.131/${MY_TARS_IP}/g" `grep 192.168.2.131 -rl ./*`
	sed -i "s/db.tars.com/${MY_TARS_IP}/g" `grep db.tars.com -rl ./*`
	sed -i "s/registry.tars.com/${MY_TARS_IP}/g" `grep registry.tars.com -rl ./*`
	sed -i "s/web.tars.com/${MY_TARS_IP}/g" `grep web.tars.com -rl ./*`
	chmod u+x tars_install.sh
	./tars_install.sh

## 安装 web 管理系统

	cp -R /data/Tars/web /usr/local/app
	cd /usr/local/app/web
	mysql -P3306 -uroot -p${MY_MYSQL_ROOT_PASSWORD} db_tars_web < sql/db_tars_web.sql
	sed -i "s/db.tars.com/${MY_MYSQL_IP}/g" config/webConf.js
	sed -i "s/registry.tars.com/${MY_TARS_IP}/g" config/tars.conf
	npm install --registry=https://registry.npm.taobao.org
	npm install pm2 -g
	npm run prd

【坑】进行到这里，web 管理系统已经可以访问了，但页面会报错“失败: 系统内部错误”。
查看 web 管理系统日志可以看到信息：Table 'db_tars.t_server_notifys' doesn't exist

原因是这样的，tarsnotify 属于普通基础服务，不是核心基础服务，所以走完上面的过程后，
tarsnotify 并没有安装部署。但坑的是，tarsnotify 的部署信息已经存在了，在服务列表上能
够看到 tarsnotify，而且整个系统的运行似乎依赖于它的存在，所以就出现了报错。

解决的办法是：

1. 用下一节的方法构建 tarsnotify-tar，得到 tarsnotify.tgz 文件。

2. 在 web 管理系统中选择 tarsnotify 并进入“发布管理”。

3. 在列表中选中节点，并点击“发布选中节点”按钮。

4. 点击“上传发布包”，并上传 tarsnotify.tgz 文件，然后选中上传好的文件，点击“发布”按钮。

5. 回到“服务管理”列表，在 tarsnotify 后面点击“重启”。完成之后问题即解决。

## 构建普通基础服务模块（可通过 web 管理系统部署 [4]）

	cd /data/Tars/framework/build
	make tarsnotify-tar
	make tarsstat-tar
	make tarsproperty-tar
	make tarslog-tar
	make tarsquerystat-tar
	make tarsqueryproperty-tar


# 手工启动 tars

貌似官方并没有提供自启动解决方案，所以在实验环境中，当服务器重启之后，tars 需要手工启动。
如果是在生产环境中使用，恐怕就要自己想办法设计自启动方案了。

	# 基础服务
	cd /usr/local/app/tars
	tarsregistry/util/start.sh
	tarsAdminRegistry/util/start.sh
	tarsnode/util/start.sh
	tarsconfig/util/start.sh
	tarspatch/util/start.sh

	# web 管理系统
	cd /usr/local/app/web
	npm run prd


# 参考资料

	[1] TarsCloud/Tars
	https://github.com/TarsCloud/Tars

	[2] tars 快速部署
	https://github.com/TarsCloud/Tars/tree/master/deploy

	[3] tars 手工编译部署
	https://github.com/TarsCloud/Tars/blob/master/Install.zh.md

	[4] 通过 web 管理系统安装普通基础服务
	https://github.com/TarsCloud/Tars/blob/master/Install.zh.md#44-%E5%AE%89%E8%A3%85%E6%A1%86%E6%9E%B6%E6%99%AE%E9%80%9A%E5%9F%BA%E7%A1%80%E6%9C%8D%E5%8A%A1

	[5] 查看SELinux状态及关闭SELinux
	https://www.jianshu.com/p/a7900dbf893c

	[6] centos7 关闭防火墙
	https://www.jianshu.com/p/d6414b5295b8

	[7] git代理配置
	https://www.jianshu.com/p/27365d2542d7
