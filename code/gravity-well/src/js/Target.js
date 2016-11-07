
/*!
 * Class Target()
 */
Target = StageItem.extend({
    constructor : function (data, level) {
        this.base();
        //console.log('Target',data,level)
        this.level = level;
        var paper = this.paper = level.game.paper;
        this.grabData(data,Target);
        this.add(paper.circle(this.x,this.y,this.radius));
        this.attr({
            "fill" : "r(0.5,0.5)#58f-#000-#58f-#000-#58f",
            "stroke" : "#9cf"
        })
    }
},
{
    defaults : {
        radius : 20
    }
})


