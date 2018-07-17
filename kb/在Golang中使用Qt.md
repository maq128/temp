# 构建 therecipe/qt

## 使用 Qt 官方发布的版本，内置 mingw320_53（无法与 Windows 版的 Golang 兼容）

	qt-opensource-windows-x86-5.11.1.exe

	set QT_DIR=D:\Qt
	set QT_VERSION=5.11.1
	set PATH=D:\Qt\Tools\mingw530_32\bin;%PATH%
	set GOPATH=D:\GoQt
	go get -u -v github.com/therecipe/qt/cmd/...

	# 此处需对 therecipe/qt 的 qtsetup 做一点改造。

	D:\GoQt\bin\qtsetup

## 源码构建 Qt，使用自选的 MinGW-w64（终未成功）

	qt-everywhere-src-5.11.1.tar.xz
	mingw64-x86_64-8.1.0-release-win32-seh-rt_v6-rev0.7z

	Qt 源代码解压到 D:\QtBuild\qt-everywhere-src-5.11.1

	Qt 构建输出指向 D:\QtBuild\5.11.1

//	mingw64 解压到 D:\QtBuild\Tools\mingw530_32
//	因为 therecipe/qt 的 qtsetup 是按照官方发布的 Qt 版本设计的，所以以上两个目录必须如此安排。

	按照要求（https://wohlsoft.ru/pgewiki/Building_Qt_on_MinGW-w64）编写 build.bat 并执行。

	set QT_DIR=D:\QtBuild
	set QT_VERSION=5.11.1
	set QT_MSYS2_DIR=C:\msys64
	set QT_MSYS2_STATIC=true
	set PATH=C:\msys64\mingw64\bin;%PATH%
	set GOPATH=D:\QtBuild\GoQt
	go get -u -v github.com/therecipe/qt/cmd/...

	# 此处需对 therecipe/qt 的 qtsetup 做一点改造。

	D:\QtBuild\GoQt\bin\qtsetup

## 使用 MSYS2 构建 Qt（未完成）

	安装好 MSYS2，并启动 mingw64-shell

	export QT_MSYS2=true
	export QT_MSYS2_ARCH=amd64
	export QT_MSYS2_STATIC=true
	pacman -Syyu
	pacman -S mingw-w64-x86_64-toolchain
	pacman -S mingw-w64-x86_64-qt-creator mingw-w64-x86_64-qt5-static
	pacman -Scc
	export GOROOT=C:/Go
	export GOPATH=D:/GoQt
	export PATH=/c/Go/bin:$PATH
	go get -u -v github.com/therecipe/qt/cmd/...
	$GOPATH/bin/qtsetup

## 改造 therecipe/qt 的 qtsetup

	修改文件
		github.com\therecipe\qt\internal\binding\templater\templater.go:30
	在下面这行
		utils.MkdirAll(utils.GoQtPkgPath(strings.ToLower(m)))
	的前面增加一行
		time.Sleep(time.Millisecond * 100)
	原因：貌似在 utils.RemoveAll() 之后马上执行 utils.MkdirAll() 会大概率导致 Access is Denied 错误，
	造成 qtsetup 过程中断。增加一个延时可以避免这种情况。

	修改文件
		github.com\sirupsen\logrus\text_formatter.go
	在 init() 里增加一行
		f.DisableColors = true
	原因：避免在构建过程中输出的 log 带有颜色控制符。

	go install github.com/therecipe/qt/cmd/qtsetup

# 参考资料

	Qt Documentation
	http://doc.qt.io/

	Qt source code
	http://download.qt.io/archive/qt/

	Windows下搭建类UNIX环境 : Msys2+MinGW-w64
	https://blog.csdn.net/yehuohan/article/details/52090282

	Building Qt on MinGW-w64
	https://wohlsoft.ru/pgewiki/Building_Qt_on_MinGW-w64

	Qt binding for Go
	https://github.com/therecipe/qt
	https://github.com/therecipe/qt/wiki/Installation-on-Windows

	Pacman 命令详解
	https://gist.github.com/fbigun/b859fc426c11f972ec97

	Qt树形控件QTreeView使用2——复选框的设置
	https://blog.csdn.net/czyt1988/article/details/19171727
