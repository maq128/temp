# 参考资料

[MSYS2](https://www.msys2.org/)
  | [安装包下载](https://github.com/msys2/msys2-installer/releases)

[Mingw-w64](https://www.mingw-w64.org/)

# 在 Windows 环境下安装 MSYS2/MinGW64

下载并解压缩 `msys2-base-x86_64-20220128.tar.xz`

然后在 msys2 环境下执行下面的命令：
```
# 进入 msys2 shell
pacman -Syu

# 重新进入 msys2 shell
pacman -Su

# 重新进入 msys2 shell
pacman -S --needed base-devel mingw-w64-x86_64-toolchain
```
