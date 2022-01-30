var http = require("http");
http.createServer(function(req, res){
res.write("Statistic"); 
res.end();
}).listen(8080);