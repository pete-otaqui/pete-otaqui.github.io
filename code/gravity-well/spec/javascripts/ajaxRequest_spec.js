

describe('AjaxRequest', function() {
    
    it('should initialise with an http object', function() {
        AjaxRequest._http = new MockHttp();
        var ar = new AjaxRequest();
        expect(ar.getHttp()).toBeDefined();
    });
    it('should accept options',function() {
        AjaxRequest._http = new MockHttp();
        var ar = new AjaxRequest({
            timeout:123499,
            custom:"custom"
        });
        expect(ar.options.timeout).toEqual(123499);
        expect(ar.options.custom).toEqual("custom");
        expect(ar.options.dataType).toEqual("raw");
    });
    it('should parse json', function() {
        AjaxRequest._http = new MockHttp();
        var url = 'http://www.otaqui.com/json.json';
        AjaxRequest._http.addFixture(url,'{"foo":"bar"}');
        var ar = new AjaxRequest({url:url,onload:function(rsp,req) {
            expect(rsp.responseData.foo).toBeDefined();
            expect(rsp.responseData.foo).toEqual('bar');
        }});
    });
    
    //AjaxRequest._http = undefined;
    
})