
/**
 * Clickable buttons.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires TextItem
 */
ButtonItem = TextItem.extend({
    _className : 'ButtonItem',
    constructor : function(data,paper,screen) {
        this.grabData(data,ButtonItem);
        this.base(data,paper,screen);
    },
    toString : function() {
        return 'ButtonItem';
    },
    write : function(x,y,text,attribs) {
        this.base(x,y,text,attribs);
        this.addBackground();
        this.addEvents();
    },
    addBackground : function() {
        var bbox = this.item('text').getBBox();
        var bg = {
            x : bbox.x - this.padding,
            y : bbox.y - this.padding,
            width : bbox.width + this.padding*2,
            height : bbox.height + this.padding*2
        }
        this.add(this.paper.rect(bg.x,bg.y,bg.width,bg.height,5), 'bg');
        this.attr({fill:this.bgfill}, 'bg');
        this.getNode('text').style.cursor = 'pointer';
        this.getNode('bg').style.cursor = 'pointer';
        this.item('text').toFront();
    },
    addEvents : function() {
        var that = this, fn, args=[];
        for ( var ev in this.events ) {
            fn = this.events[ev];
            this.getNodes().forEach(function(n) {n.addEventListener(ev, function(){that.screen[fn](), false})});
            //this.getNode('bg').addEventListener(ev, function(){that.screen[fn]()}, false);
            //this.getNode('text').addEventListener(ev, function(){that.screen[fn]()}, false);
        }
    }
},
{
   defaults : {
       text : 'Default',
       font : '20px Arial, Helvetica',
       fill : '#000',
       attribs : {},
       events : {},
       padding : 5,
       bgfill : '90-#090-#6f6'
   } 
})
