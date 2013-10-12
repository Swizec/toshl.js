
var should = require('should');

var secrets = require('../secrets.js');

describe('OAuth2',function() {
    var OAuth = require('OAuth');
    
    // this test is very dependant on test_access_code freshness
    it.skip('gets access token', function(done){
        var OAuth2 = OAuth.OAuth2;
        var oauth2 = new OAuth2(secrets.keys.client_id,
                                secrets.keys.consumer_secret,
                                'https://toshl.com/', 
                                null,
                                'oauth2/token', 
                                null);

        oauth2.getOAuthAccessToken(
            secrets.keys.test_access_code,
            {grant_type: 'authorization_code'},
            function (e, access_token, refresh_token, results){
                console.log(arguments);
                console.log('bearer: ',access_token);

                done();
            });
    });

});

describe('Me', function () {
    var Toshl = require('../lib/toshl.js').Toshl;

    it('gets user data', function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.me(function (error, me) {
            me.should.have.keys(['id', 'email', 'first_name', 'last_name',
                                 'joined', 'pro', 'pro_until', 'main_currency',
                                 'active_currency', 'start_day', 'links', 'extra']);

            done();
        });
    });
});
