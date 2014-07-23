{
    function createSubtitles(thisObj)
    {
        // 读入字幕文件
        var subtitles = loadSrt();
        if (!subtitles) return;

        // 在当前的 Composition Item 上操作
        var item = app.project.activeItem;
        if (!item || (item.typeName != 'Composition' && item.typeName != '合成')) {
            alert('请先打开一个 Composition Item');
            return;
        }

        // 以下所有操作合并为一个 undo-group
        app.beginUndoGroup('导入字幕');

        // 找到字幕层（没有则创建一个）
        var layer = item.layers.byName('字幕');
        if (!layer) {
            layer = item.layers.addText('');
            layer.name = '字幕';

            // 设置缺省的文字格式
            var prop = layer.Text.property('Source Text');
            var textDocument = prop.value;
            textDocument.resetCharStyle();
            textDocument.text = '';
            textDocument.fontSize = 62;
            textDocument.fillColor = [1, 1, 1];
            textDocument.strokeColor = [0, 0, 0];
            textDocument.strokeWidth = 10;
            textDocument.font = 'Microsoft YaHei';
            textDocument.strokeOverFill = false;
            textDocument.applyStroke = true;
            textDocument.applyFill = true;
            textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
            prop.setValue(textDocument);

            // 设定文字位置
            prop = layer.Transform.property('Position');
            prop.setValue([Math.floor(item.width / 2), item.height - 60, 0]);
        }

        // 清除所有 keyframes
        var prop = layer.Text.property('Source Text');
        while (prop.numKeys > 0) {
            prop.removeKey(1);
        }

        // 创建 keyframes
        var getPerfectTimePosition = function(t) {
            return Math.round(t / item.frameDuration) * item.frameDuration;
        };
        prop.setValueAtTime(0.0, '');
        for (var i=0; i < subtitles.length; i++) {
            var subtitle = subtitles[i];
            prop.setValueAtTime(getPerfectTimePosition(subtitle.from), subtitle.text);
            prop.setValueAtTime(getPerfectTimePosition(subtitle.to), '');
        }

        app.endUndoGroup();
        app.activate();
    }

    function loadSrt()
    {
        var srt = File.openDialog('打开字幕文件', '字幕文件:*.srt');
        if (!srt) return null;

        var seq = 0;
        var from = 0.0;
        var to = 0.0;
        var waitingFor = 1;
        var lines = [];

        srt.open();
        while (!srt.eof) {
            var line = srt.readln();
            if (line.length > 0) {
                if (waitingFor == 1) {
                    seq = parseInt(line);
                    waitingFor = 2;
                } else if (waitingFor == 2) {
                    var m = line.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
                    from = (parseInt(m[1]) * 60 + parseInt(m[2])) * 60 + parseInt(m[3]) + parseInt(m[4]) / 1000;
                    to   = (parseInt(m[5]) * 60 + parseInt(m[6])) * 60 + parseInt(m[7]) + parseInt(m[8]) / 1000;
                    waitingFor = 3;
                } else if (waitingFor == 3) {
                    lines.push({
                        seq: seq,
                        from: from,
                        to: to,
                        text: line
                    });
                    waitingFor = 1;
                }
            }
        }
        srt.close();
        return lines;
    }

    createSubtitles(this);
}
