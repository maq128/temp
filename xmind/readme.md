#### 纯技术研究，切勿用于盗版！！！

#### 目标

	http://www.xmind.net/

	xmind-7.5-update1-windows.exe

	跳过注册序列号，解锁 Plus/Pro 功能。

#### 分析处理

	从 <XMind>\plugins\net.xmind.verify_3.6.51.201607142131.jar 文件中找到 net/xmind/verify/internal/LicenseVerifier.class

	反编译后对代码进行分析，核心算法在 doVerifyLicenseKey() 函数中。

	最后重写一个 net/xmind/verify/internal/LicenseVerifier.java，编译后覆盖回原来的 jar 文件即可。

	SET JAR_DIR=<XMind>\plugins\
	javac -d . -classpath "%JAR_DIR%\net.xmind.verify_3.6.51.201607142131.jar";"%JAR_DIR%\net.xmind.signin_3.6.51.201607142131.jar";"%JAR_DIR%\org.eclipse.equinox.common_3.7.0.v20150402-1709.jar" -encoding UTF8 net\xmind\verify\internal\LicenseVerifier.java
