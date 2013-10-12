
var request = require('request');

exports.Toshl = function (oauth2_bearer) {
    this.oauth2_bearer = oauth2_bearer;
    this.base_host = "api.toshl.com";
};

exports.Toshl.prototype.me = function (callback) {
    request.get({uri: "https://api.toshl.com/me",
                 headers: {
                     Authorization: "Bearer "+this.oauth2_bearer
                 }},
                function (error, response, body) {
                    body = JSON.parse(body);

                    if (response.statusCode === 200) {
                        callback(error, body);
                    }else{
                        callback(new Error(response.statusCode+": "+body.description));
                    }
                });
};
