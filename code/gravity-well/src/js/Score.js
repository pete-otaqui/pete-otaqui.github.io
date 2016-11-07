
/*!
 * Class Score()
 */
Score = TextItem.extend({
    score : 0,
    constructor : function(data, paper ,level) {
        if ( data.score == undefined ) data.score = parseInt(data.text);
        this.base(data,paper,level);
    },
    writeText : function() {
        this.base('Score : '+Math.round(this.score));
    },
    setScore : function(n) {
        this.score = n;
        this.writeText();
    },
    addScore : function(n) {
        this.score += n;
        this.writeText();
    },
    getScore : function(n) {
        return this.score;
    }
})

