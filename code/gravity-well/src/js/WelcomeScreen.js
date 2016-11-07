
/*!
 * Class WelcomeScreen()
 */
WelcomeScreen = Screen.extend({
    constructor : function(paper,game) {
        this.base(paper,game);
        this.items.title = new TextItem({text:"Gravity.",x:400,y:180,font:"70px Helvetica Neue, Arial, Helvetica",attribs:{"font-weight":"bold"}},paper,this);
        this.items.subtitle = new TextItem({text:"Well ...",x:400,y:270,font:"25px Helvetica Neue, Arial, Helvetica"},paper,this);
        this.items.start = new ButtonItem({text:"START",x:650,y:400,events:{click:"startGame"}},paper,this);
        this.items.help = new ButtonItem({text:"Help",x:150,y:400,events:{click:"showHelp"}},paper,this);
    },
    startGame : function() {
        this.remove();
        var l = 0, m;
        if ( m = document.location.href.match(/\?.*loadLevel=(\d+)/) ) {
            l = parseInt(m[1]);
        }
        this.game.loadLevel(l);
    },
    showHelp : function() {
        this.remove();
        this.game.showHelpScreen();
    },
    log : function(s) {
        console.log(s,this.log);
    }
});
