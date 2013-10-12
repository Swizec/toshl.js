
var request = require('request');

exports.Toshl = function (oauth2_bearer) {
    this.oauth2_bearer = oauth2_bearer;
    this.base_url = "https://api.toshl.com";
};

exports.Toshl.prototype.refresh_auth = function (client_id, client_secret, refresh_token, callback) {
    var OAuth = require('OAuth');
    
    var OAuth2 = OAuth.OAuth2;
    var oauth2 = new OAuth2(client_id,
                            client_secret,
                            'https://toshl.com/', 
                            null,
                            'oauth2/token', 
                            null);

        oauth2.getOAuthAccessToken(
            refresh_token,
            {grant_type: 'refresh_token'},
            function (error, access_token, refresh_token, results){
                console.log(error);
                callback(error, access_token);
            });
};

exports.Toshl.prototype.me = function (new_values, callback) {
    callback = arguments[arguments.length - 1];

    if (arguments.length < 2) {
        new_values = null;
    }

    this._request("/me", new_values, callback);
};

exports.Toshl.prototype.rate_limit = function (callback) {
    this._request("/rate-limit", callback);
};

exports.Toshl.prototype._request = function (url, data, callback) {
    data = data || null;
    callback = arguments[arguments.length - 1];

    var method = !!data ? 'PUT' : 'GET';

    var options = {method: method,
                   url: this.base_url+url,
                   headers: {
                       Authorization: "Bearer "+this.oauth2_bearer
                   }};

    if (method == 'PUT') {
        options.multipart = [{'content-type': 'application/json',
                              body: JSON.stringify(data)}];
    }

    request(options,
            function (error, response, body) {
                if (error) {
                    callback(error);
                }else if (response.statusCode != 200) {
                    console.log(response.statusCode);
                    body = !!body ? JSON.parse(body) : {};
                    callback(new Error(response.statusCode+": "+body.description));
                }else{
                    body = JSON.parse(body);
                    callback(null, body);
                }
            });
};
