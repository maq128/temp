package main

import (
	"fmt"
	"log"
	"sort"
	"strings"

	"golang.org/x/sys/windows/registry"
)

//
// Navicat/NavicatPremium 16 for MySQL 在启动后会在注册表中查找并生成如下的注册信息：
//
//   HKEY_CURRENT_USER\SOFTWARE\PremiumSoft\NavicatPremium\Registration16
//   HKEY_CURRENT_USER\SOFTWARE\Classes\CLSID\{aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa}
//   HKEY_CURRENT_USER\SOFTWARE\Classes\CLSID\{bbbbbbbb-bbbb-bbbb-bbbb-XXXXXXXXXXXX}
//
// 其中：
//   {aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa} 的特征是其下有唯一的子项 Info
//   {bbbbbbbb-bbbb-bbbb-bbbb-XXXXXXXXXXXX} 的特征是其下有唯二的两个子项 DefaultIcon 和 ShellFolder
//   而 XXXXXXXXXXXX 部分的后 4 个字节保存了首次启动时的时间戳，如果这个 key 不删除的话，
//   即使其它 key 都删除了，再次启动重新生成注册信息时，使用时间还是从真正第一次使用开始算的。
//

func main() {
	fmt.Println("Windows Registry Editor Version 5.00")
	fmt.Println()

	// 找到 HKEY_CURRENT_USER\SOFTWARE\PremiumSoft\NavicatPremium\Registration16* 并删除
	catpath := "SOFTWARE\\PremiumSoft"
	catkey, err := registry.OpenKey(registry.CURRENT_USER, catpath, registry.ALL_ACCESS)
	if err != nil {
		log.Fatal(err)
	}
	prodnames, err := catkey.ReadSubKeyNames(0)
	if err != nil {
		log.Fatal(err)
	}
	catkey.Close()

	for _, prodname := range prodnames {
		prodpath := catpath + "\\" + prodname
		prodkey, err := registry.OpenKey(registry.CURRENT_USER, prodpath, registry.ALL_ACCESS)
		if err != nil {
			log.Fatal(err)
		}
		propnames, err := prodkey.ReadSubKeyNames(0)
		if err != nil {
			log.Fatal(err)
		}
		prodkey.Close()

		for _, propname := range propnames {
			if strings.HasPrefix(propname, "Registration16") {
				deletePath(prodpath + "\\" + propname)
			}
		}
	}

	// 查找 HKEY_CURRENT_USER\SOFTWARE\Classes\CLSID 下游符合特征的 key 并删除
	catpath = "SOFTWARE\\Classes\\CLSID"
	catkey, err = registry.OpenKey(registry.CURRENT_USER, catpath, registry.ALL_ACCESS)
	if err != nil {
		log.Fatal(err)
	}
	clsnames, err := catkey.ReadSubKeyNames(0)
	if err != nil {
		log.Fatal(err)
	}
	catkey.Close()

	for _, clsname := range clsnames {
		clspath := catpath + "\\" + clsname
		clskey, err := registry.OpenKey(registry.CURRENT_USER, clspath, registry.ALL_ACCESS)
		if err != nil {
			log.Fatal(err)
		}
		subnames, err := clskey.ReadSubKeyNames(0)
		if err != nil {
			log.Fatal(err)
		}
		clskey.Close()

		sort.Strings(subnames)
		shape := strings.Join(subnames, "|")

		// fmt.Println(clspath, shape)
		if shape == "DefaultIcon|ShellFolder" || shape == "Info" {
			deletePath(clspath)
		}
	}
}

func deletePath(path string) {
	fmt.Println("[-HKEY_CURRENT_USER\\" + path + "]")

	// 需先删除所有 subkey
	key, err := registry.OpenKey(registry.CURRENT_USER, path, registry.ALL_ACCESS)
	if err != nil {
		log.Fatal(err)
	}
	subnames, err := key.ReadSubKeyNames(0)
	if err != nil {
		log.Fatal(err)
	}

	for _, subname := range subnames {
		registry.DeleteKey(key, subname)
	}
	key.Close()

	registry.DeleteKey(registry.CURRENT_USER, path)
}
