# 问题

在 Linux 系统上用 Apache + mod_svn 架设了 SVN Server，通过 TortoiseSVN 向 SVN Server 做提交，涉及到的文件数量特别多，结果在提交的过程中，可能由于发生的 HTTP 请求过多过密，导致服务器拒绝响应，提交失败。

# 解决方案

利用 Fiddler Web Debugger 作为网络代理，并在代理环节施加延迟操作，控制 HTTP 请求的密度，从而避免服务器拒绝响应。

# 具体方法

Fiddler Web Debugger 里选择菜单 Rules > Customize Rules ... 打开 CustomRules.js 文件。

在适当的位置添加下面这些内容：
```
	...

	import System.Threading;

	...

	// Cause Fiddler to delay HTTP traffic to simulate typical 56k modem conditions
	public static RulesOption("Limt &Request Frequency", "Per&formance")
	var m_LimitRequestFrequency: boolean = false;

	...

	if (m_LimitRequestFrequency) {
		// sleep 200ms, limit request frequency to 5qps
		Thread.Sleep(200);
	}
```
在 Fiddler Web Debugger 里选择菜单并勾选 Performance > Limt Request Frequency 即可以限制请求的密度（最多每秒 5 个请求）。

# 开启 SOCKS 代理

当 Fiddler 作为正向代理使用时，它转发 request 也可以配置为通过代理来转发，这个配置在 Tools > Options > Gateway。
但是这种方式是无法启用 SOCKS 代理的，所以还是需要用定制脚本来解决：
```
	public static RulesOption("Use SOCKS proxy 127.0.0.1:7070")
	var m_UseSocksProxy: boolean = false;

    static function OnBeforeRequest(oSession: Session) {
		// 通过 SOCKS 代理转发这个 request
		if (m_UseSocksProxy) {
			oSession["x-OverrideGateway"] = "socks=127.0.0.1:7070";
		}
		...
```

# 用 Fiddler 作反向代理

```
	public static RulesOption("Reverse proxy to :8082")
	var m_ReverseProxy: boolean = false;

    static function OnBeforeRequest(oSession: Session) {
		// 反向代理
		if (m_ReverseProxy && (oSession.port == 8888)) {
			oSession.port = 8082;
		}
		...
```
