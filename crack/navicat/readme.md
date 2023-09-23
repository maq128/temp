# 目标

	在 Windows 系统注册表中清除 Navicat 的安装标志，以实现无限试用。

# nodejs 版

程序逻辑仅针对 Navicat 12 for MySQL。

## 准备工作

	// https://www.npmjs.org/package/winreg
	npm install winreg

	// https://www.npmjs.org/package/promise
	// https://github.com/then/promise
	npm install promise

## 运行

	node run.js > reset.reg

# go 版

Navicat12-reset-reg.go 程序逻辑仅针对 Navicat 12 for MySQL。

Navicat16-reset-reg.go 程序逻辑仅针对 Navicat/NavicatPremium 16 for MySQL。

## 准备工作

	go get golang.org/x/sys/windows/registry

## 运行

	go run Navicat12-reset-reg.go
	go build Navicat12-reset-reg.go

	go run Navicat16-reset-reg.go
	go build Navicat16-reset-reg.go

# 注册表文件

此方法目前已知仅针对 Navicat Premium 15。

双击 `NavicatPremium15-reset` 即可在系统注册表中删除指定的内容。
