// http://www.webreference.com/programming/javascript/mk/column2/

var DragMove = {

    dragObject: null,
    mouseOffset: null,

    mouseCoords: function(ev){
        if(ev.pageX || ev.pageY){
            return {x:ev.pageX, y:ev.pageY};
        }

        try {
            return {
                x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
                y:ev.clientY + document.body.scrollTop  - document.body.clientTop
            };
        } catch(e) {
            // reload Ò³ÃæÊ±£¬document.body Îª¿Õ
        }
    },

    getMouseOffset: function(target, ev){
        ev = ev || window.event;

        var docPos    = this.getPosition(target);
        var mousePos  = this.mouseCoords(ev);
        return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
    },

    getPosition: function(e){
        var left = 0;
        var top  = 0;

        while (e.offsetParent){
            left += e.offsetLeft;
            top  += e.offsetTop;
            if ( e.offsetParent.style.position == 'relative' || e.offsetParent.style.position == 'absolute' )
                break;
            e = e.offsetParent;
        }

        return {x:left, y:top};
    },

    mouseMove: function(ev){
        ev           = ev || window.event;
        var mousePos = this.mouseCoords(ev);

        if ( this.dragObject ){
            var left = mousePos.x - this.mouseOffset.x;
            var top  = mousePos.y - this.mouseOffset.y;
            this.dragObject.style.left = left + 'px';
            this.dragObject.style.top  = top  + 'px';

            if ( typeof(this.dragObject.onDragMove) == 'function' ) {
                this.dragObject.onDragMove();
            }

            return false;
        }
    },

    mouseUp: function(){
        this.dragObject = null;
    },

    makeDraggable: function(item, onmove){
        if(!item) return;
        item.attachEvent( 'onmousedown', function(ev){
            this.dragObject  = item;
            this.dragObject.style.position = 'absolute';
            this.mouseOffset = this.getMouseOffset(item, ev);

            if ( typeof(this.dragObject.onDragStart) == 'function' ) {
                this.dragObject.onDragStart();
            }

            return false;
        }.bind(this) );
    },

    init: function() {
        document.attachEvent( 'onmousemove', this.mouseMove.bind(this) );
        document.attachEvent( 'onmouseup', this.mouseUp.bind(this) );
    }
};

DragMove.init();
