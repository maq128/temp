# 目标

	读取 Windows 注册表，找到 Navicat 的安装标志。

# nodejs 版

## 准备工作

	// https://www.npmjs.org/package/winreg
	npm install winreg

	// https://www.npmjs.org/package/promise
	// https://github.com/then/promise
	npm install promise

## 运行

	node run.js > reset.reg

# go 版

## 准备工作

	go get golang.org/x/sys/windows/registry

## 运行

	go run run.go

	go build run.go
