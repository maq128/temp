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
