# 构建 ungoogled-chromium 笔记

## 参考资料

[ungoogled-chromium-windows](https://github.com/ungoogled-software/ungoogled-chromium-windows)

## 准备工作

### 安装 python3

在 [Python 官网](https://www.python.org/downloads/) 下载了 `python-3.9.2-amd64.exe`，安装到 `C:\Python39`，
并把这个路径添加到 `PATH` 环境变量。此时在命令行用 `py` 可以使用这个版本。

在安装过程即将结束的时候，有一个附加选项：Disable path length limit，选择执行它。

### 安装 python2

在 [Python 官网](https://www.python.org/downloads/) 下载了 `python-2.7.18.amd64.msi`，安装到 `C:\Python27`，
并把这个路径添加到 `PATH` 环境变量（位置比 `C:\Python39` 更靠前）。此时在命令行用 `python` 可以使用这个版本。

### 安装 7-zip

在 [7-zip 官网](https://www.7-zip.org/download.html) 下载了 `7z2101-x64.exe`，安装后可以看到注册表信息：
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\7zFM.exe
```
构建时执行的 `build.py` 脚本就是从这里找到 `7z.exe`。

### 安装 Visual Studio Community 2019

首先下载、安装并运行 [Microsoft Visual Studio Installer](https://visualstudio.microsoft.com/zh-hans/)，通过它再安装
Visual Studio Community 2019，安装时增选了如下模块：

- 工作负载 > 使用 C++ 的桌面开发
- 单个组件 > 适用于最新 v142 生成工具的 C++ ATL（x86 和 x64）
- 单个组件 > 适用于最新 v142 生成工具的 C++ MFC（x86 和 x64）

然后在 Windows SDK 里面增选 Debugging Tools For Windows：

- 控制面板 > Windows Software Development Kit > Change

并在其中勾选 Debugging Tools For Windows。

## 下载 ungoogled-chromium-windows 源代码
```cmd
git clone --recurse-submodules https://github.com/ungoogled-software/ungoogled-chromium-windows.git
cd ungoogled-chromium-windows
git checkout --recurse-submodules 89.0.4389.90-1.1
rmdir /S /Q .git
del /AH ungoogled-chromium\.git
```

## 构建
```cmd
py build.py
```
首先是一个漫长的下载过程，下载的内容存放在 `build\downloads_cache` 目录下。

下载清单是 `downloads.ini` 和 `ungoogled-chromium\downloads.ini`，也可以以其它方式下载这些文件放到 cache 目录里。

下载时使用的是 `curl`，所以如果需要为其配置代理的话可以这样：
```
set ALL_PROXY=socks5://127.0.0.1:7070
```

执行 `build.py` 脚本的 Prune binaries 过程中，有两个文件无法删除导致过程中断（因为文件是只读的）：

- `build\src\buildtools\linux64\gn`
- `build\src\tools\skia_goldctl\linux\goldctl`

需手工删除这两个文件，然后重新执行 `build.py` 脚本，为了保证再次执行的时候能够顺利完成，作了以下这些修改：

- [downloads.unpack_downloads(...)](https://github.com/ungoogled-software/ungoogled-chromium-windows/blob/89.0.4389.90-1.1/build.py#L163)
代码注释掉，以避免重复解压。

- [parser.exit(1)](https://github.com/ungoogled-software/ungoogled-chromium-windows/blob/89.0.4389.90-1.1/build.py#L172)
代码注释掉，以避免因删除某些文件时报错（未找到文件，因为已经删除过了）导致程序退出。

## 打包
```cmd
py package.py
```
打包的结果：

- `build/ungoogled-chromium_89.0.4389.90-1.1_windows.zip` 解压缩后可以直接使用。
- `build/ungoogled-chromium_89.0.4389.90-1.1_installer.exe` 安装包。

## 运行

运行 Chromium 之后可以通过 [chrome://version](chrome://version) 查看 `User Data` 的位置。
