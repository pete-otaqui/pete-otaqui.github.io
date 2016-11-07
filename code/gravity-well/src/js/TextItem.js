
/*!
 * Class TextItem()
 */
TextItem = StageItem.extend({
    constructor : function(data,paper,screen) {
        this.base();
        this.grabData(data,TextItem);
        this.paper = paper;
        this.screen = screen;
        this.write();
    },
    write : function(x,y,text,attribs) {
        this.setup(x,y,text,attribs);
        this.writeText();
    },
    setup : function(x,y,text,attribs) {
        text = text || this.text;
        x = x || this.x;
        y = y || this.y;
        attribs = attribs || this.attribs;
        this.text = text;
        this.x = x;
        this.y = y;
        this.attribs = attribs;
    },
    writeText : function(s) {
        if ( s == undefined ) s = this.text
        //this.remove("text");
        this.add(this.paper.text(this.x,this.y,s), "text");
        this.attr({font:this.font}, "text");
        this.attr({fill:this.fill}, "text");
        this.attr(this.attribs, "text");
    }
},
{
   defaults : {
       text : "Default",
       font : '20px Arial, Helvetica',
       fill : '#fff',
       attribs : {},
       events : {}
   } 
});
