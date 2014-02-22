/*
    功能：
        以 TABLE 的形式构建一个 Tree（每个 TR 表示一个节点），并处理其动态显示。

    特性：
        o 两种方式构建 Tree，也可以结合使用
            ·动态生成 - 根据数据的定义，动态生成 tree 的实体结构
            ·静态改造 - 把已经存在的 TABLE 改造成为 tree
        o 每个节点可以带一个自定义数据（custom data）；对于 StaticTree，custom data 只能是字符串
        o 可以以 skin 方式定制界面风格
            ·目前提供三种 skin：PureSkin、CharSkin、ImageSkin
        o 每个节点有“标题（caption）区”、“扩展区（ext）”供使用
        o 可以通过 TR.setIcon() 设定节点行的图标，如果不设置，将启用 skin 提供的缺省图标
        o 提供 TR.highlight() 和 TABLE.unhighlight() 函数供调用
        o 指定为 hot 的节点，其所在分支被全部高亮显示，并缺省展开
        o TBD（to be download）功能
            ·指定为 TBD 的节点，在展开时，将引发 download 操作，进而填充其分支下的内容
            ·两级可定制的 onDownloadDone 函数接口（TABLE 级和 TR 级）
            ·如果下载失败，可以点击“重新下载”

    TODO：
        o getLastChildRowIndex() 的计算方法（依赖 childItems.sort()）可以考虑优化
*/

var N_ITEM_COLLAPSED = 0;
var N_ITEM_EXPANDED  = 1;
var N_ITEM_TBD       = 2; // To Be Download
var N_ITEM_LEAF      = 3;
var N_ITEM_NOTICE    = 4;
var N_ITEM_DOWNLOADER= 5;

