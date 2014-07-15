{
    function createSubtitles(thisObj) {
        // 在当前的 Composition Item 上操作
        var item = app.project.activeItem;
        if (!item || item.typeName != 'Composition') {
            alert('请先打开一个 Composition Item');
            return;
        }

        // 找到字幕层（没有则创建一个）
        var layer = item.layers.byName('字幕');
        if (!layer) {
            layer = item.layers.addText('');
            layer.name = '字幕';
        }

        // 清空所有 keyframes
        var prop = layer.Text.property('Source Text');
        while (prop.numKeys > 0) {
            prop.removeKey(1);
        }

        // 创建 keyframes
        var key = prop.addKey(0);
        prop.setValueAtKey(key, '');
        key = prop.addKey(1.5);
        prop.setValueAtKey(key, '!');
        key = prop.addKey(3.5);
        prop.setValueAtKey(key, '');
    }

    createSubtitles(this);
}
