
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

            should.not.exist(error);
            tokens.should.have.keys(['access_token', 'refresh_token']);

            done();
        });
    });

    it.skip('refreshes token', function (done) {
        var toshl = new Toshl(secrets.keys.client_id,
                              secrets.keys.consumer_secret);

        toshl.refresh_token(secrets.keys.test_refresh, function (error, tokens) {
            console.log(tokens);

            should.not.exist(error);
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
            should.not.exist(error);
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
                     should.not.exist(error);
                     me.active_currency.currency.should.eql('USD');

                     done();
                 });
    });
});

describe("Months", function () {
    var Toshl = require('../lib/toshl.js').Toshl;

    it("fetches months", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.months(function (error, months) {
            should.not.exist(error);
            months.should.be.an.instanceOf(Array);

            done();
        });
    });

    it("fetches N months", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.months(5, function (error, months) {
            should.not.exist(error);
            months.should.have.lengthOf(5);

            done();
        });
    });

    it("fetches months with tags", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        // deeply testing this would start testing Toshl, we assume they do the right thing
        // we only compare that sums are different
        toshl.months(function (error, months_all) {
            toshl.months(['fixed', 'gov'], function (error, months) {
                should.not.exist(error);

                for (var i=0; i<months.length; i++) {
                    months[i].expenses.count.should.not.eql(
                        months_all[i].expenses.count
                    );
                }
                
                done();
            });
        });
    });

    it("fetches months with negative tags", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.months(['food'], function (error, months_pos) {
            toshl.months(['!food'], function (error, months_neg) {
                should.not.exist(error);

                for (var i=0; i<months_neg.length; i++) {
                    months_neg[i].expenses.amount.should.not.eql(
                        months_pos[i].expenses.amount
                    );
                }
                
                done();
            });
        });
    });

    it("allows manual settings", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.months({page: 1, per_page: 10}, function (error, months1) {
            months1.should.have.lengthOf(10);

            toshl.months({page: 2, per_page: 10}, function (error, months2) {
                months2.should.have.lengthOf(10);
                months2.should.not.eql(months1);

                toshl.months({tags: ['food']}, function (error, months3) {
                    should.not.exist(error);
                    done();
                });
            });
        });
    });
});

describe("Month", function () {
    var Toshl = require('../lib/toshl.js').Toshl;

    it("fetches a month", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.month(2013, 10, function (error, month) {
            should.not.exist(error);
            month.should.be.an.instanceOf(Object);
            month.from.should.eql("2013-10-01");
            month.to.should.eql("2013-11-01");

            done();
        });
    });

    it("fetches month with tags", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        // deeply testing this would start testing Toshl, we assume they do the right thing
        // we only compare that sums are different
        toshl.month(2013, 10, function (error, month_all) {
            toshl.month(2013, 10, ['fixed', 'gov'], function (error, month) {
                should.not.exist(error);
                month_all.expenses.count.should.not.eql(month.expenses.count);
                
                done();
            });
        });
    });

    it("fetches month with negative tags", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.month(2013, 10, ['food'], function (error, month_pos) {
            toshl.month(2013, 10, ['!food'], function (error, month_neg) {
                should.not.exist(error);
                month_pos.expenses.amount.should.not.eql(month_neg.expenses.amount);
                
                done();
            });
        });
    });

});

describe("Expenses", function () {
    var Toshl = require('../lib/toshl.js').Toshl;

    it("fetches expenses", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.expenses(function (error, expenses) {
            should.not.exist(error);
            expenses.should.be.instanceOf(Array);

            done();
        });
    });

    it("fetches N expenses", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.expenses(10, function (error, expenses) {
            should.not.exist(error);
            expenses.should.have.lengthOf(10);

            done();
        });
    });

    it("fetches dated expenses", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        var from = moment().subtract('days', 7),
            to = moment().subtract('days', 2);

        toshl.expenses(from, to, function (error, expenses) {
            expenses.forEach(function (expense) {
                var date = moment(expense.date);
                
                date.should.be.within(from, to);
            });

            done();
        });
    });

    it("fetches tagged expenses", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        toshl.expenses(['food'], function (error, expenses) {
            expenses.forEach(function (expense) {
                expense.tags.should.include('food');
            });

            done();
        });
    });

    it("allows manual config", function (done) {
        var toshl = new Toshl(secrets.keys.test_bearer);

        var from = moment().subtract('days', 7),
            to = moment().subtract('days', 2);                

        toshl.expenses({from: from,
                        to: to,
                        tags: ['food']}, function (error, expenses) {
                            
                            expenses.forEach(function (expense) {
                                var date = moment(expense.date);

                                expense.tags.should.include('food');
                                date.should.be.within(from, to);
                            });

                            done();
                        });
    });
});
