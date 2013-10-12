
var secrets = require('../secrets.js');

describe('OAuth2',function() {
    var OAuth = require('OAuth');
    
    it('gets bearer token', function(done){
        var OAuth2 = OAuth.OAuth2;
        var oauth2 = new OAuth2(secrets.client_id,
                                secrets.secret, 
                                'https://api.toshl.com/', 
                                null,
                                'oauth2/token', 
                                null);
        oauth2.getOAuthAccessToken(
            '',
            {},
            function (e, access_token, refresh_token, results){
                console.log('bearer: ',access_token);
                done();
            });
    });

});
