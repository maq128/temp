# 参考资料

[Step by step instruction to install Rust and Cargo for mingw with Msys2?](https://stackoverflow.com/a/47380501)

[我是怎么在Windows下构建Rust开发环境的](https://zhuanlan.zhihu.com/p/237932497)

# 在 MSYS2/MinGW64 环境下安装 Rust

## 1. 安装 MSYS2/MinGW64

[Windows下安装MSYS2和MinGW64](Windows下安装MSYS2和MinGW64.md)

## 2. 安装 rustup/cargo

通过环境变量设置 cargo 和 rustup 的安装位置

```
CARGO_HOME=D:\Rust\cargo
RUSTUP_HOME=D:\Rust\rustup
```

下载并运行 `rustup-init.exe`，选择 `Customize installation`，输入 `x86_64-pc-windows-gnu`。
