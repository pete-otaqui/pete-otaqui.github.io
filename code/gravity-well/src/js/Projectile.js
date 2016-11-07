
/**
 * Projectile fired by Catapult.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires StageItem
 * @requires Catapult
 */
Projectile = StageItem.extend({
    showTrails : true,
    trailPos : {x:0,y:0},
    offset : {left:0,top:0},
    arrow : {},
    constructor : function(data,level) {
        this.base();
        this.arrow = new Arrow(data,level);
        var demo = document.querySelector('#demo');
        this.offset.left = demo.offsetLeft;
        this.offset.top  = demo.offsetTop;
        this.level = level;
        var paper = this.paper = level.game.paper;
        var catapult = this.catapult = level.catapult;
        this.grabData(data,Projectile);
        this.catapult = catapult;
        this.x = catapult.x;
        this.y = catapult.y;
        this.trailPos.x = this.x;
        this.trailPos.y = this.y;
        this.catapult.projectile = this;
        this.add(paper.circle(catapult.x,catapult.y,this.radius));
        this.attr({
            "fill" : "r(0.3,0.3)#fff-#000",
            "stroke" : "none"
        });
        this.trails = [];
        var that = this;
        var node = this.getNode();
        node.style.cursor = "pointer";
        var mdown = function(e) {
            that.pull(e);
            e.preventDefault();
            return false;
        }
        var mup = function(e) {
            node.removeEventListener('mousedown',mdown,false)
        }
        node.addEventListener("mousedown",mdown,false);
        node.addEventListener("mouseup",mup,false);
    },
    trails : [],
    remove : function() {
        this.base();
        for ( var i=0, imax=this.trails.length; i<imax; i++ ) {
            this.trails[0].remove();
            this.trails.splice(0,1);
        }
        if ( this.tempTrail ) this.tempTrail.remove();
        this.arrow.remove();
        clearInterval(this.timer);
    },
    pull : function(e) {
        var that = this;
        var canvas = document.querySelector('#demo');
        canvas.style.cursor = "pointer";
        var drag = function(e) {
            e.preventDefault();
            that.drag(e);
        }
        var drop = function(e) {
            canvas.style.cursor = "";
            canvas.removeEventListener('mousemove',drag,false)
            canvas.removeEventListener('mouseup',drop,false)
            that.release(e);
        }
        canvas.addEventListener('mousemove',drag,false)
        canvas.addEventListener('mouseup',drop,false);
        e.preventDefault();
        return false;
    },
    
    drag : function(e) {
        var mx, my, dx, dy, d, cx, cy, r, offset;
        offset = this.offset;
        mx = e.pageX - offset.left;
        my = e.pageY - offset.top;
        var aAndT = this._getAngleAndTension(mx,my);
        cx = aAndT.dx - this.x + this.catapult.x;
        cy = aAndT.dy - this.y + this.catapult.y;
        this.x += cx;
        this.y += cy;
        this.catapult.pullTo(this.x,this.y);
        this.attr({
            "translation" : cx+" "+cy
        });
    },
    getAngle : function() {
        return this._getAngleAndTension().angle;
    },
    getTension : function() {
        return this._getAngleAndTension().tension;
    },
    _getAngleAndTension : function(x,y) {
        // cache for multiple calls per "move"
        if ( x==undefined && y==undefined && this._angleAndTension !== undefined )
            return this._angleAndTension;
        var dx, dy, d, r, a;
        if ( x == undefined ) x = this.x;
        if ( y == undefined ) y = this.y;
        dx = x - this.catapult.x;
        dy = y - this.catapult.y;
        r = Math.atan2(dy,dx);
        d = Math.sqrt(dx*dx+dy*dy);
        if ( d > this.catapult.maxTension ) {
            d = this.catapult.maxTension;
            dx = d*Math.cos(r);
            dy = d*Math.sin(r);
        }
        r = Math.atan2(dy, dx);
        a = 180*r/Math.PI;
        this._angleAndTension = { angle:a, radians:r, tension:-d, dx:dx, dy:dy };
        return this._angleAndTension;
    },
    _clearAngleAndTension : function() {
        this._angleAndTension = false;
    },
    release : function() {
        var t, r, a;
        var aAndT = this._getAngleAndTension();
        this.fire(aAndT.tension,aAndT.angle);
    },
    getAngle : function() {
        var mx, my, dx, dy, d;
    },
    fire : function(tension,angle) {
        this.velocity = tension;
        this.angle = angle;
        this.count = 0;
        this.start = new Date().getTime();
        var that = this;
        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            that._fire();
        },Game.interval);
    },
    _fire : function() {
        // check for end
        if ( new Date().getTime() > 300000+this.start ) {
            alert('Timed out!  Try again.');
            clearInterval(this.timer);
            this.level.game.reloadLevel();
            return;
        }
        var r = Math.PI*this.angle/180;
        var vx = this.velocity*Math.cos(r);
        var vy = this.velocity*Math.sin(r);
        var planet, gx, gy, gd, gg, dx, dy, gr;
        for ( var i=0, imax=this.level.planets.length; i<imax; i++ ) {
            planet = this.level.planets[i];
            if ( this.isTouching(planet) ) {
                //console.log('COLLISION');
                this.level.setScore(0);
                this.level.game.reloadLevel();
                return;
            }
            dx = planet.x - this.x;
            dy = planet.y - this.y;
            gd = Math.sqrt(dy*dy+dx*dx);
            gg = planet.gravity / (gd*gd);
            gx = gg * dx;
            gy = gg * dy;
            vx += gx;
            vy += gy;
        }
        this.x += vx;
        this.y += vy;
        this.angle = Math.atan2(vy,vx)*180/Math.PI;
        this.velocity = Math.sqrt(vx*vx+vy*vy);
        this.attr({
            "translation" : vx+" "+vy
        });
        this.arrow.place(this.x,this.y);
        
        // add trail
        if ( this.showTrails && ++this.count % Trail.interval == 0 ) {
            var ox = this.trailPos.x;
            var oy = this.trailPos.y;
            if ( !Game.isOffScreen(this.x,this.y) || !Game.isOffScreen(ox,oy) ) {
                if ( this.tempTrail ) this.tempTrail.remove();
                this.trails.push(new Trail({x:this.x,y:this.y,ox:ox,oy:oy},this.level));
            }
            this.trailPos.x = this.x;
            this.trailPos.y = this.y;
        } else if ( this.showTrails ) {
            if ( this.tempTrail ) this.tempTrail.remove();
            var tp = this.trailPos;
            this.tempTrail = this.paper.path(this.pathString(tp.x,tp.y,this.x,this.y));
            this.tempTrail.attr({"stroke":Trail.strokeColor,"stroke-width":Trail.strokeWidth});
        }
        
        this.level.addScore(this.level.scoreFactor);
        //console.log(this.level.getScore());
        
        if ( this.isTouching(this.level.target) ) {
            //console.log("WIN!");
            this.level.game.nextLevel();
            return;
        }
        
        var that = this;
        this.timer = setTimeout(function() {
            that._fire();
        },Game.interval);
    },
    
    
    
},
{
    defaults : {
        radius : 5
    }
});

