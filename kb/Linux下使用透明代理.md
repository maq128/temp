# Linux 下使用透明代理

当系统中有访问外部 http/https 的请求时，对其进行透明代理。

简单说分为以下几个步骤：

1. 用 ssh 连接墙外服务器，提供 socks5 代理服务。

2. 用 tcpsocks 把数据包转发给 socks5 代理服务器。

3. 用 iptables 把出站数据包转接到 tcpsocks。

这个方法适用于 Linux 系统环境。

以下内容是在 docker 的 alpine 容器中的操作方法：

### 0. 启动 docker 容器

	docker run -it --rm --name my-proxy -v `pwd`:/root --cap-add=NET_ADMIN --cap-add=NET_RAW golang:1.14-alpine sh

	# 为改善安装系统程序包的效率，试用 aliyun 提供的镜像
	echo http://mirrors.aliyun.com/alpine/latest-stable/main > /etc/apk/repositories
	echo http://mirrors.aliyun.com/alpine/latest-stable/community >> /etc/apk/repositories

### 1. 用 ssh 隧道建立 socks5 代理

	apk add openssh-client
	ssh -D 127.0.0.1:7070 -f -N -o ServerAliveInterval=60 user@my.springboard.server

	# 验证 socks5 代理
	apk add curl
	curl -x socks5h://127.0.0.1:7070 -L http://tool.lu/ip

### 2. 编译、运行 tcpsocks

	apk add git make gcc libc-dev
	git clone https://github.com/vi/tcpsocks.git
	cd tcpsocks
	make
	./tcpsocks 0.0.0.0 1234 REDIRECT REDIRECT 127.0.0.1 7070

`tcpsocks` 命令占据了控制台，可以查看网络连接情况。

用 `docker exec` 再次进入同一个容器继续后面的操作。

	docker exec -it my-proxy sh

### 3. 配置 iptables

	apk add iptables
	iptables -t nat -N QQQ
	iptables -t nat -A QQQ -d 127.0.0.0/8 -j RETURN
	iptables -t nat -A QQQ -p tcp --dport 80 -j REDIRECT --to-ports 1234
	iptables -t nat -A QQQ -p tcp --dport 443 -j REDIRECT --to-ports 1234
	iptables -t nat -I OUTPUT 1 -j QQQ
	iptables -t nat -I PREROUTING 1 -j QQQ

### 4. 开始使用透明代理

	# 验证透明代理
	curl -L http://tool.lu/ip

	# 构建 caddy（如果没有代理支持的话，在境内基本很难完成）
	git clone "https://github.com/caddyserver/caddy.git"
	cd caddy/cmd/caddy/
	go build

# 参考资料

[Redirect traffic to SOCKS5 server with iptables](https://github.com/vi/tcpsocks)

[超级详细的iptable教程文档](https://www.cnblogs.com/Dicky-Zhang/p/5904429.html)
