# 常用命令

在宿主环境：
```
# 查看所有的 distro 列表
wsl -l -v

# 用指定的帐号进入一个 distro
wsl -d Ubuntu -u root
```

在 distro 里面：
```
# 查看 ip 地址
ip addr
```

# 在宿主系统（Windows10）直接访问 distro 的文件系统

在资源管理器里面访问 `\\wsl$` 可以直接访问所有 distro 的文件系统。

在 distro 里面调起宿主环境的资源管理器打开特定的目录：
```
cd /
explorer.exe .
```

# 关于宿主机与 distro 之间的网络互访

distro 里面启动的网络服务，在宿主机这边可以通过 localhost 访问到。

在 distro 里面要访问宿主机的网络服务时，需要通过宿主机的 IP 地址来访问。

在 distro 里面执行命令 `cat /etc/resolv.conf`，在 `nameserver` 后面的就是宿主机的 IP 地址。

# 配置 WSL

[Configure Linux distributions](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#options-for-wslconfig)

# 缺省使用 root 登录

先在 distro 里面为 root 设置登录密码：
```
sudo passwd
```
再回到宿主环境修改配置：
```
ubuntu config --default-user root
```

# 创建多个 distro

```
# 导出已有的 distro
wsl --export Ubuntu D:\WSL\Ubuntu.tar

# 导入为新的 distro
wsl --import Ubuntu2 D:\WSL\Ubuntu2 D:\WSL\Ubuntu.tar

# 进入指定的 distro
wsl -d Ubuntu2

# 删除一个 distro
wsl --unregister Ubuntu2
```

# 在 Ubuntu 里面安装 Golang

下载适当的 Golang 程序包并解压到 `/usr/local/go`：
```
wget https://golang.org/dl/go1.17.1.linux-amd64.tar.gz
tar -xzf go1.17.1.linux-amd64.tar.gz -C /usr/local
```

创建 GOPATH 目录，并在 `~/.bashrc` 里面设置必要的环境变量：
```
export GOROOT=/usr/local/go
export GOPATH=/root/gowork
export GOPROXY=https://goproxy.cn,direct
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
```
或者，如果希望共用宿主环境的 GOPATH 目录的话：
```
export GOROOT=/usr/local/go
export GOPATH=/mnt/c/Users/maq/go
export GOPROXY=https://goproxy.cn,direct
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
```

# 在 Ubuntu 里面安装 nodejs/npm

apt update
apt install nodejs npm

# 安装 docker

```
sudo apt-get update
sudo apt-get install \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
sudo service docker start
sudo curl --proxy socks5://192.168.176.1:7070 -L "https://github.com/docker/compose/releases/download/1.29.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

# 开启 ssh 登录

```
# 创建必要的节点密钥文件
ssh-keygen -t dsa -f /etc/ssh/ssh_host_dsa_key
ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key
chmod 600 /etc/ssh/ssh_host_dsa_key
chmod 600 /etc/ssh/ssh_host_rsa_key

# 用 vi 或 nano 编辑 /etc/ssh/sshd_config 文件，确保存在下面两条内容
PasswordAuthentication yes
PermitRootLogin yes

# 启动服务
service ssh restart

# 在宿主机上可以通过 localhost 访问 WSL2 distro
ssh root@localhost

# 如果用 root 帐号登录，需先设置 root 密码
passwd
```

# 改掉不容易看清的蓝色文字

在 `.bashrc` 文件的末尾增加如下两行即可设置所需的颜色（其中 `di=1;37` 这项用于控制目录的显示颜色）：
```
LS_COLORS='rs=0:di=1;37:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arj=01;31:*.taz=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.zip=01;31:*.z=01;31:*.Z=01;31:*.dz=01;31:*.gz=01;31:*.lz=01;31:*.xz=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.jpg=01;35:*.jpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.axv=01;35:*.anx=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.axa=00;36:*.oga=00;36:*.spx=00;36:*.xspf=00;36:';
export LS_COLORS
```
