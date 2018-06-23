var tcp = require('net');

var redis_client = function() {
    // ctor :
    function redis_client (redis_host, redis_port) {
		var self = this;
        self.host = redis_host || '127.0.0.1' ;
        self.port = redis_port || 6379 ;
        self.connected = false;
        
        //self.client = undefined ;
        self.client = tcp.connect( { port: self.port, host: self.host} , function OnConnectedToRedis() {
            
            console.log('Trying to connect on ' + self.host + ':' + self.port);
            
        } );
        
        
        self.client.on('connect', function() {
            self.connected = true;
            console.log('Connection is established to Redis on: ' + self.host + ':' + self.port);
            var message = '*3\r\n$3\r\nSET\r\n$2\r\nvv\r\n$12\r\vovanTheBest\r\n';
            var buff = new Buffer(message);
            self.client.write(buff);
            self.client.flush();
        });
        self.client.on('data', function(data) {
            console.dir('Responce from Redis:  ' + data);
            //self.client.end();
        });
        self.client.on('end', function() {
            self.connected = false;
            console.log('Disconnected');
        });
        self.client.on('error', function(err) {
            console.log('Error occured while trying to connect to Redis server \r\n');
            console.dir(err);
        });
    }    
    
    redis_client.prototype.command = function(com) {
        self.client.write(com);
        self.client.end();
    }
    redis_client.prototype.set = function(key, val) {
        self.client.write('SET %j %j \n', key, val);
    }
    redis_client.prototype.get = function(key) {
        self.client.write('GET %j \n', key);
    }
    return redis_client;
    
}();

module.exports = redis_client ;