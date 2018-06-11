# Windows 10 开机启动项的位置

可以在如下两个文件夹中添加快捷方式：

	C:\Users\当前用户名\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
	可以在资源管理器地址栏里面输入 shell:Startup 来快速打开。

	C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup
	可以在资源管理器地址栏里面输入 shell:Common Startup 来快速打开。

也可以在如下两个注册表位置添加 REG_SZ 项：

	HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
	HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Run