function TreeBuilder() {
    // 动态创建一个 Tree
    this.createTree = TreeBuilder_createTree;
    function TreeBuilder_createTree() {
        var oTABLE = document.createElement("TABLE");
        var oTBODY = document.createElement("TBODY");
        oTABLE.insertAdjacentElement("beforeEnd", oTBODY);
        oTABLE.cellSpacing = 0;
        oTABLE.cellPadding = 0;

        oTABLE.theBody = oTBODY;
        oTABLE.parentItem = null;  // 这是一个标志，表示是虚拟的根节点
        oTABLE.childItems = new Array();
        oTABLE.skin = new ImageSkin();

        oTABLE.appendItem = TreeBuilder_appendItem;
        oTABLE.finish = TreeBuilder_finish;
        oTABLE.unhighlight = TreeBuilder_unhighlight;
        oTABLE.onDownloadDone = null;

        return oTABLE;
    }

    // 把一个已经存在的 TABLE 改造成为 Tree
    // 改造的依据是：含有 lv 属性的 TR 将被改造为“节点行”对象
    this.rebuildTree = TreeBuilder_rebuildTree;
    function TreeBuilder_rebuildTree(oTABLE, skin) {
        if (typeof(skin) == "undefined") skin = new ImageSkin();

        oTABLE.theBody = oTABLE.tBodies(0);
        oTABLE.parentItem = null;  // 这是一个标志，表示是虚拟的根节点
        oTABLE.childItems = new Array();
        oTABLE.skin = skin;

        oTABLE.appendItem = TreeBuilder_appendItem;
        oTABLE.finish = TreeBuilder_finish;
        oTABLE.unhighlight = TreeBuilder_unhighlight;
        oTABLE.onDownloadDone = null;

        var oPrevItem = null;
        for (var i=0; i < oTABLE.rows.length; i++) {
            if (typeof(oTABLE.rows(i).lv) != "undefined") {
                var itemdata = new TreeItemData(0, "", false, "", null);
                var oTR = itemdata.rebuildItem(oTABLE.rows(i));

                if (oPrevItem == null) {
                    // 这是 TABLE 中的第一个“节点行”
                    oTR.setParentTo(oTABLE);
                } else {
                    // 找到“级别不低于本节点”的节点
                    while (oPrevItem.lv > oTR.lv) {
                        oPrevItem = oPrevItem.parentItem;
                    }
                    if (oTR.lv == oPrevItem.lv) {
                        // 找到的 oPrevItem 是 oTR 的兄弟节点
                        oTR.setParentTo(oPrevItem.parentItem);
                    } else {
                        // 找到的 oPrevItem 是 oTR 的父节点
                        oTR.setParentTo(oPrevItem);
                    }
                }

                oPrevItem = oTABLE.rows(i);
            }
        }

        oTABLE.childItems.sort(CompareChildOrder);
        for (var i=0; i<oTABLE.childItems.length; i++) {
            oTABLE.childItems[i].showItemRecursive(true);
        }
    }

    // 插入一个新的“节点行”对象
    function TreeBuilder_appendItem(itemdata) {
        // this 是一个“TABLE”对象

        // 创建节点行对象
        var oTR = itemdata.renderItem(this);

        // 把该对象添加到 Tree 的最后一行
        this.theBody.insertAdjacentElement("beforeEnd", oTR);

        // 把该对象挂接到合适的父节点

        // 在 TABLE 中找到上一个“节点行”
        var oPrevItem = null;
        FindPrevItem: {
            for (var i=oTR.rowIndex-1; i>=0; i--) {
                if (typeof(this.rows(i).lv) != "undefined") {
                    oPrevItem = this.rows(i);
                    break FindPrevItem;
                }
            }
            // 如果没有找到，说明这是一个新的顶级节点
            oTR.setParentTo(this);
            return oTR;
        }

        // 找到“级别不低于本节点”的节点
        while (oPrevItem.lv > oTR.lv) {
            oPrevItem = oPrevItem.parentItem;
        }
        if (oTR.lv == oPrevItem.lv) {
            // 找到的 oItem 是 oTR 的兄弟节点
            oTR.setParentTo(oPrevItem.parentItem);
        } else {
            // 找到的 oItem 是 oTR 的父节点
            oTR.setParentTo(oPrevItem);
        }
        return oTR;
    }

    // 结束动态 Tree 的构建，刷新显示
    function TreeBuilder_finish() {
        // this 是一个“TABLE”对象

        this.childItems.sort(CompareChildOrder);
        for (var i=0; i<this.childItems.length; i++) {
            this.childItems[i].showItemRecursive(true);
        }
    }

    // 把所有节点行的颜色恢复到标准状态
    function TreeBuilder_unhighlight() {
        // this 是一个“TABLE”对象

        for (var i = 0; i < this.rows.length; i++) {
            if (typeof(this.rows(i).highlight) == "function") {
                this.rows(i).highlight(null);
            }
        }
    }
}

