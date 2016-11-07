
/**
 * Planet class.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires StageItem
 */
Planet = StageItem.extend({
    constructor : function (data, level) {
        this.base();
        this.level = level;
        var paper = this.paper = level.game.paper;
        this.grabData(data,Planet);
        this.add(paper.circle(this.x, this.y, this.radius));
        this.attr({
            "fill" : "r(0.3,0.3)"+data.color1+"-"+data.color2,
            "stroke" : data.color3
        });
    }
},
{
    
})

