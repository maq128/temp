# 重装 Windows 系统

常用软件的安装，以及旧系统中的软件数据如何迁移到新系统。


### Chrome

	https://www.google.com/chrome/browser/desktop/index.html?standalone=1

启动另外一个单独的 Chrome 实例：

	"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --profile-directory="Profile_Other"

备份和恢复书签记录：

	C:\Users\<username>\AppData\Local\Google\Chrome\User Data\Default\Bookmarks


### Windows Live Mail

直接备份存储文件夹，新安装后覆盖回去。

	文件 - 选项 - 邮件 - 高级 - 维护 - 存储文件夹


### QQ

直接备份存储文件夹，新安装后覆盖回去。

	设置 - 基本设置 - 文件管理 - 个人文件夹的保存位置


### QQ 企业版

直接备份存储文件夹，新安装后覆盖回去。

	设置 - 基本设置 - 文件管理 - 个人文件夹的保存位置


### 微信 PC 版

直接备份存储文件夹，新安装后覆盖回去。

	设置 - 通用设置 - 文件管理


### WinSCP

设置为把连接记录保存到文件中，并对文件进行备份。

	选项 - 存储 - 配置存储 - INI文件


### Putty

	http://www.putty.org/

从注册表中导出连接记录，新安装后再导入系统注册表。

	HKEY_CURRENT_USER\SOFTWARE\SimonTatham\PuTTY\Sessions


### PuttyTray

	https://puttytray.goeswhere.com/
	https://github.com/FauxFaux/PuTTYTray


### Navicat for MySQL

导出连接记录，新安装后再导入。

	File - Export connections
	File - Import connections


### Notepad ++

	背景颜色为 255/250/232 或者 255/255/204


### ProxyCap

	http://www.proxycap.com/


### TortoiseSVN

	https://tortoisesvn.net/index.zh.html


### TortoiseGit

	https://tortoisegit.org/
	https://git-for-windows.github.io/


### 迅雷精简版

	http://mini.xunlei.com/

为避免因签名证书被吊销而导致拒绝运行，以管理员身份运行命令行，并在命令行中启动安装程序。


### 备份原有的 hosts 文件

	C:\Windows\System32\drivers\etc\hosts


### Quicker

### JDK

### NodeJS

### TightVNC - http://www.tightvnc.com/
