
/**
 * Level class for each level of the game
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires Game
 */
Level = base2.Base.extend({
    scoreFactor : 1,
    constructor : function(data, game) {
        this.data = data;
        if ( data.scoreFactor !== undefined ) this.scoreFactor = data.scoreFactor;
        this.game = game;
        var planet;
        this.planets = new Array();
        for ( var i=0, imax=data.planets.length; i<imax; i++ ) {
            this.planets.push(new Planet(data.planets[i], this));
        }
        this.target = new Target(data.target, this);
        this.catapult = new Catapult(data.catapult, this);
        this.projectile = new Projectile(data.projectile, this);
        this.score = new Score({x:700,y:20,text:"0"},this.game.paper,this);
        this.title = new LevelTitle(game.paper,game,this.data.title);
        this.reset = new ButtonItem({text:"Reset",x:25,y:20,events:{click:"resetLevel"},font:"10px Arial",'bgfill':'90-#060-#2c2'},game.paper,this);
        //this.reset.attr({"opacity":"0.5"});
    },
    clear : function() {
        for ( var i=0, imax=this.planets.length; i<imax; i++ ) {
            console.log('removing planet ',i);
            this.planets[0].remove();
            this.planets.splice(0,1);
        }
        if ( this.target ) {
            this.target.remove(); delete this.target;
            this.catapult.remove(); delete this.catapult;
            this.projectile.remove(); delete this.projectile;
            this.score.remove(); delete this.score;
            this.reset.remove(); delete this.reset;
        }
    },
    addScore : function(n) {
        if ( this.score ) this.score.addScore(n);
    },
    getScore : function(n) {
        return (this.score) ? this.score.getScore() : 0;
    },
    setScore : function(n) {
        this.score.setScore(n);
    },
    resetLevel : function() {
        this.game.reloadLevel();
    }
});

