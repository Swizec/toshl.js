
var request = require('request'),
    moment = require('moment'),
    querystring = require('querystring'),
    _ = require('underscore');

exports.Toshl = function (client_id, client_secret, oauth2_bearer) {
    this.oauth2_bearer = null;
    this.client_id = null;
    this.client_secret = null;

    if (arguments.length == 1) {
        this.oauth2_bearer = arguments[0];
    }else if (arguments.length == 2) {
        this.client_id = client_id;
        this.client_secret = client_secret;
    }else{
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.oauth2_bearer = oauth2_bearer;
    }

    this.base_url = "https://api.toshl.com";
};

exports.Toshl.prototype.get_token = function (auth_code, callback) {
    callback = callback || {};

    this._token(auth_code, 'authorization_code', callback);
};

exports.Toshl.prototype.refresh_token = function (refresh_token, callback) {
    callback = callback || {};

    this._token(refresh_token, 'refresh_token', callback);
};

exports.Toshl.prototype._token = function (code, type, callback) {
    callback = arguments[arguments.length-1];

    if (!this.client_id || !this.client_secret) {
        return callback(new Error("Client ID and Client Secret are required"));
    }

    var OAuth = require('OAuth');
    
    var OAuth2 = OAuth.OAuth2;
    var oauth2 = new OAuth2(this.client_id,
                            this.client_secret,
                            'https://toshl.com/', 
                            null,
                            'oauth2/token', 
                            null);

        oauth2.getOAuthAccessToken(
            code,
            {grant_type: type},
            function (error, access_token, refresh_token, results){
                if (!error) {
                    this.oauth2_bearer = access_token;
                }

                callback(error, {access_token: access_token,
                                 refresh_token: refresh_token});
            });
};


exports.Toshl.prototype.me = function (new_values, callback) {
    callback = arguments[arguments.length - 1];

    if (arguments.length < 2) {
        new_values = null;
    }

    this._request("/me", new_values, callback);
};

exports.Toshl.prototype.months = function (params, callback) {
    var options = {},
        query = '';
    callback = arguments[arguments.length-1];

    if (params) {
        if (typeof params == 'number') {
            options['per_page'] = params;
        }else if (params instanceof Array) {
            var type = _.any(params, 
                             function (tag) { return tag[0] == '!'; }) ? '!tags' : 'tags';

            options[type] = params
                .map(function (tag) { return tag.replace('!', ''); })
                .join(',');
        }else if (params instanceof Object) {
            options = params;
        }
    
        query = "?"+querystring.stringify(options);
    }


    this._request("/months"+query, callback);
};

exports.Toshl.prototype.month = function (year, month, tags, callback) {
    callback = arguments[arguments.length-1];

    var query = '',
        options = {};

    if (tags instanceof Array) {
        var type = _.any(tags, 
                         function (tag) { return tag[0] == '!'; }) ? '!tags' : 'tags';
        
        options[type] = tags
            .map(function (tag) { return tag.replace('!', ''); })
            .join(',');

        query = "?"+querystring.stringify(options);
    }

    this._request("/months/"+year+"/"+month+query, callback);
};

exports.Toshl.prototype.expenses = function (params, callback) {
    var options = {},
        query = '';
    callback = arguments[arguments.length-1];

    if (params) {
        if (typeof params == 'number') {
            options['per_page'] = params;
        }

        query = "?"+querystring.stringify(options);
    }

    this._request('/expenses'+query, callback);
};

exports.Toshl.prototype.rate_limit = function (callback) {
    this._request("/rate-limit", callback);
};

exports.Toshl.prototype._request = function (url, data, callback) {
    callback = arguments[arguments.length - 1];
    if (arguments.length == 2) {
        data = null;
    }

    var method = !!data ? 'PUT' : 'GET';

    var options = {method: method,
                   url: this.base_url+url,
                   headers: {
                       Authorization: "Bearer "+this.oauth2_bearer
                   }};

    if (method == 'PUT') {
        options.json = JSON.stringify(data);
        options.headers['If-Unmodified-Since'] = moment().toISOString();
    }

    request(options,
            function (error, response, body) {
                if (error) {
                    callback(error);
                }else if (response.statusCode != 200) {
                    console.log(data, options);
                    console.log(response.statusCode);
                    console.log(response.data);
                    body = !!body ? JSON.parse(body) : {};
                    callback(new Error(response.statusCode+": "+body.description));
                }else{
                    body = JSON.parse(body);
                    callback(null, body);
                }
            });
};
