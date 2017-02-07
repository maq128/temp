# 问题

在 Window 8/10 里，经常会遇到 cmd 窗口设置字体时发现“点阵字体”无法选择字号的问题，导致无法正常设置为点阵字体。


# 解决方法

> https://answers.microsoft.com/en-us/windows/forum/windows_7-desktop/cmdexe-raster-font-8x12-is-missing/3a205183-8c99-49e4-aac3-ef020177277e

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
