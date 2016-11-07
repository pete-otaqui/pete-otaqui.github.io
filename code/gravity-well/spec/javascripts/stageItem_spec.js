

describe('StageItem', function() {
    
    it('should add and get a default item', function() {
        var si = new StageItem();
        var ob = {foo:'bar'};
        si.add(ob);
        expect(si.item().foo).toEqual('bar');
    });
    
    it('should add and get items on demand', function() {
        var si = new StageItem();
        var ob1 = {foo:'bar'};
        si.add(ob1, 'one');
        var ob2 = {baz:'eck'};
        si.add(ob2, 'two');
        expect(si.item('one').foo).toEqual('bar');
        expect(si.item('two').baz).toEqual('eck');
    });
    
    it('should remove all items by default', function() {
        var si = new StageItem();
        var ob1 = {remove:function(){}};
        si.add(ob1, 'one');
        var ob2 = {remove:function(){}};
        si.add(ob2, 'two');
        spyOn(ob1,'remove');
        spyOn(ob2,'remove');
        si.remove();
        expect(ob1.remove).wasCalled();
        expect(ob2.remove).wasCalled();
    });
    
    it('should remove specified items on demand', function() {
        var si = new StageItem();
        var ob1 = {remove:function(){}};
        si.add(ob1, 'one');
        var ob2 = {remove:function(){}};
        si.add(ob2, 'two');
        spyOn(ob1,'remove');
        spyOn(ob2,'remove');
        si.remove('one');
        expect(ob1.remove).wasCalled();
        expect(ob2.remove).wasNotCalled();
    });
    
    
    it('should set attributes on all items by default', function() {
        var si = new StageItem();
        var ob1 = {attr:function(){}};
        si.add(ob1, 'one');
        var ob2 = {attr:function(){}};
        si.add(ob2, 'two');
        spyOn(ob1,'attr');
        spyOn(ob2,'attr');
        si.attr({});
        expect(ob1.attr).wasCalled();
        expect(ob2.attr).wasCalled();
    });
    
    it('should set attributes on specified items on demand', function() {
        var si = new StageItem();
        var ob1 = {attr:function(){}};
        si.add(ob1, 'one');
        var ob2 = {attr:function(){}};
        si.add(ob2, 'two');
        spyOn(ob1,'attr');
        spyOn(ob2,'attr');
        si.attr({},'one');
        expect(ob1.attr).wasCalled();
        expect(ob2.attr).wasNotCalled();
    });
    
    it('should get class defaults', function() {
        var NewItem = StageItem.extend({
            constructor : function() {
                this.base();
                this.grabData({'foo':'foo'}, NewItem);
            }
        },
        {
            defaults : {
                foo : 'bar',
                baz : 'eck'
            }
        });
        var newItem = new NewItem();
        expect(newItem.foo).toEqual('foo');
        expect(newItem.baz).toEqual('eck');
    });
    
    
    it('should create a valid path string', function() {
        var si = new StageItem();
        var ps = si.pathString(10,10,20,20);
        expect(ps).toEqual('M10 10L20 20');
    });
    
    it('should know when it is touching something', function() {
        var si = new StageItem();
        si.x = 5;
        si.y = 5;
        si.radius = 3;
        var oi1 = {x:0,y:0,radius:10};
        var oi2 = {x:0,y:0,radius:1};
        expect(si.isTouching(oi1)).toBeTruthy();
        expect(si.isTouching(oi2)).toBeFalsy();
    });
    
    
})