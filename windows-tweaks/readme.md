# 在资源管理器中去除多余的显示项

	How Add or Remove Folders from This PC in Windows 10
	https://www.tenforums.com/tutorials/6015-add-remove-folders-pc-windows-10-a.html

	How to remove OneDrive from File Explorer on Windows 10
	https://www.windowscentral.com/how-remove-onedrive-file-explorer-windows-10

# 在资源管理器中禁止把 zip 文件显示为文件夹

	Disable Explorer Folder View of Cab and Zip Files
	https://www.sevenforums.com/tutorials/13619-zip-folders-enable-disable-windows-explorer-view.html

# 设置 Windows 10 免密码自动登录

	如何设置Win10自动登录？
	https://www.zhihu.com/question/36628542

	运行 control userpasswords2 或者 netplwiz.exe

# Windows 10 开机启动项的位置

可以在如下两个文件夹中添加快捷方式：

	C:\Users\当前用户名\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
	可以在资源管理器地址栏里面输入 shell:Startup 来快速打开。

	C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup
	可以在资源管理器地址栏里面输入 shell:Common Startup 来快速打开。

也可以在如下两个注册表位置添加 REG_SZ 项：

	HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
	HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Run

# cmd 设置点阵字体问题

在 Window 8/10 里，经常会遇到 cmd 窗口设置字体时发现“点阵字体”无法选择字号的问题，导致无法正常设置为点阵字体。

	https://answers.microsoft.com/en-us/windows/forum/windows_7-desktop/cmdexe-raster-font-8x12-is-missing/3a205183-8c99-49e4-aac3-ef020177277e

	1. press WinKey+R
	2. type cmd and press enter
	3. type sfc /scannow and press enter (it will check for integrity errors in system files)
	4. after finishing restart your system
	5. ...
	6. run cmd as previously
	7. right click on the cmd window icon in left-top corner
	8. select Properties
	9. select Font tab
	10. choose Raster Font 8x12

# 从 WebDAV 映射的网盘中复制文件，最大限制为 50M

	Folder copy error message when downloading a file that is larger than 50000000 bytes from a Web folder
	https://support.microsoft.com/en-us/help/900900/folder-copy-error-message-when-downloading-a-file-that-is-larger-than

	在注册表 HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WebClient\Parameters 中修改 FileSizeLimitInBytes 的值，以调整限制的尺寸。
