var request = require('request');
var User = require('../models/user')
var mongoose = require('mongoose')
var should = require('should')

before(function(done) {
  mongoose.connect('mongodb://localhost/sudoku-test', done);
})

var username = 'user-' + (new Date()).getTime();

describe('User', function() {
  it("new user should be created", function(done) {
    User.findOneOrCreate(username).then(function(user) {
      user.should.have.property('username', username)
      done();
    }).catch(function(err) {
      done(err);
    }
    )
  }, 1000);
})

after(function(done){
    mongoose.disconnect(done);
});
