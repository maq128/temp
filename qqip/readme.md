#### 简介

本程序用于在局域网上监听 OICQ 数据包，记录 QQ 号与 IP 的对应关系。本机网卡需工作在混杂模式。

#### 参考资料


#### 构建第三方程序库

	cd /root/qqip
	tar -xvf downloads/libpcap-1.6.2.tar.gz
	mv libpcap-1.6.2 libpcap-1.6.2-src
	cd libpcap-1.6.2-src
	./configure --prefix=/root/qqip/libpcap-1.6.2 --disable-shared --disable-bluetooth --disable-canusb --disable-can --disable-dbus
	make
	make install

#### 编译

	cd /root/qqip/src
	make release
	./qqip -i eth1
