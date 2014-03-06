服务器端安装 OpenVPN Server
===========================

#### 使用环境

	服务器：Linode VPS, CentOS 6.2 (x64)
	客户端：Windows 8 Ent (x64)

#### 参考资料

	在 CentOS 6 架设 OpenVPN Server
	http://jamyy.dyndns.org/blog/2013/09/5220.html

#### CentOS 上安装并配置 OpenVPN Server

	rpm -Uvh http://pkgs.repoforge.org/rpmforge-release/rpmforge-release-0.5.3-1.el6.rf.x86_64.rpm
	yum install openvpn
	cp /usr/share/doc/openvpn-2.2.2/sample-config-files/server.conf /etc/openvpn/
	# 编辑 /etc/openvpn/server.conf 文件，内容如下
		port 1194
		proto udp
		dev tun
		ca /etc/openvpn/easy-rsa/keys/ca.crt
		cert /etc/openvpn/easy-rsa/keys/server.crt
		key /etc/openvpn/easy-rsa/keys/server.key
		dh /etc/openvpn/easy-rsa/keys/dh1024.pem
		server 10.8.0.0 255.255.255.0
		push "redirect-gateway def1 bypass-dhcp"
		keepalive 10 120
		tls-auth /etc/openvpn/easy-rsa/keys/ta.key 0
		comp-lzo
		persist-key
		persist-tun
		status /var/log/openvpn-status.log
		log /var/log/openvpn.log
		log-append /var/log/openvpn.log
		verb 3

#### 准备配置密钥

	cp -R /usr/share/doc/openvpn-2.2.2/easy-rsa/2.0 /etc/openvpn/easy-rsa
	cd /etc/openvpn/easy-rsa
	ln -s openssl-1.0.0.cnf openssl.cnf
	chmod +x build-* clean-all pkitool whichopensslcnf
	# 编辑 /etc/openvpn/easy-rsa/vars 文件，前面内容不管，确认结尾部分如下（其实就是缺省，貌似可以自己改）：
		export KEY_COUNTRY="US"
		export KEY_PROVINCE="CA"
		export KEY_CITY="SanFrancisco"
		export KEY_ORG="Fort-Funston"
		export KEY_EMAIL="me@myhost.mydomain"
		export KEY_EMAIL=mail@host.domain
		export KEY_CN=changeme
		export KEY_NAME=changeme
		export KEY_OU=changeme
		export PKCS11_MODULE_PATH=changeme
		export PKCS11_PIN=1234

	source ./vars
	./clean-all

#### 生成 CA

	./build-ca
		Common Name: <此处填写服务器的公网IP>
		其它内容均接受缺省值

#### 生成 Server 端密钥

	./build-key-server server

		所有内容均接受缺省值
		Sign the certificate? [y/n] 回答 y
		1 out of 1 certificate requests certified, commit? [y/n] 回答 y

#### 生成 dh1024.pem

	./build-dh

#### 生成 ta.key

	openvpn --genkey --secret keys/ta.key

#### 生成 Client 端密钥

	./build-key-pass client-test

		Enter PEM pass phrase: <此处输入密码>
		Verifying - Enter PEM pass phrase: <此处重复输入密码>
		其它内容均接受缺省值
		Sign the certificate? [y/n] 回答 y
		1 out of 1 certificate requests certified, commit? [y/n] 回答 y

	启动 OpenVPN 服务

		service openvpn start

	设置开机启动 OpenVPN 服务

		chkconfig openvpn on

Win8 上安装运行 OpenVPN Client 端
=================================

下载 OpenVPN Windows Installer

	http://openvpn.net/index.php/open-source/downloads.html
	http://swupdate.openvpn.org/community/releases/openvpn-install-2.3.2-I003-x86_64.exe

安装

	一路确认即可（包括安装设备驱动）

把服务器上这 4 个文件复制到 C:\Program Files\OpenVPN\config

	/etc/openvpn/easy-rsa/keys/ca.crt
	/etc/openvpn/easy-rsa/keys/ta.key
	/etc/openvpn/easy-rsa/keys/client-test.crt
	/etc/openvpn/easy-rsa/keys/client-test.key

创建并编辑文件 C:\Program Files\OpenVPN\config\client.ovpn 内容如下（注意 IP 地址部分）

	client
	dev tun
	proto udp
	remote <此处填写服务器的公网IP> 1194
	resolv-retry infinite
	nobind
	persist-key
	persist-tun
	ca ca.crt
	cert client-test.crt
	key client-test.key
	ns-cert-type server
	tls-auth ta.key 1
	comp-lzo
	verb 3

把桌面上的 OpenVPN GUI 快捷设置为“以管理员身份运行”。

双击运行 OpenVPN GUI，在托盘上会出现一个图标，双击这个图标即可建立连接。

双网卡路由问题
==============

一般来说，客户端 PC 本来已经有一个网卡可以上网（A），OpenVPN Client 建立 VPN 连接后，会创建一个“软网卡（B）”跟 OpenVPN Server 建立隧道。

如果不做特殊设置，当一个应用软件发起网络请求的时候，很可能会被路由到 A 上，这样就没有 VPN 的效果了。下面方法是把 B 设置为系统的缺省网关。

	网卡属性 → Internet协议（TCP/IP) → 高级 → TCP/IP 属性

		“IP 设置”页签里，添加默认网关（IP 为 10.8.0.5，跃点数为 1）
		“DNS”页签里，添加 DNS 服务器（IP 为 8.8.8.8）
