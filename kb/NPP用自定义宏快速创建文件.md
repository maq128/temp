# 问题

希望能在 Notepad++ 里面快速生成一个原型文件，比如一个已经具有基本内容框架的 .html 文件。


# 解决方案

Notepad++ 支持自定义宏，可以用来重复执行一个特定的操作序列。通过录制、保存一个宏，就可以把创建一个新文件的过程录制下来，以后重放就可以了。

Notepad++ 的宏是跟快捷键联系在一起的，配置信息保存在 %AppData%\Notepad++\shortcuts.xml 文件里。


# 具体方法

在资源管理器地址栏里面输入 `%AppData%\Notepad++\` 打开该文件夹，找到 `shortcuts.xml` 并用文本编辑器打开。

在 NotepadPlus/Macros 中添加下面的内容：
```
<Macro name="New .html file" Ctrl="no" Alt="yes" Shift="yes" Key="72">
	<Action type="0" message="2025" wParam="0" lParam="0" sParam="" />
	<Action type="0" message="2422" wParam="0" lParam="0" sParam="" />
	<Action type="0" message="2325" wParam="0" lParam="0" sParam="" />
	<Action type="2" message="0" wParam="41001" lParam="0" sParam="" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="!" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="D" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="O" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="C" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="T" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="Y" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="P" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="E" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam=" " />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="h" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="m" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="h" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="m" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="h" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="a" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="d" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="m" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="a" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam=" " />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="c" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="h" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="a" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="r" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="=" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="U" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="T" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="F" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="-" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="8" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="i" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="/" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="i" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="i" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="n" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="k" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam=" " />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="r" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="=" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="y" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="h" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam=" " />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="y" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="p" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="=" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="x" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="/" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="c" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam=" " />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="h" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="r" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="f" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="=" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="a" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="p" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="p" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="." />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="c" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="y" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="." />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="b" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="o" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="d" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="y" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam=" " />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="{" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="0" message="2327" wParam="0" lParam="0" sParam="" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="f" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="o" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="n" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="-" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="i" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="z" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam=":" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="1" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="2" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="p" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="x" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam=";" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="}" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="/" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="y" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="c" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="r" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="i" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="p" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam=" " />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="r" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="c" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="=" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="a" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="p" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="p" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="." />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="j" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam='&quot;' />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="/" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="s" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="c" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="r" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="i" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="p" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="/" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="h" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="e" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="a" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="d" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="b" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="o" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="d" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="y" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="/" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="b" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="o" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="d" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="y" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&lt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="/" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="h" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="t" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="m" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="l" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&gt;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000D;" />
	<Action type="1" message="2170" wParam="0" lParam="0" sParam="&#x000A;" />
</Macro>
```
这将会产生一个名为 `New .html file` 的宏，并绑定快捷键 Alt-Shift-H，使用它可以快速创建一个新文件，内容如下：
```
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title></title>
<link rel="stylesheet" type="text/css" href="app.css">
<style>
.body {
	font-size:12px;
}
</style>
<script src="app.js"></script>
</head>
<body>
</body>
</html>
```
