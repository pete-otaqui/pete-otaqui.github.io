
/**
 * HelpScreen class for help in playing the game.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires Screen
 */
HelpScreen = Screen.extend({
    constructor : function(paper,game) {
        this.base(paper,game);
        this.items.title = new TextItem({text:"Help",x:400,y:50,font:"70px Helvetica Neue, Arial, Helvetica"},paper,this);
        this.items.back = new ButtonItem({text:"BACK",x:650,y:400,events:{click:"closeHelp"}},paper,this);
        this.items.bodyCopy = new TextItem({text:this.getBodyCopy(),x:100,y:200},paper,this);
        this.items.bodyCopy.attr({'text-anchor':'start'});
    },
    getBodyCopy : function() {
        var s = "";
        s += "Your aim is to fire the projectile in the catapult into the wormhole.\n";
        s += "You can use the gravity of planets to bend the motion of the projectile.\n";
        s += "The longer that your path takes, the higher your score! ";
        return s;
    },
    closeHelp : function() {
        this.remove();
        this.game.showWelcomeScreen();
    }
});
