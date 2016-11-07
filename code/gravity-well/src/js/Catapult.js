
/**
 * Catapult which fires the Projectile.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires StageItem
 * @requires Projectile
 */
Catapult = StageItem.extend({
    _lines : {},
    _points : {},
    constructor : function (data, level) {
        this.base();
        this.level = level;
        var paper = this.paper = level.game.paper;
        this.grabData(data,Catapult);
    	//this.rband = this.line('rband',0,0,100,100);
        this._points['point1'] = paper.circle(0, 0, this.pointRadius);
    	this._points['point2'] = paper.circle(0, 0, this.pointRadius);
    	//this.rotate(this.angle);
    	this.attr({
    	    fill : "darkblue",
    	    stroke : "lightsteelblue"
    	});
    	
    },
    
    attr : function(o, x, y) {
        if ( x == undefined ) x = this.x;
        if ( y == undefined ) y = this.y;
        var o1 = Cloner.cloneObject(o);
        var o2 = Cloner.cloneObject(o);
        var t = o['translation'];
        var pc = this.getPointCoords(this.angle);
        o1.translation = pc[0][0] + " " + pc[0][1];
        o2.translation = pc[1][0] + " " + pc[1][1];
        //this.rband = this.line("rband",pc[0][0],pc[0][1],pc[1][0],pc[1][1]);
        this._line("rband1",this.x,this.y,pc[0][0],pc[0][1]);
        this._line("rband2",this.x,this.y,pc[1][0],pc[1][1]);
        this._points['point1'].attr(o1);
        this._points['point2'].attr(o2);
    },
    remove : function() {
        this._removeLines();
        this._removePoints();
    },
    getPointCoords : function(a) {
        return [ this._rCoords(a,1), this._rCoords(a,-1) ];
    },
    _rCoords : function(a,f) {
        a *= -1; // +ve rotation is clockwise
        var h = this.width/2;
        var r = a*Math.PI/180;
        var p1_x = this.x + h * Math.cos(r) * f;
        var p1_y = this.y - h * Math.sin(r) * f;
        return [p1_x, p1_y];
    },
    position : function(x,y) {
        this.x = x;
        this.y = y;
        this.rotate(this.angle);
    },
    rotate : function(a) {
        this.angle = a;
        this.line();
    },
    _line : function(id,x1,y1,x2,y2) {
        if ( this._lines[id] ) this._lines[id].remove();
        this._lines[id] = this.paper.path(this.pathString(x1,y1,x2,y2));
        this._lines[id].attr('stroke',this.lineColor);
        return this._lines[id];
    },
    _removeLine : function(id) {
        this._lines[id].remove();
    },
    _removeLines : function() {
        for ( var id in this._lines ) {
            this._removeLine(id);
        }
    },
    _point : function(id,x,y) {
        if ( this._points[id] ) this._points[id].remove();
        this._points[id] = this.paper.circle(x,y,this.pointRadius);
    	this._points[id].attr({
    	    fill : "darkblue",
    	    stroke : "lightsteelblue"
    	});
    },
    _removePoint : function(id) {
        this._points[id].remove();
    },
    _removePoints : function() {
        for ( var id in this._points ) {
            this._removePoint(id);
        }
    },
    fire : function(t) {
        this.projectile.fire(t);
        this.pullTo(this.x,this.y);
    },
    pullTo : function(x,y) {
        var dx =  x - this.x;
        var dy = -y + this.y;
        this.angle = 90 - (180 * Math.atan2(dy,dx) / Math.PI);
        var points = this.getPointCoords(this.angle);
        
        this._line('rband1',points[0][0],points[0][1],x,y);
        this._line('rband2',points[1][0],points[1][1],x,y);
        this._point('point1',points[0][0],points[0][1]);
        this._point('point2',points[1][0],points[1][1]);
    }
    
},
{
    defaults : {
        width : 40,
        pointRadius : 3,
        lineColor : '#fff'
    }
})

