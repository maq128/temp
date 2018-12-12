# tars 小白安装必成手册

最近开始了解和学习 [TarsCloud/Tars](https://github.com/TarsCloud/Tars)，如果可能的话，准备在实践中使用。
官方文档虽然内容不少，但是对于初学者来说似乎缺乏系统的指导，导致不少像我这样的菜鸟小白四处碰壁，
起步过程充满了挫折。

这里把本人在开始安装试用过程中遇到的问题以及解决的办法做个记录，主要是自己备忘，
同时也希望能帮到有需要的朋友。


# 知识准备

需要对 CentOS 系统有一定的使用经验，至少像 yum 安装软件包、ifconfig 查看网卡名称、sed 修改文本文件内容
这些要知道如何操作。我们对 tars 是小白，但对于 Linux 系统的日常操作不完全是小白，对吧？

另外，对 tars 的几个概念要有所了解，比如对下面这几个词，都要给自己提一个问题：什么是 XX？XX 有什么用？
如果暂时不是特别清楚的话，就带着这些问题做后面的实验。

	基础服务, 核心基础服务, web管理系统, 服务模板, 服务发布


# 系统环境准备

本文使用的是 **[VirtualBox](https://www.virtualbox.org/) + [CentOS 7](https://wiki.centos.org/Download)**，
网络连接方式设置为**桥接网卡**，虚拟机系统就像局域网上一台单独的电脑一样，可以通过 IP 地址跟宿主系统互相访问。

小白上手，最重要的是**成功一次**，建立信心。为了避免环境差异产生的各种障碍，建议你先建立一套与本文相同的系统环境。
实验成功之后，你对 tars 的安装和运行都有了一个初步的感性认识，然后就可以在你实际使用的目标环境中着手构建安装了，
如果再遇到什么问题的话，至少你还有一个成功环境可以用来参考对比。

**关于如何安全地使用 Linux 系统不是本文的议题。为了减少不必要的干扰，操作系统安装好之后，请检查并
[关闭 SELinux](https://www.jianshu.com/p/a7900dbf893c)，[关闭 firewalld](https://www.jianshu.com/p/d6414b5295b8)。
以下所有操作都以 root 帐号来完成。**


# 软件环境准备

	# 安装编译环境（用于编译 tars 基础服务）
	yum install gcc gcc-c++ cmake yasm glibc-devel flex bison ncurses-devel zlib-devel autoconf python-requests

	# 安装 mysql client 依赖项（用于编译 tars 基础服务和执行 mysql 命令）
	yum install mariadb mariadb-devel mariadb-libs

	# 安装 nodejs 和 npm（用于安装运行 web 管理系统）
	curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
	yum install nodejs

	# 安装 docker（选项：用于 docker 方式启动 mysql server）
	wget https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-ce-18.03.1.ce-1.el7.centos.x86_64.rpm
	yum install docker-ce-18.03.1.ce-1.el7.centos.x86_64.rpm
	systemctl enable docker
	systemctl start docker

	# 设置环境变量（这里的 IP 地址是 CentOS 7 系统分配到的 IP，【请根据实际情况修改】）
	export MY_TARS_IP=192.168.1.140
	export MY_MYSQL_IP=192.168.1.140
	export MY_MYSQL_ROOT_PASSWORD=password

注：如果喜欢用 docker 方式运行 tars 框架，可以从这里直接跳到 [基于 docker 运行 tars 框架](#docker-tars)。


# 安装 mysql 数据库服务

### 使用 CentOS 7 自带的 mariadb

	# 安装并启动 mariadb （使用上等同于 mysql）
	yum install mariadb-server
	systemctl enable mariadb
	systemctl start mariadb

	# mysql server 初始化安全设置（root 密码设置为 password）
	mysql_secure_installation

注：CentOS 7 自带的 mariadb 只能更新到 5.5.59-MariaDB-38.11，而 [TarsCloud/TarsWeb](https://github.com/TarsCloud/TarsWeb)
提供的用户体系模块（[demo](https://github.com/TarsCloud/TarsWeb/tree/master/demo)）需要数据库版本不低于 5.6.5，
建议使用 docker 方式启动 mysql server。

### 使用 docker 启动 mysql server

参考资料：[docker](https://docs.docker.com/engine/reference/commandline/run/) [mysql](https://store.docker.com/_/mysql)

	mkdir -p /var/run/mysqld
	chmod 777 /var/run/mysqld
	docker run --name tars-mysqld --detach \
	  --publish=3306:3306 \
	  -v /var/run/mysqld:/var/run/mysqld \
	  -e MYSQL_ROOT_PASSWORD=${MY_MYSQL_ROOT_PASSWORD} \
	  mysql:5.7
	echo "socket=/var/run/mysqld/mysqld.sock" >> /etc/my.cnf.d/client.cnf

【坑】tars 的安装脚本（包括快速部署用的 py 程序）在调用 mysql 命令访问数据库的时候，都没有指定 --host 参数，
如果这种方式不能正确连接到 mysql server 的话，安装过程将会失败。所以一般来说本机直接安装的 mysql server 还好办，
如果是运行在另外一台服务器上，或者用 docker 启动 mysql server 的话，就会有一点麻烦。上面用 docker 启动 mysql server
容器的时候做的一些额外设置就是为了避免这个问题。


<a id="download-tars"></a>
# 下载 Tars 源代码

注：如果你的电脑无法直接访问 github，请[设置适当的代理服务器](各种常用软件设置代理的方法.md)。

	# 下载全部源代码
	mkdir /data
	cd /data
	git clone https://github.com/TarsCloud/Tars.git --recursive

	# 调整与 mysql clent 依赖项安装位置相关的文件内容
	# 本系统环境中 mariadb(mysql) 的安装位置跟 tars 源代码中预期的不一样，需调整。
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

	# 【坑】这里明显是一处笔误，后果就是使用 tars.springboot 服务模板将导致部署失败。
	sed -i "s/<<server>/<server>/g" framework/sql/db_tars.sql

	# 【坑】web 管理系统中有一处 BUG，将导致“接口测试”功能总是报错。
	sed -i "s/setName ? setName : '')/setName ? setName : '', {})/g" web/app/service/infTest/TarsClient.js

源代码都准备好之后，接下来你可以选择【快速部署】或者是【手工编译部署】。

如果你想两种方式都实验一下，那现在就可以在 VirtualBox 里做个系统快照了。


# 快速部署

官方文档：[快速部署](https://github.com/TarsCloud/Tars/tree/master/deploy)

	# 调整网卡名相关的文件内容
	# 【坑】tars 源代码预期网卡名为 eth0，本系统环境中实际网卡名为 enp0s3。【请根据实际情况修改】
	cd /data/Tars/deploy
	sed -i "s@eth0@enp0s3@g" comm/tarsUtil.py

	# 【坑】调整数据库密码相关的文件内容
	sed -i "s@tars12345@${MY_MYSQL_ROOT_PASSWORD}@g" comm.properties

	# 全自动部署
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
访问 https://raw.githubusercontent.com/ ，不行的话只能[自己想办法](各种常用软件设置代理的方法.md)了。
有时候重试一次也许管用（这时候你需要回滚到之前在 VirtualBox 做的系统快照重新开始，不要简单地重新运行
deploy.py，那样会有副作用）。

最末两行输出的内容貌似报错，但可以不用管它，已经安装好了。

最终的安装位置在：

	# 基础服务的安装位置
	/usr/local/app/tars

	# 基础服务的日志文件位置
	/usr/local/app/tars/app_log/tars

	# web 管理系统的安装位置
	/usr/local/app/web

	# web 管理系统的日志文件位置
	/usr/local/app/web/log

web 管理系统访问网址：

	http://192.168.1.140:3000

【坑】此时 web 管理系统中的大部分功能都是工作正常的，只是访问“服务监控”功能的时候会报错“错误: 系统内部错误”。
这应该是系统的一个 BUG，不必在意。因为没有相关的监控数据才报错，第二天就会自愈了。

查看 tars 服务进程：

	ps -ef | grep tars/


# 手工编译部署

官方文档：[Tars框架运行环境搭建](https://github.com/TarsCloud/Tars/blob/master/Install.zh.md#chapter-4)

### 准备工作

	# 调整数据和脚本文件
	cd /data/Tars/framework/sql
	sed -i "s/192.168.2.131/${MY_TARS_IP}/g" `grep 192.168.2.131 -rl ./*`
	sed -i "s/db.tars.com/${MY_TARS_IP}/g" `grep db.tars.com -rl ./*`
	sed -i "s/root@appinside/${MY_MYSQL_ROOT_PASSWORD}/g" exec-sql.sh

	# 数据库初始化
	chmod u+x exec-sql.sh
	./exec-sql.sh

	# 在数据库中创建 tars 帐号
	mysql -P3306 -uroot -p${MY_MYSQL_ROOT_PASSWORD} -e "grant all on *.* to 'tars'@'%' identified by 'tars2015' with grant option;"
	mysql -P3306 -uroot -p${MY_MYSQL_ROOT_PASSWORD} -e "grant all on *.* to 'tars'@'localhost' identified by 'tars2015' with grant option;"
	mysql -P3306 -uroot -p${MY_MYSQL_ROOT_PASSWORD} -e "flush privileges;"

	# 构建环境初始化
	cd /data/Tars/framework/build
	./build.sh all

### 构建核心基础服务模块

	make framework-tar

### 安装核心基础服务模块

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

### 安装 web 管理系统

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

### 构建普通基础服务模块

官方文档：[安装框架普通基础服务](https://github.com/TarsCloud/Tars/blob/master/Install.zh.md#44-%E5%AE%89%E8%A3%85%E6%A1%86%E6%9E%B6%E6%99%AE%E9%80%9A%E5%9F%BA%E7%A1%80%E6%9C%8D%E5%8A%A1)

	cd /data/Tars/framework/build
	make tarsnotify-tar
	make tarsstat-tar
	make tarsproperty-tar
	make tarslog-tar
	make tarsquerystat-tar
	make tarsqueryproperty-tar

### 安装 web 管理系统用户体系模块（demo）

官方文档：[TARS 用户体系模块使用指引](https://github.com/TarsCloud/TarsWeb/blob/master/docs/TARS%20%E7%94%A8%E6%88%B7%E4%BD%93%E7%B3%BB%E6%A8%A1%E5%9D%97%2B%E8%B5%84%E6%BA%90%E6%A8%A1%E5%9D%97%E4%BD%BF%E7%94%A8%E6%8C%87%E5%BC%95.md)

	cd /data
	git clone https://github.com/TarsCloud/TarsWeb.git
	cp -rf /data/TarsWeb/demo /usr/local/app/web-auth

	cd /usr/local/app/web-auth
	mysql -uroot -p${MY_MYSQL_ROOT_PASSWORD} -e "create database db_user_system"
	mysql -uroot -p${MY_MYSQL_ROOT_PASSWORD} db_user_system < sql/db_user_system.sql

	sed -i "s/127.0.0.1/${MY_MYSQL_IP}/g" config/webConf.js
	sed -i "s/admin12345/${MY_MYSQL_ROOT_PASSWORD}/g" config/webConf.js

	npm install
	npm run prd

	# 在 web 管理系统中开启登录认证，并重启
	cd /usr/local/app/web
	sed -i "s/enableLogin: false,/enableLogin: true,/g" config/loginConf.js
	sed -i "s/localhost/${MY_TARS_IP}/g" config/loginConf.js
	pm2 restart tars-node-web


# 手工启动/停止 tars

### 启动基础服务

	cd /usr/local/app/tars
	tarsregistry/util/start.sh
	tarsAdminRegistry/util/start.sh
	tarsnode/util/start.sh
	tarsconfig/util/start.sh
	tarspatch/util/start.sh

### 停止基础服务

	cd /usr/local/app/tars
	tarsregistry/util/stop.sh
	tarsAdminRegistry/util/stop.sh
	tarsnode/util/stop.sh
	tarsconfig/util/stop.sh
	tarspatch/util/stop.sh

### 启动 web 管理系统

	cd /usr/local/app/web
	npm run prd

### 停止 web 管理系统

	# 停止整个 pm2
	pm2 kill

	# 只停止 tars-node-web 程序
	pm2 stop tars-node-web

### 关于开机自启动

貌似官方并没有提供自启动解决方案，所以在实验环境中，当服务器重启之后，tars 需要手工启动。
如果是在生产环境中使用，恐怕就要自己想办法设计自启动方案了。


<a id="docker-tars"></a>
# 基于 docker 运行 tars 框架

参考资料：[Tencent Tars 的Docker镜像脚本与使用](https://store.docker.com/r/tarscloud/tars)

	docker run --name tars-mysqld --detach \
	  --publish=3306:3306 \
	  -e MYSQL_ROOT_PASSWORD=${MY_MYSQL_ROOT_PASSWORD} \
	  mysql:5.7

	docker run --name tars --detach \
	  --net=host \
	  -e INET_NAME=enp0s3 \
	  -e DBIP=${MY_MYSQL_IP} \
	  -e DBPort=3306 \
	  -e DBUser=root \
	  -e DBPassword=${MY_MYSQL_ROOT_PASSWORD} \
	  tarscloud/tars:dev

注：docker 方式确实简单。不过这个镜像并没有修复 [下载 Tars 源代码](#download-tars) 一节里提到的两个坑，
有兴趣可以自己构建一个镜像，或者等待官方代码仓库的 BUGFIX 吧。

另外发现一个奇怪的现象：启动之后，tars 框架基础服务中有些进程所绑定的监听端口跟部署参数中指定的并不一样。

从数据库中查询出来每个进程的端口配置是这样的：

	docker exec tars mysql \
	  -h${MY_MYSQL_IP} \
	  -P3306 \
	  -uroot \
	  -p${MY_MYSQL_ROOT_PASSWORD} \
	  -e "select endpoint, server_name from t_adapter_conf order by endpoint" \
	  db_tars

	tcp -h 192.168.1.140 -t 60000 -p 10000	tarspatch
	tcp -h 192.168.1.140 -t 60000 -p 10001	tarsconfig
	tcp -h 192.168.1.140 -t 60000 -p 10002	tarsnotify
	tcp -h 192.168.1.140 -t 60000 -p 10003	tarslog
	tcp -h 192.168.1.140 -t 60000 -p 10004	tarsstat
	tcp -h 192.168.1.140 -t 60000 -p 10005	tarsproperty
	tcp -h 192.168.1.140 -t 60000 -p 10011	tarsqueryproperty
	tcp -h 192.168.1.140 -t 60000 -p 10012	tarsquerystat

而实际运行时端口的使用情况是这样的：

	netstat -plnt | \
	  grep tars | \
	  grep ${MY_TARS_IP} | \
	  sed "s/^.*${MY_TARS_IP}:\([0-9]\+\).*\(tars.*\)$/\1 \2/g" | \
	  sort

	10000 tarspatch
	10001 tarsconfig
	10002 tarsnotify
	10003 tarsstat
	10004 tarsproperty
	10005 tarslog
	10006 tarsquerystat
	10007 tarsqueryprope
	12000 tarsAdminRegis
	17890 tarsregistry
	17891 tarsregistry
	19385 tarsnode
	19386 tarsnode

此时虽然貌似工作正常，但隐藏着一些问题。比如，重启 tarslog 的话，实际上会把 tarsstat 先停掉了（因为 tarsstat 工作在 10003 端口）；
tarslog 重启后会正确地工作在 10003 端口，但 tarsstat 却无法正常工作了，因为它试图工作的 10004 端口正在被 tarsproperty 占用。

只好把 tarslog/tarsstat/tarsproperty/tarsqueryproperty/tarsquerystat 全都停掉，再逐个重启，这样就能各归其位了。
