
/**
 * LevelTitle, shown at the start of each Level.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires Screen
 */
LevelTitle = Screen.extend({
    fadeOutTime : 1000,
    fadeOutWait : 1000,
    constructor : function(paper,game,title) {
        this.base(paper,game);
        this.items.bg = paper.rect(0,400,800,100);
        this.items.bg.attr({stroke:'none'});
        //this.items.bg.attr({'fill':'#000'});
        title = "Level " +(game.curLevel+1)+ " : " + title;
        this.items.title = new TextItem({text:title,x:400,y:450,font:"35px Helvetica Neue, Helvetica, Arial",attribs:{fill:'#fff'}},paper,this);
        //this.items.title.item.attr({'fill':'#fff'});
        var that = this;
        setTimeout(function() {
            that.items.title.animate({'fill-opacity':0},that.fadeOutTime);
        },this.fadeOutWait);
        setTimeout(function() {
            that.remove();
        },this.fadeOutWait + this.fadeOutTime + 500);
    },
    remove : function() {
        this.base();
        delete this;
    }
})
