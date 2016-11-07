
/**
 * Arrow shown when the Projectile is outside viewport.
 * @author pete
 * @version $Rev$
 * @requires StageItem
 */
Arrow = StageItem.extend({
    centre : {x:400,y:250},
    visible : false,
    items : [],
    constructor : function(data,level) {
        this.base();
        this.grabData(data,Arrow);
        var paper = this.paper = level.game.paper;
        this.x = 400;
        this.y = 250;
    },
    place : function(x,y) {
        if ( Game.isOffScreen(x,y) ) {
            this.show();
            var o_hyp = Math.sqrt(x*x + y*y);
            var t_txt = Math.round(o_hyp);
            x = (x<0) ? 0 : (x>800) ? 800 : x;
            y = (y<0) ? 0 : (y>500) ? 500 : y;
            var cx = x - this.centre.x;
            var cy = y - this.centre.y;
            var rd = Math.atan2(cy,cx);
            var dg = rd * 180 / Math.PI;
            dg += 90;
            rd += Math.PI/2;
            var dx = x - this.x;
            var dy = y - this.y;
            this.item('arrow').translate(dx,dy);
            this.x = x;
            this.y = y;
            this.item('arrow').rotate(dg,this.x,this.y);
        } else {
            this.hide();
        }
    },
    hide : function() {
        if ( this.visible ) {
            this.visible = false;
            this.remove();
        }
    },
    show : function() {
        if ( !this.visible ) {
            this.visible = true;
            this.add(this.paper.path("M400 250L390 262,L397 260,L400 275,L403 260,L410 262,L400 250"), 'arrow');
            this.attr({stroke:'none',fill:'#fff'}, 'arrow');
            this.x = 400;
            this.y = 250;
            this.item('arrow').toFront();
        }
    }
},
{
    defaults : {}
});