function TreeItemData(level, text, hot, dlurl, cdata) {
    this.level = level;
    this.text = text;
    this.hot = (hot == true) ? true : false; // 缺省的是 false
    this.dlurl = (typeof(dlurl) == "string" && dlurl != "") ? dlurl : null;

    this.cdata = (typeof(cdata) == "undefined") ? null : cdata;

/*
    每个“节点行”对象的自定义属性有：
       lv           - 缩进的级次，0,1,2...，该属性只在初始化时使用，用于分析树型结构
       hot          - 节点是否为 hot。hot 型节点所在的分支将被全部高亮显示。该属性只在初始化时使用
       dlurl        - N_ITEM_TBD 型的节点用于下载的网址
       cdata        - 附带的 custom data
       st           - 节点的当前状态（或称节点类型），N_ITEM_COLLAPSED / N_ITEM_EXPANDED / N_ITEM_TBD / N_ITEM_LEAF / N_ITEM_NOTICE / N_ITEM_DOWNLOADER
       hicolor      - highlight 的颜色，若为 null，则使用缺省颜色
       iconstr      - 定制的 ICON，若为 null，将启用缺省图标
       skin         - 从 TABLE 继承过来的 skin 对象
       parentItem   - 父节点对象。顶级节点的 parentItem 是 TABLE 对象
       childItems   - 所有子节点
       prefix       - 用于显示分支连线的 SPAN 对象
       handle       - 用于展开/折叠一个分支的 SPAN 对象
       icon         - 用于显示图标的 SPAN 对象
       caption      - 用于显示节点文字内容的 SPAN 对象
       ext          - 用于显示扩展内容的 SPAN 对象
*/

    // 根据 TreeItemData，生成一个“节点行”对象
    this.renderItem = TreeItemData_renderItem;
    function TreeItemData_renderItem(oRef) {
        // this 是一个“TreeItemData”对象

        // 创建节点行对象
        var oTR = document.createElement("TR");
        oTR.lv = this.level;
        oTR.hot = this.hot;
        oTR.dlurl = this.dlurl;
        oTR.cdata = this.cdata;
        oTR.st = N_ITEM_LEAF;
        oTR.hicolor = null;
        oTR.iconstr = null;
        oTR.skin = TreeItemData_getAncestorOfTag(oRef, "TABLE").skin;
        oTR.childItems = new Array();

        var oTD = document.createElement("TD");
        oTR.insertAdjacentElement("beforeEnd", oTD);
        oTD.style.cursor = "default";
        oTD.style.paddingLeft = this.level * oTR.skin.N_INDENT;
        oTD.noWrap = true;
        oTD.innerHTML = "<span></span><span></span><span></span><span></span><span></span>";

        oTR.prefix = oTR.all.tags("SPAN")[0];
        oTR.prefix.style.cssText = oTR.skin.STR_STYLE_PREFIX;

        oTR.handle = oTR.all.tags("SPAN")[1];
        oTR.handle.style.cssText = oTR.skin.STR_STYLE_HANDLE;

        oTR.icon = oTR.all.tags("SPAN")[2];
        oTR.icon.style.cssText = oTR.skin.STR_STYLE_ICON;

        oTR.caption = oTR.all.tags("SPAN")[3];
        oTR.caption.innerHTML = this.text;

        oTR.ext = oTR.all.tags("SPAN")[4];

        oTR.insertBefore = TreeItemData_insertBefore;
        oTR.setParentTo = TreeItemData_setParentTo;
        oTR.showItemRecursive = TreeItemData_showItemRecursive;
        oTR.getLastChildRowIndex = TreeItemData_getLastChildRowIndex;
        oTR.remove = TreeItemData_remove;
        oTR.highlight = TreeItemData_highlight;
        oTR.setIcon = TreeItemData_setIcon;
        oTR.redraw = TreeItemData_redraw;

        return oTR;
    }

    // 把 TABLE 中一个已经存在的 TR 改造成“节点行”对象
    this.rebuildItem = TreeItemData_rebuildItem;
    function TreeItemData_rebuildItem(oItem) {
        // this 是一个“TreeItemData”对象

        // 创建节点行对象
        var oTR = oItem;
        this.level = oTR.lv;
        this.hot = oTR.hot;
        this.dlurl = oTR.dlurl;
        this.cdata = oTR.cdata;
        oTR.st = N_ITEM_LEAF;
        oTR.hicolor = null;
        oTR.iconstr = null;
        oTR.skin = TreeItemData_getAncestorOfTag(oItem, "TABLE").skin;
        oTR.childItems = new Array();

        var oTD = oItem.cells(0);
        this.text = oTD.innerText;
        oTD.style.cursor = "default";
        oTD.style.paddingLeft = this.level * oTR.skin.N_INDENT;
        oTD.noWrap = true;
        oTD.innerHTML = "<span></span><span></span><span></span><span></span><span></span>";

        oTR.prefix = oTR.all.tags("SPAN")[0];
        oTR.prefix.style.cssText = oTR.skin.STR_STYLE_PREFIX;

        oTR.handle = oTR.all.tags("SPAN")[1];
        oTR.handle.style.cssText = oTR.skin.STR_STYLE_HANDLE;

        oTR.icon = oTR.all.tags("SPAN")[2];
        oTR.icon.style.cssText = oTR.skin.STR_STYLE_ICON;

        oTR.caption = oTR.all.tags("SPAN")[3];
        oTR.caption.innerHTML = this.text;

        oTR.ext = oTR.all.tags("SPAN")[4];

        oTR.insertBefore = TreeItemData_insertBefore;
        oTR.setParentTo = TreeItemData_setParentTo;
        oTR.showItemRecursive = TreeItemData_showItemRecursive;
        oTR.getLastChildRowIndex = TreeItemData_getLastChildRowIndex;
        oTR.remove = TreeItemData_remove;
        oTR.highlight = TreeItemData_highlight;
        oTR.setIcon = TreeItemData_setIcon;
        oTR.redraw = TreeItemData_redraw;

        return oTR;
    }

    // 把一个“节点行”对象插入到 TABLE 中一个指定的节点之前，同时挂接到 tree 中，成为其“哥哥节点”
    function TreeItemData_insertBefore(oSibling) {
        // this 是一个“节点行”对象
        oSibling.insertAdjacentElement("beforeBegin", this);
        this.setParentTo(oSibling.parentItem);
    }

    // 把 TABLE 中已经存在的一个“节点行”对象挂接到指定的节点下，成为其子节点
    function TreeItemData_setParentTo(oParentItem) {
        // this 是一个“节点行”对象

        this.parentItem = oParentItem;
        oParentItem.childItems.push(this);

        if (oParentItem.tagName == "TR") {
            if (oParentItem.st == N_ITEM_LEAF || oParentItem.st == N_ITEM_TBD) {
                // 如果父节点只是一个“叶子”，或者是 TBD，要先将其改造为一个“分支”
                oParentItem.st = N_ITEM_COLLAPSED;

                oParentItem.handle.style.cssText = this.skin.STR_STYLE_HANDLE;
                oParentItem.handle.onclick = TreeItemData_onClickHandle;
            }
        }

        if (this.hot) {
            // 如果该节点是“hot”，则将其上游一支全部置为“hot”，并缺省展开
            var oItem = this;
            oItem.style.fontWeight = "bold";
            oItem = oItem.parentItem;
            while (oItem.tagName == "TR") {
                oItem.st = N_ITEM_EXPANDED;
                oItem.hot = true;
                oItem.style.fontWeight = "bold";
                oItem = oItem.parentItem;
            }
        }

        if (this.dlurl != null) {
            // 如果该节点是“to be download”
            this.st = N_ITEM_TBD;

            this.handle.style.cssText = this.skin.STR_STYLE_HANDLE;
            this.handle.onclick = TreeItemData_onClickHandle;
        }
    }

    // 取得一个节点的最后一个子节点的行序号
    // （计算的前提条件是： childItems 是适当排序的）
    function TreeItemData_getLastChildRowIndex() {
        // this 是一个“节点行”对象
        var ri = -1;
        if (this.childItems.length > 0) {
            ri = this.childItems[this.childItems.length - 1].rowIndex;
        }
        return ri;
    }

    // 把一个节点及其所有子节点从 tree 中摘除，同时从 TABLE 中删除
    function TreeItemData_remove(bFirstCall) {
        // this 是一个“节点行”对象
        bFirstCall = (typeof(bFirstCall) == "undefined") ? true : false;

        // 递归删除本节点下的所有子节点
        while (this.childItems.length > 0) {
            this.childItems[0].remove(false);
        }

        // 把本节点从父节点的 childItems 中摘除
        var oPrevSibling = null;
        var oParentItem = this.parentItem;
        for (var i=0; i<oParentItem.childItems.length; i++) {
            if (oParentItem.childItems[i] == this) {
                if (i == (oParentItem.childItems.length - 1) && i > 0) {
                    // 如果本节点是“么弟节点”，要记录下其“相邻哥哥节点”
                    oPrevSibling = oParentItem.childItems[i - 1];
                }
                oParentItem.childItems.splice(i, 1);
                break;
            }
        }

        // 把本“节点行”从 TABLE 中删除
        this.parentElement.removeChild(this);

        // 在最后离开递归过程的时候，刷新本节点的“相邻哥哥节点”
        if (bFirstCall && oPrevSibling != null) {
            oPrevSibling.showItemRecursive(true);
        }
    }

    // 递归处理一个节点及其下游节点的显示/隐藏
    function TreeItemData_showItemRecursive(bShow) {
        // this 是一个“节点行”对象
        this.style.display = bShow ? "inline" : "none";
        this.redraw();
        if (bShow && this.st == N_ITEM_EXPANDED) {
            // 递归处理下游的每个分支
            for (var i=0; i<this.childItems.length; i++) {
                this.childItems[i].showItemRecursive(true);
            }
        } else {
            // 将下游所有的节点都隐藏掉
            for (var i=0; i<this.childItems.length; i++) {
                this.childItems[i].showItemRecursive(false);
            }
        }
    }

    // 重新计算“节点行”对象的外观
    function TreeItemData_redraw() {
        // this 是一个“节点行”对象

        // 计算 prefix
        var prefix = "";
        var oChildItem = this;
        var oParentItem = oChildItem.parentItem;
        if (oParentItem.tagName == "TR") {
            if (oChildItem.st == N_ITEM_LEAF || oChildItem.st == N_ITEM_NOTICE || oChildItem.st == N_ITEM_DOWNLOADER) {
                // 只有非顶级的叶子节点，才会有这个 prefix 项（其它行的这个位置显示的是 handle）
                if (oChildItem.rowIndex == oParentItem.getLastChildRowIndex())
                    prefix = this.skin.STR_PREFIX_LUR + prefix;
                else
                    prefix = this.skin.STR_PREFIX_LURD + prefix;
            }

            oChildItem = oParentItem;
            oParentItem = oChildItem.parentItem;
        }
        // 根据每级祖先是否为“么弟”，决定对应的 prefix 项的形状
        while (oParentItem.tagName == "TR") {
            if (oChildItem.rowIndex == oParentItem.getLastChildRowIndex())
                prefix = this.skin.STR_PREFIX_L + prefix;
            else
                prefix = this.skin.STR_PREFIX_LUD + prefix;

            oChildItem = oParentItem;
            oParentItem = oChildItem.parentItem;
        }
        // 如果不是顶级节点，还要再增加一个 prefix 项
        if (this.parentItem.tagName == "TR") prefix = this.skin.STR_PREFIX_L + prefix;
        this.prefix.innerHTML = prefix;

        // 计算 handle
        var handle = "";
        switch (this.st) {
        case N_ITEM_COLLAPSED:
            if (this.parentItem.tagName == "TR") {
                if (this.rowIndex == this.parentItem.getLastChildRowIndex())
                    handle = this.skin.STR_HANDLE_COL_UR;
                else
                    handle = this.skin.STR_HANDLE_COL_URD;
            } else {
                handle = this.skin.STR_HANDLE_COL_R;
            }
            break;

        case N_ITEM_EXPANDED:
            if (this.parentItem.tagName == "TR") {
                if (this.rowIndex == this.parentItem.getLastChildRowIndex())
                    handle = this.skin.STR_HANDLE_EXP_UR;
                else
                    handle = this.skin.STR_HANDLE_EXP_URD;
            } else {
                handle = this.skin.STR_HANDLE_EXP_R;
            }
            break;

        case N_ITEM_TBD:
            if (this.rowIndex == this.parentItem.getLastChildRowIndex())
                handle = this.skin.STR_HANDLE_TBD_UR;
            else
                handle = this.skin.STR_HANDLE_TBD_URD;
            break;

        case N_ITEM_LEAF:
        case N_ITEM_NOTICE:
        case N_ITEM_DOWNLOADER:
            break;
        }
        this.handle.innerHTML = handle;

        // 计算 icon
        if (this.iconstr == null) {
            this.icon.innerHTML = this.skin.getDefIconString(this.st);
        } else {
            this.icon.innerHTML = this.iconstr;
        }

        // 计算颜色（为高亮显示）
        if (this.hicolor == null) {
            this.style.color = this.skin.getDefColorString(this.st);
        } else {
            this.style.color = this.hicolor;
        }
    }

    // 把“节点行”对象设定成指定的“高亮显示”状态
    function TreeItemData_highlight(hicolor) {
        // this 是一个“节点行”对象
        if (hicolor == "") hicolor = null;
        this.hicolor = hicolor;
        this.redraw();
    }

    // 为“节点行”对象设定特别的 icon
    function TreeItemData_setIcon(iconstr) {
        // this 是一个“节点行”对象
        if (iconstr == "") iconstr = null;
        this.iconstr = iconstr;
        this.redraw();
    }

    // 处理每个“节点行”对象 handle 的点击操作
    function TreeItemData_onClickHandle() {
        var oItem = TreeItemData_getAncestorOfTag(event.srcElement, "TR");

        switch (oItem.st) {
        case N_ITEM_COLLAPSED:
            oItem.st = N_ITEM_EXPANDED;
            oItem.showItemRecursive(true);
            break;

        case N_ITEM_EXPANDED:
            oItem.st = N_ITEM_COLLAPSED;
            oItem.showItemRecursive(true);
            break;

        case N_ITEM_TBD:
            // 对于 TBD 型节点，启动下载操作
            oDownloader = (new TreeItemData(oItem.lv + 1, "正在下载，请稍候……")).renderItem(oItem);
            oItem.insertAdjacentElement("afterEnd", oDownloader);
            oDownloader.setParentTo(oItem);
            oDownloader.st = N_ITEM_DOWNLOADER;
            oDownloader.addBehavior("#default#download");
            oItem.st = N_ITEM_EXPANDED;
            oItem.showItemRecursive(true);

            TreeItemData_startDownload(oDownloader, oItem.dlurl);
            break;
        }
    }

    // 对于下载不成功的节点，重新启动下载操作
    function TreeItemData_onReDownload() {
        oDownloader = event.srcElement.parentElement.parentElement;
        oDownloader.st = N_ITEM_DOWNLOADER;
        oDownloader.redraw();

        var oLauncher = oDownloader.parentItem;
        TreeItemData_startDownload(oDownloader, oLauncher.dlurl);
    }

    // 当展开一个 TBD 型节点时，启动相应的下载操作
    function TreeItemData_startDownload(oDownloader, dlurl) {
        oDownloader.dr = -1; // download result
        oDownloader.startDownload(dlurl, TreeItemData_onDownloadDone);

        var oParentItem = oDownloader.parentItem;
        if (oDownloader.dr < 1) {
            if (oDownloader.dr == -1) {
                oDownloader.caption.innerText = "下载失败";
                oDownloader.st = N_ITEM_NOTICE;
            } else if (oDownloader.dr == -2) {
                oDownloader.caption.innerText = "数据格式错误";
                oDownloader.st = N_ITEM_NOTICE;
            } else if (oDownloader.dr == 0) {
                oDownloader.caption.innerText = "（无内容）";
                oDownloader.st = N_ITEM_TBD;
            }
            oDownloader.caption.style.cursor = "hand";
            oDownloader.caption.title = "重新下载";
            oDownloader.caption.onclick = TreeItemData_onReDownload;
            oDownloader.redraw();
        } else {
            // 删除 oDownloader 自己
            oDownloader.remove();
            oDownloader = null;
        }

        oParentItem.showItemRecursive(true);
    }

    // 下载成功后的处理
    function TreeItemData_onDownloadDone(s) {
        oDownloader.dr = 1;

        // 先检查 TBD “节点行”对象上定义的 onDownloadDone
        var oLauncher = oDownloader.parentItem;
        if (typeof(oLauncher.onDownloadDone) == "function") {
            oLauncher.onDownloadDone(oDownloader, s);
            return;
        }

        // 再检查 TABLE 对象上定义的 onDownloadDone
        var oTABLE = oDownloader.parentElement.parentElement;
        if (typeof(oTABLE.onDownloadDone) == "function") {
            oTABLE.onDownloadDone(oDownloader, s);
        }
    }

    // 获取指定元素外围的特定类型的元素
    function TreeItemData_getAncestorOfTag(from, tag) {
        while (from != null) {
            if (from.tagName == tag) return from;
            from = from.parentNode;
        }
        return null;
    }
}

