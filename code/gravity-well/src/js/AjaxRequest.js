/*!
 * AjaxRequest
 * @version $Rev$
 */
/**
 * Make XHR requests, and parse JSON responses.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 */
AjaxRequest = base2.Base.extend({
    /**
     * Constructor to create a new AjaxRequest object.
     * 
     * If options.url is set, an XHR request will be made
     * immediately.
     * 
     * @constructor
     * @param Object options object, can contain url String,
     * function onsuccess, Function onerror, nNumber timeout,
     * [GET|POST] type, [raw|json] dataType, Boolean async, String data
     * 
     */
    constructor : function(options) {
        if ( options == undefined ) options = {};
        if ( options.url ) this.url = options.url;
        for ( var p in options ) this.options[p] = options[p];
        //this.____http = this.getHttp();
        this.response = this.getResponse();
        if ( this.url ) this.makeRequest();
    },
    /**
     * Get an http transport object (cross browser).
     * 
     * @private
     * @param {String|Object|Array|Boolean|Number} paramName Describe this parameter
     * @returns Describe what it returns
     * @type String|Object|Array|Boolean|Number
     */
    getHttp : function() {
        if ( AjaxRequest._http ) return AjaxRequest._http;
        var http = ( window.XMLHttpRequest ) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        if ( !http ) return null;
        var that = this;
        http.onreadystatechange = function() {
            that.onReadyStateChange();
        }
        AjaxRequest._http = http;
        return http;
    },
    /**
     * Get an AjaxResponse object.
     * 
     * @return AjaxResponse AjaxResponse object
     */
    getResponse : function() {
        if ( this.response ) return this.response;
        this.response = new AjaxResponse();
        return this.response;
    },
    /**
     * Make an actual request
     * 
     * @param Object options object, can contain url String,
     * function onsuccess, Function onerror, nNumber timeout,
     * [GET|POST] type, [raw|json] dataType, Boolean async, String data
     */
    makeRequest : function(options) {
        if ( options == undefined ) options = {};
        for ( var p in this.options ) if ( options[p] == undefined ) options[p] = this.options[p];
        var that = this;
        this.timeout = setTimeout(function() {
            that.onTimeout()
        },options.timeout);
        this.getHttp().open(options.type, options.url, options.async);
        this.getHttp().send(options.data)
    },
    /**
     * Event fired by ready state changes in http transport
     */
    onReadyStateChange : function() {
        this.response.readyState = this.getHttp().readyState;
        if ( this.getHttp().readyState == 4 ) {
            clearTimeout(this.timeout);
            this.parseResult();
        }
    },
    /**
     * Event fired by timeout in http transport.  Fires onerror.
     */
    onTimeout : function() {
        this.getHttp().abort();
        this.response.status = 0;
        this.response.ok = false;
        this.options.onerror(this.response,this);
    },
    /**
     * Parses the result of a request.  Will decode JSON if dataType
     * is set to 'JSON'.
     */
    parseResult : function() {
        this.response.status = this.getHttp().status;
        this.response.responseText = this.getHttp().responseText;
        this.response.responseXML = this.getHttp().responseXML;
        this.response.ok = AjaxRequest.okStatus(this.getHttp().status);
        if ( this.options.dataType.toLowerCase() == 'json' ) {
            this.response.responseData = json_parse(this.getHttp().responseText);
        }
        if ( this.response.ok ) {
            this.options.onsuccess(this.response,this);
        } else {
            this.options.onerror(this.response,this);
        }
    },
    /**
     * Default set of options.
     */
    options : {
        onsuccess : function(rsp,req) {},
        onerror : function(rsp,req) {},
        timeout : 10000,
        type : "GET",
        dataType : "raw",
        async : true,
        data : null
    }
},
{
    /**
     * Static method to classify an "OK" http status code.
     * 
     * @return Boolean
     */
    okStatus : function(status) {
        return ( status == 200 || status == 304 );
    }
});
