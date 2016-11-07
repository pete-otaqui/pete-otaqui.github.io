
/**
 * Parent Game class, which manages the levels
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 */
Game = base2.Base.extend({
    levels : new Array(),
    curLevel : -1,
    score : 0,
    constructor : function(domId) {
        this.paper = this.makePaper(domId, 800, 500);
        this.showWelcomeScreen();
    },
    makePaper : function(domId, width, height) {
        return Raphael(domId, width, height);
    },
    loadLevels : function(url) {
		var that = this;
        new AjaxRequest({
            type : "GET",
            url : url,
            dataType : "json",
            onsuccess : function(response,request) {
                that.addLevels(response.responseData);
            }
        })
    },
    addLevels : function(data) {
        for ( var i=0, imax=data.levels.length; i<imax; i++ ) {
            this.levels.push( data.levels[i] );
        }
    },
    loadLevel : function(n) {
        this.curLevel = n;
        if ( this.levels[n] ) {
            this._applyLevel(this.levels[n]);
        } else {
            var url = Game.baseUrl + 'level-'+n+'.js';
            new AjaxRequest({
                type: "GET",
                url : url,
                dataType : "json",
                onsuccess : function(response,request) {
                    game.levels[n] = response.responseData;
                    game._applyLevel(response.responseData);
                }
            });
        }
    },
    _applyLevel : function(level) {
        if ( this.level ) {
            this.clearLevel();
            delete this.level;
        }
        this.level = new Level(level, this);
    },
    nextLevel : function() {
        if ( this.curLevel < this.levels.length - 1 ) {
            this.loadLevel(this.curLevel+1);
        } else {
            this.clearLevel();
            this.showEndScreen();
        }
    },
    clearLevel : function() {
        this.addScore(this.level.getScore());
        this.level.clear();
    },
    reloadLevel : function() {
        this.loadLevel(this.curLevel);
    },
    showWelcomeScreen : function() {
        this.welcomeScreen = new WelcomeScreen(this.paper,this);
    },
    showEndScreen : function() {
        this.endScreen = new EndScreen(this.paper,this);
    },
    showHelpScreen : function() {
        this.helpScreen = new HelpScreen(this.paper,this);
    },
    setScore : function(n) {
        this.score = parseFloat(n);
    },
    addScore : function(n) {
        this.score += parseFloat(n);
    },
    getScore : function(dontRound) {
        return (dontRound) ?  this.score : Math.round(this.score);
    }
},
{
    baseUrl : './',
    interval : 50,
    scoreFactor : 1,
    isOffScreen : function(x,y) {
        if ( x<0 || y<0 || x>800 || y>500 ) {
            return true;
        } else {
            return false;
        }
    }
});