// 一个比较函数，供 childItems.sort() 使用
// 入口参数应该为两个 TR 对象，排序的依据是它们的 rowIndex
function CompareChildOrder(tr1, tr2) {
    return tr1.rowIndex - tr2.rowIndex;
}

function PureSkin() {
    this.N_INDENT = 15;

    this.STR_STYLE_PREFIX = "width:0";
    this.STR_STYLE_HANDLE = "cursor:hand;font-family:Wingdings;font-weight:normal;width:12px;color:seagreen;";
    this.STR_STYLE_ICON = "font-family:Wingdings;font-weight:normal;width:19px;padding-left:2px;";

    this.STR_PREFIX_L = "";
    this.STR_PREFIX_LUD = "";
    this.STR_PREFIX_LUR = "";
    this.STR_PREFIX_LURD = "";

    this.STR_HANDLE_COL_R = "&#240;";
    this.STR_HANDLE_COL_UR = "&#240;";
    this.STR_HANDLE_COL_URD = "&#240;";

    this.STR_HANDLE_EXP_R = "&#242;";
    this.STR_HANDLE_EXP_UR = "&#242;";
    this.STR_HANDLE_EXP_URD = "&#242;";

    this.STR_HANDLE_TBD_R = "&#240;";
    this.STR_HANDLE_TBD_UR = "&#240;";
    this.STR_HANDLE_TBD_URD = "&#240;";

    this.getDefIconString = PureSkin_getDefIconString;
    function PureSkin_getDefIconString(n) {
        switch (n) {
            case N_ITEM_COLLAPSED:  return "&#48;";
            case N_ITEM_EXPANDED:   return "&#49;";
            case N_ITEM_TBD:        return "&#48;";
            case N_ITEM_LEAF:       return "&#119;";
            case N_ITEM_NOTICE:     return "&#178;";
            case N_ITEM_DOWNLOADER: return "&#91;";
        }
        return "&#76;";
    }

    this.getDefColorString = PureSkin_getDefColorString;
    function PureSkin_getDefColorString(n) {
        switch (n) {
            case N_ITEM_COLLAPSED:  return "";
            case N_ITEM_EXPANDED:   return "";
            case N_ITEM_TBD:        return "gray";
            case N_ITEM_LEAF:       return "";
            case N_ITEM_NOTICE:     return "red";
            case N_ITEM_DOWNLOADER: return "blue";
        }
        return "red";
    }
}

