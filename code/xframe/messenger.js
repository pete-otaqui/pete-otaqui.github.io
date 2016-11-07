if ( !window['console'] ) {
	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.right = '0px';
	div.style.top = '0px';
	div.style.width = '200px';
	div.style.backgroundColor = '#eee';
	div.style.fontFamily = '"Courier New", Courier';
	div.style.zIndex = "100";
	setTimeout( function() { document.body.appendChild(div); }, 1000 );
	console = {
		log : function(msg) {
			var str = document.createElement('div');
			str.innerHTML = msg;
			div.appendChild(str);
		}
	}
}
function Messenger(targetFrame, proxyFrame, proxyUrl) {
	if ( proxyUrl.indexOf('#') === -1 ) proxyUrl += '#';
	send = function (message) {
		console.log('sending message: "'+message+'"');
		if ( this.targetFrame.contentWindow['postMessage'] ) {
			this.targetFrame.contentWindow.postMessage(message, '*');
		} else {
			this.proxyFrame.contentWindow.location = this.proxyUrl + message;
			this.proxyFrame.width = this.proxyFrame.width > 200 ? 200 : 201;
		}
	};
	return {
		targetFrame : targetFrame,
		proxyFrame : proxyFrame,
		proxyUrl : proxyUrl,
		send : send
	};
}

function Proxy(proxyName, frameCollection, frameName) {
	if ( window['postMessage'] ) return {};
	var proxy = {
		proxyName: proxyName,
		frameCollection: frameCollection,
		frameName: frameName,
		forwardMessage: function() {
			console.log('Proxy::forwardMessage');
			var message = document.location.hash;
			if ( message.length > 1 ) {
				message = message.substr(1);
				frameCollection[frameName].receive(proxyName, message);
			}
		}
	};
	if ( window.addEventListener ) {
		window.addEventListener('resize', proxy.forwardMessage, false);
	} else if ( document.body.attachEvent ) {
		window.attachEvent('onresize', proxy.forwardMessage)
	}
	return proxy;
}

function Receiver(proxyName, handler, windowScope) {
	if ( windowScope == undefined ) windowScope = window;
	if ( windowScope['postMessage'] ) {
		if ( windowScope.addEventListener ) {
			windowScope.addEventListener("message", function(msg) {handler(msg.data)}, false);
		} else {
			windowScope.attachEvent("onmessage", function(msg) {handler(msg.data)});
		}
	} else {
		if ( !windowScope['receive'] ) {
			windowScope.receive = function(proxyName, message) {
				var receiver = windowScope.receive.proxies[proxyName];
				receiver.handleMessage(message);
			}
			windowScope.receive.proxies = {};
		}
		var receiver = windowScope.receive.proxies[proxyName] = {
			handler : handler,
			handleMessage : function(message) {
				this.handler(message);
			}
		};
		return receiver;
	}
}
