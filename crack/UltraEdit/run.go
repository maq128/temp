package main

import (
	"fmt"
	"log"
	"os"

	"golang.org/x/sys/windows/registry"
)

func main() {
	removeRegKeys()
	removeLicenseFiles()
}

func removeRegKeys() {
	keypath := "SOFTWARE\\Classes\\WOW6432Node\\CLSID"
	keys := []string{
		"{9b4c79e8-d476-48e1-ad17-2253d0531ebb}",
		"{bf2611c5-cf99-4e19-be15-83e593688709}",
		"{c0bf323d-faa8-4b16-bdc9-92c6acb76dc1}",
	}

	clsid, err := registry.OpenKey(registry.CURRENT_USER, keypath, registry.ALL_ACCESS)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Windows Registry Editor Version 5.00")
	fmt.Println()

	for _, subkey := range keys {
		fmt.Println("[-HKEY_CURRENT_USER\\" + keypath + "\\" + subkey + "]")
		err = registry.DeleteKey(clsid, subkey)
		if err != nil {
			fmt.Println("# missing key:", subkey)
		}
	}

	clsid.Close()
}

func removeLicenseFiles() {
	fmt.Println()

	// filepath := "%ProgramData%\\IDMComp\\UltraEdit\\license\\uedit32_v.spl"
	filepath := "C:\\ProgramData\\IDMComp\\UltraEdit\\license\\uedit32_v.spl"
	_, err := os.Stat(filepath)
	if os.IsNotExist(err) {
		fmt.Println("# missing license file:", filepath)
		return
	}

	err = os.Remove(filepath)
	if err != nil {
		fmt.Println("# can not remove license file:", filepath)
		return
	}
	fmt.Println("# removed license file:", filepath)
}
