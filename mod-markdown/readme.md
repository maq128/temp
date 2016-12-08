# 目标

通过 Apache httpd 访问 .md 文件时，渲染成适当的 html 内容。


# 参考资料

> Discount
> http://www.pell.portland.or.us/~orc/Code/discount/

> apache-mod-markdown
> https://github.com/hamano/apache-mod-markdown

> apxs - APache eXtenSion tool
> https://httpd.apache.org/docs/current/programs/apxs.html


# 操作

0. 安装 apxs

	yum install httpd-devel
	rpm -ql httpd-devel | grep apxs

1. 下载并编译 discount

	cd /mnt/src
	wget http://www.pell.portland.or.us/~orc/Code/discount/discount-2.2.1.tar.bz2
	tar -xvjf discount-2.2.1.tar.bz2
	cd discount-2.2.1
	./configure.sh --shared
	make
	cp libmarkdown.so.2.2.1 /lib64/libmarkdown.so.2.2.1
	ln -s /lib64/libmarkdown.so.2.2.1 /lib64/libmarkdown.so
	ln -s /lib64/libmarkdown.so.2.2.1 /lib64/libmarkdown.so.2

2. 下载 apache-mod-markdown 源代码

	cd /mnt/src
	wget https://github.com/hamano/apache-mod-markdown/archive/1.0.2.tar.gz -O apache-mod-markdown-1.0.2.tar.gz
	tar -xvzf apache-mod-markdown-1.0.2.tar.gz

3. 编译并部署 mod-markdown

	cd /mnt/src
	apxs -g -n markdown
	cd markdown
	cp /mnt/src/apache-mod-markdown-1.0.2/mod_markdown.c ./mod_markdown.c
	apxs -c -I /mnt/src/discount-2.2.1 -L /mnt/src/discount-2.2.1 -l markdown mod_markdown.c
	cp .libs/mod_markdown.so /usr/lib64/httpd/modules/


# 进展状态

可以通过下面的指令把这个扩展模块部署到 Apache httpd 中：

	LoadModule markdown_module modules/mod_markdown.so
	AddHandler markdown .md

这样当用浏览器访问 .md 文件的时候，就会渲染成带格式的 html 内容了。

不过，目前这种方式还不能跟 mod_dav_svn 模块配合使用。
