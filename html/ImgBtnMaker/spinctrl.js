function SpinCtrl()
{
    this.setValue =
        function( val ) {
            var iVal = parseInt( val );
            if ( isNaN( iVal ) ) return false;
            this.lastValue = iVal;
            if ( this.inputField ) {
                this.inputField.value = '' + this.lastValue;
            }
            return true;
        };

    this.getValue =
        function( val ) {
            return this.lastValue;
        };

    this.bindInputField = function( el ) {
                                this.inputField = el;
                                el.value = '' + this.lastValue;
                                el.attachEvent( 'onchange',
                                        function( evt ) {
                                            if ( this.setValue( evt.srcElement.value ) && typeof(this.listener) == 'function' ) {
                                                this.listener( this.lastValue );
                                            }
                                        }.bind(this)
                                    );
                            };

    this.bindDecreaseBtn = function( el ) {
                                var func = function( evt ) {
                                                this.lastValue --;
                                                if ( this.inputField ) {
                                                    this.inputField.value = '' + this.lastValue;
                                                }
                                                if ( typeof(this.listener) == 'function' ) {
                                                    this.listener( this.lastValue );
                                                }
                                            }.bind(this);
                                el.attachEvent( 'onclick', func );
                                el.attachEvent( 'ondblclick', func );
                            };

    this.bindIncreaseBtn = function( el ) {
                                var func = function( evt ) {
                                                this.lastValue ++;
                                                if ( this.inputField ) {
                                                    this.inputField.value = '' + this.lastValue;
                                                }
                                                if ( typeof(this.listener) == 'function' ) {
                                                    this.listener( this.lastValue );
                                                }
                                            }.bind(this);
                                el.attachEvent( 'onclick', func );
                                el.attachEvent( 'ondblclick', func );
                            };

    this.setValueListener = function( func ) {
                                this.listener = func;
                            };

    this.inputField = null;
    this.lastValue = 0;
    this.listener = null; // 通过 setValue() 修改值时，不触发 listener

    if ( arguments.length > 0 ) {
        this.setValue( arguments[0] );
    }
}