function CharSkin() {
    this.N_INDENT = 0;

    this.STR_STYLE_PREFIX = "font-weight:normal;";
    this.STR_STYLE_HANDLE = "cursor:hand;font-weight:normal;";
    this.STR_STYLE_ICON = "font-weight:normal;";

    this.STR_PREFIX_L = "";
    this.STR_PREFIX_LUD = "│";
    this.STR_PREFIX_LUR = "└";
    this.STR_PREFIX_LURD = "├";

    this.STR_HANDLE_COL_R = "●";
    this.STR_HANDLE_COL_UR = "●";
    this.STR_HANDLE_COL_URD = "●";

    this.STR_HANDLE_EXP_R = "○";
    this.STR_HANDLE_EXP_UR = "○";
    this.STR_HANDLE_EXP_URD = "○";

    this.STR_HANDLE_TBD_R = "◎";
    this.STR_HANDLE_TBD_UR = "◎";
    this.STR_HANDLE_TBD_URD = "◎";

    this.getDefIconString = CharSkin_getDefIconString;
    function CharSkin_getDefIconString(n) {
        switch (n) {
            case N_ITEM_COLLAPSED:  return "≡";
            case N_ITEM_EXPANDED:   return "≡";
            case N_ITEM_TBD:        return "≡";
            case N_ITEM_LEAF:       return "＝";
            case N_ITEM_NOTICE:     return "﹗";
            case N_ITEM_DOWNLOADER: return "…";
        }
        return "﹖";
    }

    this.getDefColorString = CharSkin_getDefColorString;
    function CharSkin_getDefColorString(n) {
        switch (n) {
            case N_ITEM_COLLAPSED:  return "";
            case N_ITEM_EXPANDED:   return "";
            case N_ITEM_TBD:        return "gray";
            case N_ITEM_LEAF:       return "";
            case N_ITEM_NOTICE:     return "red";
            case N_ITEM_DOWNLOADER: return "blue";
        }
        return "red";
    }
}

