#### 简介

当网卡设置为混杂模式（promiscuous）的时候，可以接收到同一个局域网段上其它电脑的网络通信
数据包。典型的 ARP 攻击就利用了这一点。

一般情况下，办公室正常使用的电脑不会设置为混杂模式，但如果被感染了病毒或木马，就很有可能
被设置为混杂模式，并对局域网其它电脑进行窃听或攻击。所以在一般的办公网络环境下，网卡的混
杂模式跟 ARP 攻击（以及其它病毒、木马感染）具有高度相关性。

本程序用于扫描本机所在网段（一个 C 地址段）哪些主机网卡工作在混杂模式。

本程序需在 Linux 系统下编译运行。至于 Windows 环境下的类似功能，可以参考 http://www.securityfriday.com/products/promiscan.html

#### 参考资料

	网卡混杂模式的检测
	http://wushank.blog.51cto.com/3489095/1121361
	http://www.securityfriday.com/promiscuous_detection_01.pdf

	The Libnet Packet Construction Library
	http://packetfactory.openwall.net/projects/libnet/index.html

	Libnet 文档 -- libnet_build_arp
	http://libnet.sourcearchive.com/documentation/1.1.4/libnet-functions_8h_65c81208185c68937ef97c0203d3d924.html

#### 构建第三方程序库

	cd /root/promiscan
	tar -xvf downloads/libnet-1.2-rc3.tar.gz
	mv libnet-1.2-rc3 libnet-1.2-rc3-src
	cd libnet-1.2-rc3-src
	./configure --prefix=/root/promiscan/libnet-1.2-rc3
	make
	make install

	cd /root/promiscan
	tar -xvf downloads/libpcap-1.6.2.tar.gz
	mv libpcap-1.6.2 libpcap-1.6.2-src
	cd libpcap-1.6.2-src
	./configure --prefix=/root/promiscan/libpcap-1.6.2 --disable-shared --disable-bluetooth --disable-canusb --disable-can --disable-dbus
	make
	make install

#### 编译

	cd /root/promiscan/src
	make release
	./promiscan -i eth0
