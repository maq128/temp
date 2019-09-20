package main

import (
	"fmt"
	"log"

	"golang.org/x/sys/windows/registry"
)

func main() {
	fmt.Println("Windows Registry Editor Version 5.00")
	fmt.Println()

	keys := []string{
		"Software\\PremiumSoft\\Data",
		"Software\\Classes\\CLSID",
	}

	// 注册表中有两处
	for _, keypath := range keys {
		key, err := registry.OpenKey(registry.CURRENT_USER, keypath, registry.ALL_ACCESS)
		if err != nil {
			log.Fatal(err)
		}

		subnames, err := key.ReadSubKeyNames(0)
		if err != nil {
			log.Fatal(err)
		}

		for _, subname := range subnames {
			// 遍历每个 sub key，应该含有 Info 子项
			subpath := keypath + "\\" + subname
			infopath := subpath + "\\Info"
			infokey, err := registry.OpenKey(registry.CURRENT_USER, infopath, registry.QUERY_VALUE)
			if err == nil {
				// 再次确认 Info 子项含有特定的 value
				_, _, err = infokey.GetStringValue(subname[1:5])
				infokey.Close()

				if err == nil {
					fmt.Println("[-HKEY_CURRENT_USER\\" + subpath + "]")

					// 删除该 sub key
					subkey, err := registry.OpenKey(registry.CURRENT_USER, subpath, registry.ALL_ACCESS)
					if err == nil {
						registry.DeleteKey(subkey, "Info")
						subkey.Close()
					}
					err = registry.DeleteKey(key, subname)
					if err != nil {
						log.Fatal(err)
					}
				}
			}
		}

		key.Close()
	}
}
