var _vmlmark_volatile = true;
function _vmlmarkClickSomewhere() {
    var oMarked = event.srcElement;
    while (oMarked != null && oMarked.getAttribute("markable") == null) {
        oMarked = oMarked.parentElement;
    }
    if (oMarked != null) {
        var insertPos = "beforeBegin";
        if (oMarked.canHaveHTML) {
            insertPos = "afterBegin";
        }

        var oRect = oMarked.getBoundingClientRect();
        _vmlmarker.style.posWidth = oRect.right - oRect.left + 20;
        _vmlmarker.style.posHeight = oRect.bottom - oRect.top + 10;

        oMarked.insertAdjacentElement(insertPos, _vmlmarker);
        _vmlmarker.style.setExpression("posLeft", oMarked.uniqueID + ".getBoundingClientRect().left + document.body.scrollLeft - 10 - 3", "JavaScript");
        _vmlmarker.style.setExpression("posTop", oMarked.uniqueID + ".getBoundingClientRect().top + document.body.scrollTop - 5 - 3", "JavaScript");
      //_vmlmarker.style.posLeft = (oRect.right + oRect.left)/2 - (_vmlmarker.style.posWidth)/2 + document.body.scrollLeft - 3;
      //_vmlmarker.style.posTop = (oRect.bottom + oRect.top)/2 - (_vmlmarker.style.posHeight)/2 + document.body.scrollTop - 3;
        _vmlmarker.style.visibility = "visible";
    } else {
        if (_vmlmark_volatile) {
            _vmlmarker.style.visibility = "hidden";
            _vmlmarker.removeExpression("posLeft");
            _vmlmarker.removeExpression("posTop");
        }
    }
}
document.write("<v:oval id=\"_vmlmarker\" filled=\"false\" style=\"behavior:url(#default#vml);visibility:hidden;position:absolute;\">");
document.write("<v:stroke id=\"_vmlmarkerstroke\" dashstyle=\"solid\" Color=\"red\" weight=\"2\" style=\"behavior:url(#default#vml);\" />");
document.write("</v:oval>");
document.body.attachEvent('onclick', _vmlmarkClickSomewhere);
