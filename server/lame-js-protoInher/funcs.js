/**
*================================================================================
*/

var Person = (function () {
    function Person(firstname, lastname, age) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.age = age;
    }
    Person.prototype.Info = function () {
        return this.firstname + " " + this.lastname + " " + this.age;
    };
    return Person;
})();
var person = new Person("Vovan", "Suppa", 30);
var personinfo = person.Info();

/**
*================================================================================
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Creature = (function () {
    function Creature(color) {
        this.color = color;
    }
    return Creature;
})();

var Person = (function (_super) {
    __extends(Person, _super);
    function Person(color, man, age) {
        _super.call(this, color);
        this.man = man;
    }
    return Person;
})(Creature);

var Vovan = (function (_super) {
    __extends(Vovan, _super);
    function Vovan(color, man, age, nic) {
        _super.call(this, color, man, age);
        this.nic = nic;
    }
    return Vovan;
})(Person);
var me = new Vovan("White", {
    name: "Vovan"
}, 30, "VovanSuper");
/**
*======================================================================================================
*/
var http = require('http');
var port = process.env.PORT || 8080 ;

var htmlHeader = '<!doctype html> <html> <head> <title>{{placeHolder}}</title></head>' + 
                '<body><h1> This is the site of Vovan the Supppa! Howdy!</h1><h2>{{placeHolder}}</h2>';
				
var htmlFooter = '<hr /> \n <br /> &copy; ' + new Date().getFullYear() + '</body></html> ';
var htmlBody = '{{placeHolder}}';

var paramHtmlBody = '<b style="color: red; font-size: 3em; text-shadow: 10 green;"> This is the text comming from substituting the paceholder on our htmlBody Variable using replace function!</b> ';
var paramOtherHtmlBody = 'Just a stub for Another page';


var htmlmaker = function(params) {
    var bodyText = htmlBody.replace('{{placeHolder}}', params.message);
	var headText = htmlHeader.replace('{{placeHolder}}', params.title);
	headText = headText.replace('{{placeHolder}}', params.title);
	
		
	return [headText, bodyText];
}

var Router = function() 
{
	// constructor :
	function Router(req, resp) {
		this.request = req;
		this.responce = resp;
		this.url = this.responce.url;		
	}
	Router.prototype.render = function(params) {
		var htmlmakerparams = htmlmaker({ title: params.title, message : params.message });
		this.responce.writeHead(200, {'Content-Type': 'text/html'});
		this.responce.writeHead({'Encoding': 'utf-8'});
		this.responce.write(htmlmakerparams[0]);
		this.responce.write(htmlmakerparams[1]);
		this.responce.end(htmlFooter + '\n');		
	}
	return Router;

}();


http.createServer(function(req, resp) {
   var renderparams = undefined;
   if(req.url ==='/' || req.url ==='/index'){
		renderparams = {title: 'Main Page', message: paramHtmlBody};
	}
   if(req.url ==='/other') {
		renderparams = {title: 'Other Web Page', message: paramOtherHtmlBody};
   }
   var router = new Router(req, resp);
   router.render(renderparams);
    
}).listen(port, function() {
	console.log('Listening on port ' + port);
});