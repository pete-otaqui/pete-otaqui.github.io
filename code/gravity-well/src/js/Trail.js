
/*!
 * Class Trail()
 */
Trail = StageItem.extend({
    constructor : function(data,level) {
        this.base();
        this.grabData(data,Trail);
        var paper = this.paper = level.game.paper;
        var p = this.projectile = level.projectile;
        this.removed = false;
        //this.item = paper.circle(p.x,p.y,p.radius/1.5);
        this.add(paper.path(this.pathString(this.ox,this.oy,this.x,this.y)));
        this.attr({stroke:Trail.strokeColor,"stroke-width":Trail.strokeWidth});
        var a = this.animate({stroke:'#030'},Trail.fadeTime-1000,">");
        var that = this;
    },
    remove : function() {
        this.stop();
        this.base();
    }
},
{
    defaults : {
        opacity : 1
    },
    fadeTime : 10000,
    strokeWidth : 1,
    strokeColor : '#cfc',
    interval : 1
});


