
/*!
 * Class Screen()
 */
Screen = base2.Base.extend({
    paper : null,
    game : null,
    constructor : function(paper,game) {
        this.paper = paper;
        this.game = game;
        this.items = {};
    },
    remove : function() {
        for (var item in this.items) {
            this.items[item].remove();
            //delete this.items[item];
        }
        this.items = {}
    }
},
{
    
})
