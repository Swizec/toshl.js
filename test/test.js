
var should = require('should');

var secrets = require('../secrets.js');

describe('OAuth2',function() {
    var OAuth = require('OAuth'),
        Toshl = require('../lib/toshl.js').Toshl;
    
    // this test is very dependant on test_access_code freshness
    it.skip('gets access token', function(done){
        var toshl = new Toshl(secrets.keys.client_id,
                              secrets.keys.consumer_secret);

        toshl.get_token(secrets.keys.test_access_code, function (error, tokens) {
            console.log(error);
            console.log(tokens);
            tokens.should.have.keys(['access_token', 'refresh_token']);

            done();
        });
    });

    it.skip('refreshes token', function (done) {
        var toshl = new Toshl(secrets.keys.client_id,
                              secrets.keys.consumer_secret);

        toshl.refresh_token(secrets.keys.test_refresh, function (error, tokens) {
            console.log(tokens);
            tokens.should.have.keys(['access_token', 'refresh_token']);

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

    it.skip('updates user data', function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.me({active_currency: 'USD'},
                 function (error, me) {
                     me.active_currency.currency.should.eql('USD');

                     done();
                 });
    });
});
