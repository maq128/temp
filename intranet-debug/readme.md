#### 问题场景

一般在进行网站开发的时候，都是在自己桌面电脑上架设 web server、数据库、IDE 来构成调试开发环境。

对于一般的网站开发这样就够了，但有些时候需要这个 web server 在公网上能够被访问到，比如当程序要对接微信公众号的时候，需要在微信公众平台上为这个公众号设置回调地址，而微信公众平台服务器将通过指定的回调地址向自己的 web server 发送请求来实现通知回调。

多数情况下，公司网络的出口都会有一个固定 IP，并允许从外部访问 80 端口，所以只要在出口的路由器上简单设置一个 NAT 映射，即可以达成上述目标。

但是，如果同一个办公室中有多个程序开发人员都有这样的需求，问题就变得复杂了。

#### 目标

在一个办公室内网中，有多台机器都架设了 web server 作为软件调试开发环境，需要从公网上用不同的域名分别访问到它们。同时希望配置的维护工作尽量简单，不要为增加一台开发机器而专门修改配置。

#### 基本思路

1. 泛域名解析

	假设公司拥有主域名为 abc.com，我们约定 *.debug.abc.com 作为调试用的域名，并通过设置泛域名解析把这种形式的域名都解析到公司网络出口的 IP 地址上，这样每一台开发用的机器都可以为自己安排一个单独的域名（比如 zhangsan.debug.abc.com）。

2. NAT 和反向代理

	在内网中单独架设一台服务器 S，并在出口路由器上设置 NAT，把来自公网的对 80 端口的访问请求都转发到 S 上。

	在 S 上安装 Nginx 作为反向代理，对不同域名的请求转发到各自对应的机器上（比如把 http://zhangsan.debug.abc.com/ 转发给 192.168.0.123）。

3. 动态维护域名与内网 IP 之间的映射关系

	如何维护“域名→IP”的映射关系呢？我们可以在 Nginx 反向代理服务器上安装 Lua 扩展模块，并定义一个特殊的请求路径（比如 /iamhere）用于注册一个映射关系，然后在处理每个请求的时候根据当时的映射表来决定转发给哪个  IP。

#### 反向代理服务器的安装、配置

1. 安装 Nginx（或者 Tengine），要包含 lua-nginx-module 模块。

	可以直接安装软件包，也可以采用源代码编译安装，具体操作略。

2. Nginx 配置文件：

		lua_shared_dict debug_hosts 1m;
		server {
			listen			80;
			server_name		*.debug.abc.com;
			default_type	text/html;

			set $upstream "";

			location ~ /iamhere(/(.+))? {
				set $request_ip $2;
				content_by_lua_block {
					local debug_hosts = ngx.shared.debug_hosts;
					local cur_host = ngx.var.http_host;
					local ip = ngx.var.request_ip;
					if ip == nil or string.len(ip) == 0 then
						ip = ngx.var.remote_addr;
					end
					debug_hosts:set(cur_host, ip);
					ngx.say('mapping ' .. cur_host .. ' to ' .. ip);
				}
			}

			location = /no-debug-host.html {
				content_by_lua_block {
					ngx.say('no-debug-host');
				}
			}

			location / {
				rewrite_by_lua_block {
					local debug_hosts = ngx.shared.debug_hosts;
					local cur_host = ngx.var.http_host;
					local ip = debug_hosts:get(cur_host);
					if ip == nil or string.len(ip) == 0 then
						return ngx.redirect("/no-debug-host.html");
					else
						ngx.var.upstream = ip;
					end
				}

				proxy_pass http://$upstream:80;
				proxy_set_header Host $host;
				proxy_set_header X-Real-IP $remote_addr;
				proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			}
		}

3. 使用：

	一台开发机想把自己注册为 zhangsan.debug.abc.com 的话，可以发送下面这个请求：

		http://zhangsan.debug.abc.com/iamhere

	或者

		http://zhangsan.debug.abc.com/iamhere/192.168.0.123

	后一种形式适用于当内网存在路由级联的情况，服务器 S 无法直接获取开发机的内网 IP 地址。

	经过这样的注册之后，无论从内网还是从公网，都可以访问 http://zhangsan.debug.abc.com/ 了。

4. 关于安全性的考虑：

	这个方案并没有设计严格的访问控制机制，也没有验证每条注册信息的合法性，如果使用不当，会导致映射错误进而访问失败。

	考虑到具体的应用背景，这样的处理方式似乎并不会产生太多的问题。唯一值得考虑增加的安全防范措施就是，/iamhere 这个请求应该只允许从内网访问，禁止从公网访问。
