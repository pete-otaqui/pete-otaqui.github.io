//You may load required files here, or create test-runner-wide environment settings.

MockHttp = base2.Base.extend({
    constructor : function() {
        this.readyState = 0;
        this.status = null;
        this.responseText = null;
        this.responseXML = null;
        this.fixtures = [];
    },
    open : function(type,url,aSync) {
        this._openedUrl = url;
        this._returnedData = this.fixtures[url];
        this._aSync = aSync;
    },
    send : function() {
        if ( this._aSync ) {
            var that = this;
            setTimeout(function() {
                that.readyState = 4;
                that.onreadystatechange();
            },10);
        } else {
            this.readyState = 4;
            this.onreadystatechange();
        }
    },
    abort : function() {},
    onreadystatechange : function() {},
    addFixture : function(url,data) {
        this.fixtures[url] = data;
    }
});


function create_dummy_game() {
    dummy_game = setInterval(_create_dummy_game,1);
}
function _create_dummy_game() {
    var body, game;
    var body = base2.DOM.bind(document.body);
    if ( !body ) {
        return;
    } else {
        clearInterval(dummy_game);
    }
    if ( document.getElementById('game') ) game.parentNode.removeChild(game);
    game = base2.DOM.bind(document.createElement('div'));
    game.id = "demo";
    game.style.width  = "800px";
    game.style.height = "500px";
    game.style.backgroundColor = '#000';
    body.appendChild(game);
}
