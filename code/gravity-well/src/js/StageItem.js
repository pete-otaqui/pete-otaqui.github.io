
/*!
 * Class StageItem()
 */
StageItem = base2.Base.extend({
    constructor : function() {
        this.items = new base2.Map();
    },
    toString : function() {
        return 'StageItem';
    },
    item : function(i) {
        if ( !i ) i = StageItem.key;
        return this.items.get(i);
    },
    add : function(itemObject,key) {
        if ( !key ) key = StageItem.key;
        this.remove(key);
        this.items.put(key,itemObject);
    },
    remove : function(key) {
        if ( key == undefined ) {
            this.items.forEach(function(i){i.remove()}, this);
        } else {
            if ( this.items.has(key) ) this.items.get(key).remove();
        }
        //if ( this.item !== undefined ) this.item.remove();
    },
    attr : function(o, key) {
        if ( key == undefined ) {
            this.items.forEach(function(i){i.attr(o)}, this);
        } else {
            this.items.get(key).attr(o);
        }
    },
    animate : function(o,t,e, key) {
        if ( key == undefined ) {
            this.items.forEach(function(i){i.animate(o,t,e)}, this);
        } else {
            this.items.get(key).animate(o,t,e);
        }
    },
    stop : function( key ) {
        // undocumented use of Raphael - stop() the animation
        if ( key == undefined ) {
            this.items.forEach(function(i){ i.stop(); });
        } else {
            this.items.get(key).stop();
        }
    },
    grabData : function(o,klass) {
        if ( o == undefined ) o = {}
        for ( var p in klass.defaults ) 
            if ( o[p] == undefined ) 
                o[p] = klass.defaults[p];
        for ( var p in o ) this[p] = o[p];
    },
    getNode : function(i) {
        if ( i == undefined ) i = StageItem.key;
        var node = base2.DOM.bind(this.items.get(i).node);
        return node;
    },
    getNodes : function() {
        return new base2.Map(this.items.map( function(i){return base2.DOM.bind(i.node)} ));
    },
    isTouching : function(otherItem) {
        var dx = otherItem.x - this.x;
        var dy = otherItem.y - this.y;
        var d = Math.sqrt(dx*dx+dy*dy);
        return ( d < this.radius + otherItem.radius );
    },
    pathString : function(ox,oy,nx,ny) {
        return "M"+ox+" "+oy+"L"+nx+" "+ny;
    }
},
{
    key : "item",
    defaults : {}
});
