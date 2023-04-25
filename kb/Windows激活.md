# Windows 激活

## 搭建 KMS

docker 启动 KMS 激活服务器：
```sh
docker run -d --name py-kms --restart always -p 1688:1688 ghcr.io/py-kms-organization/py-kms
```

注意事项：
- 只有使用 GVLK 秘钥才可以通过 KMS 激活。
- 实践结果，本机搭建的 KMS 激活失败，在局域网上另一台机器搭建是可以的，或者在虚拟机里搭建也可以，原因未明。
- KMS 激活后有效期为 180 天，期间如果 KMS 服务器一直有效的话会自动重复激活展期。

参考资料：
- https://github.com/Py-KMS-Organization/py-kms
- https://forums.mydigitallife.info/threads/50234-Emulated-KMS-Servers-on-non-Windows-platforms
- https://github.com/myanaloglife/py-kms
- 搭建自用 kms 激活服务器 https://blog.lmintlcx.com/post/0x0010/

## Windows 设置激活

以管理员权限执行激活命令（注意使用适当的产品序列号和运行 KMS 的主机 IP 地址）：
```cmd
slmgr /ipk W269N-WFGWX-YVC9B-4J6C9-T83GX
slmgr /skms 1.2.3.4
slmgr /ato
```

# Windows 产品序列号

WinXP:

    VLK - Volume Licensing Key

    T72KM-6GWBP-GX7TD-CXFT2-7WT2B (上海市政府0686版)
    QC986-27D34-6M3TY-JJXP9-TBGMD
    QHYXK-JCJRX-XXY8Y-2KX2X-CCXGD (广州政府版)
    MFBF7-2CK8B-93MDB-8MR7T-4QRCQ (北京市政府版)
    MRX3F-47B9T-2487J-KWKMF-RPWBY (工行版)

    MRX3F-47B9T-2487J-KWKMF-RPWBY (工行版) 可用
    QC986-27D34-6M3TY-JJXP9-TBGMD (台湾交大学生版) 可用
    CM3HY-26VYW-6JRYC-X66GX-JVY2D 可用
    DP7CM-PD6MC-6BKXT-M8JJ6-RPXGJ 可用
    F4297-RCWJP-P482C-YY23Y-XH8W3 可用
    HH7VV-6P3G9-82TWK-QKJJ3-MXR96 可用
    HCQ9D-TVCWX-X9QRG-J4B2Y-GR2TT 可用

Win81:

    http://www.iruanmi.com/windows-8-1-with-update-iso/

    核心版安装密钥：334NH-RXG76-64THK-C7CKG-D3VPT
    专业版安装密钥：XHQ8N-C3MCJ-RQXB6-WCHYG-C9WKB
    中文版安装密钥：TNH8J-KG84C-TRMG4-FFD7J-VH4WX
    单语言版安装密钥：Y9NXP-XT8MV-PT9TG-97CT3-9D6TC

    以下是各种版本对应的 GVLK 密钥（N 代表欧洲市场定制版）：

    Windows 8.1 Professional  : GCRJD-8NW9H-F2CDX-CCM8D-9D6T9
    Windows 8.1 Professional N: HMCNV-VVBFX-7HMBH-CTY9B-B4FXY
    Windows 8.1 Enterprise    : MHF9N-XY6XB-WVXMC-BTDCT-MKKG7
    Windows 8.1 Enterprise N  : TT4HM-HN7YT-62K67-RGRQJ-JFFXW

Win10:

    http://www.iwin10.com/jiaocheng/835.html

    专业版：VK7JG-NPHTM-C97JM-9MPGT-3V66T
    企业版：XGVPP-NMH47-7TTHJ-W3FW7-8HV2C
    教育版：YNMGQ-8RYV3-4PGQ3-C8XTP-7CFBY
    专业版N：2B87N-8KFHP-DKV6R-Y2C8J-PKCKT
    企业版N：WGGHN-J84D6-QYCPR-T7PJ7-X766F
    教育版N：84NGF-MHBT6-FXBX8-QWJK7-DRR8H
    企业版S：FWN7H-PF93Q-4GGP8-M8RF3-MDWWW
    单语言版：BT79Q-G7N6G-PGBYW-4YWX6-6F4BT

Windows 10 的 GVLK 密钥（N 代表欧洲市场定制版，S 代表长期服务分支）：

    PVMJN-6DFY6-9CCP6-7BKTT-D3WVR   Windows 10 CoreCountrySpecific
    7HNRX-D7KGG-3K4RQ-4WPJ4-YTDFH   Windows 10 CoreSingleLanguage
    3KHY7-WNT83-DGQKR-F7HPR-844BM   Windows 10 CoreN
    TX9XD-98N7V-6WMQ6-BX7FG-H8Q99   Windows 10 Core
    2WH4N-8QGBV-H22JP-CT43Q-MDWWJ   Windows 10 EducationN
    NW6C2-QMPVW-D7KKK-3GKT6-VCFB2   Windows 10 Education
    2F77B-TNFGY-69QQF-B8YKP-D69TJ   Windows 10 EnterpriseSN
    WNMTR-4C88C-JK8YV-HQ7T2-76DF9   Windows 10 EnterpriseS
    DPH2V-TTNVB-4X9Q3-TJR4H-KHJW4   Windows 10 EnterpriseN
    NPPR9-FWDCX-D2C8J-H872K-2YT43   Windows 10 Enterprise
    MH37W-N47XK-V7XM9-C7227-GCQG9   Windows 10 ProfessionalN
    W269N-WFGWX-YVC9B-4J6C9-T83GX   Windows 10 Professional

Office 2016 的 GVLK 密钥：

    GNH9Y-D2J4T-FJHGG-QRVH7-QPFDW   Office 2016 Access
    9C2PK-NWTVB-JMPW8-BFT28-7FTBF   Office 2016 Excel
    HFTND-W9MK4-8B7MJ-B6C4G-XQBR2   Office 2016 Mondo
    DR92N-9HTF2-97XKM-XW2WJ-XW3J6   Office 2016 OneNote
    R69KK-NTPKF-7M3Q4-QYBHW-6MT9B   Office 2016 Outlook
    J7MQP-HNJ4Y-WJ7YM-PFYGF-BY6C6   Office 2016 PowerPoint
    YG9NW-3K39V-2T3HJ-93F3Q-G83KT   Office 2016 ProjectPro
    GNFHQ-F6YQM-KQDGJ-327XX-KQBVC   Office 2016 ProjectStd
    XQNVK-8JYDB-WJ9W3-YJ8YR-WFG99   Office 2016 ProPlus
    F47MM-N3XJP-TQXJ9-BP99D-8K837   Office 2016 Publisher
    869NQ-FJ69K-466HW-QYCP2-DDBV6   Office 2016 SkypeforBusiness
    JNRGM-WHDWX-FJJG3-K47QV-DRTFM   Office 2016 Standard
    PD3PC-RHNGV-FXJ29-8JK7D-RJRJK   Office 2016 VisioPro
    7WHWN-4T7MP-G96JF-G33KR-W8GF4   Office 2016 VisioStd
    WXY84-JN2Q9-RBCCQ-3Q3J3-3PFJ6   Office 2016 Word