function ImageSkin() {
    this.N_INDENT = 0;

    this.STR_STYLE_PREFIX = "";
    this.STR_STYLE_HANDLE = "cursor:hand;";
    this.STR_STYLE_ICON = "font-weight:normal;width:19px;padding-left:2px;";

    this.STR_PREFIX_L = "<img align=middle src=tree_l.gif>";
    this.STR_PREFIX_LUD = "<img align=middle src=tree_lud.gif>";
    this.STR_PREFIX_LUR = "<img align=middle src=tree_lur.gif>";
    this.STR_PREFIX_LURD = "<img align=middle src=tree_lurd.gif>";

    this.STR_HANDLE_COL_R = "<img align=middle src=tree_pr.gif>";
    this.STR_HANDLE_COL_UR = "<img align=middle src=tree_pur.gif>";
    this.STR_HANDLE_COL_URD = "<img align=middle src=tree_purd.gif>";

    this.STR_HANDLE_EXP_R = "<img align=middle src=tree_mr.gif>";
    this.STR_HANDLE_EXP_UR = "<img align=middle src=tree_mur.gif>";
    this.STR_HANDLE_EXP_URD = "<img align=middle src=tree_murd.gif>";

    this.STR_HANDLE_TBD_R = "<img align=middle src=tree_pr.gif>";
    this.STR_HANDLE_TBD_UR = "<img align=middle src=tree_pur.gif>";
    this.STR_HANDLE_TBD_URD = "<img align=middle src=tree_purd.gif>";

    this.getDefIconString = ImageSkin_getDefIconString;
    function ImageSkin_getDefIconString(n) {
        switch (n) {
            case N_ITEM_COLLAPSED:  return "<img align=middle src=tree_col.gif>";
            case N_ITEM_EXPANDED:   return "<img align=middle src=tree_exp.gif>";
            case N_ITEM_TBD:        return "<img align=middle src=tree_tbd.gif>";
            case N_ITEM_LEAF:       return "<img align=middle src=tree_leaf.gif>";
            case N_ITEM_NOTICE:     return "<img align=middle src=tree_notice.gif>";
            case N_ITEM_DOWNLOADER: return "<img align=middle src=tree_leaf.gif>";
        }
        return "<img align=middle src=tree_notice.gif>";
    }

    this.getDefColorString = ImageSkin_getDefColorString;
    function ImageSkin_getDefColorString(n) {
        switch (n) {
            case N_ITEM_COLLAPSED:  return "";
            case N_ITEM_EXPANDED:   return "";
            case N_ITEM_TBD:        return "gray";
            case N_ITEM_LEAF:       return "";
            case N_ITEM_NOTICE:     return "red";
            case N_ITEM_DOWNLOADER: return "blue";
        }
        return "red";
    }
}
