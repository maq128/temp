# 在资源管理器中去除多余的显示项

	How Add or Remove Folders from This PC in Windows 10
	https://www.tenforums.com/tutorials/6015-add-remove-folders-pc-windows-10-a.html

	How to remove OneDrive from File Explorer on Windows 10
	https://www.windowscentral.com/how-remove-onedrive-file-explorer-windows-10

# 在资源管理器中禁止把 zip 文件显示为文件夹

	Disable Explorer Folder View of Cab and Zip Files
	https://www.sevenforums.com/tutorials/13619-zip-folders-enable-disable-windows-explorer-view.html

# 资源管理器中右键菜单添加“在此处打开命令窗口”

	How to restore the “Open command window here” option in Build 14986 and newer
	https://insidewindows.net/2016/12/15/how-to-restore-the-open-command-window-here-option-in-build-14986-and-newer/

	在以下两处注册表位置把 HideBasedOnVelocityId 改名为 ShowBasedOnVelocityId：
		HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\background\shell\cmd
		HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Directory\shell\cmd
	可能需要先修改该处注册表位置的权限。

# 设置 Windows 10 免密码自动登录

	如何设置Win10自动登录？
	https://www.zhihu.com/question/36628542

	运行 control userpasswords2 或者 netplwiz.exe

# Windows 10 关闭客户体验改善计划

启动本地组策略编辑器 %windir%\system32\gpedit.msc

把以下项目设置为启用：

	计算机配置
		管理模板
			系统
				Internet通信管理
					Internet通信设置
						关闭Windows客户体验改善计划

# Windows 10 开机启动项的位置

可以在如下两个文件夹中添加快捷方式：

	C:\Users\当前用户名\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
	可以在资源管理器地址栏里面输入 shell:Startup 来快速打开。

	C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup
	可以在资源管理器地址栏里面输入 shell:Common Startup 来快速打开。

也可以在如下两个注册表位置添加 REG_SZ 项：

	HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
	HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Run

# Windows 10 里面 Ubuntu bash 的颜色问题

	Fixing dark blue colors on Windows 10 Ubuntu bash
	https://medium.com/@iraklis/fixing-dark-blue-colors-on-windows-10-ubuntu-bash-c6b009f8b97c

	用下面这个命令可以打印出所有颜色定义：
	dircolors -p

	用下面这个命令可以打印出 LS_COLORS 的赋值语句：
	dircolors -b

	在 .bashrc 文件的末尾增加如下两行即可设置所需的颜色（其中 di=1;37 这项用于控制目录的显示颜色）：
	LS_COLORS='rs=0:di=1;37:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arj=01;31:*.taz=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.zip=01;31:*.z=01;31:*.Z=01;31:*.dz=01;31:*.gz=01;31:*.lz=01;31:*.xz=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.jpg=01;35:*.jpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.axv=01;35:*.anx=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.axa=00;36:*.oga=00;36:*.spx=00;36:*.xspf=00;36:';
	export LS_COLORS

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
