var Lambda = function(options) {
    var lambda = this
    options = options || {};
    this.options = options;

    var express = require('express');
    this.server = express()
    this.server.use(express.json())

    var mappings = this.options.mappings || []

    var expressHandler = (lambdaHandler) => {
        return (req, res) => {
            return lambdaHandler({
                queryStringParameters: req.query,
                body: req.body && JSON.stringify(req.body)
            }, {}, function(err, data) {
                if(err) {
                    var statusCode = (data && data.statusCode) ? (data.statusCode || 500) : 500;
                    res.writeHead(statusCode, {'Content-Type': 'text/json'})
                    res.end(JSON.stringify({
                        errorMessage: err.message
                    }))
                } else {
                    var statusCode = (data && data.statusCode) ? (data.statusCode || 200) : 200;
                    res.writeHead(statusCode, {'Content-Type': 'text/json'})
                    res.end(data.body)
                }
            })
        }

    }

    mappings.forEach(function(pathMap) {
        lambda.server[pathMap.method](pathMap.path, expressHandler(pathMap.handler));
    })
}

Lambda.prototype.run = function() {
    var lambda = this
    var expressServer = this.server.listen(this.options.port, function() {
        var host = expressServer.address().address,
            port = expressServer.address().port

        console.log("Lambda emulation server started listening at http://%s:%s", host, port)
    })

    return lambda
}

module.exports = Lambda;
