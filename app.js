var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var site = require('./routes/site');
var game = require('./routes/game');
var invitation = require('./routes/invitation');
var user = require('./routes/user');
var gameState = require('./routes/gameState');

var app = express();
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/sudoku');

// configuration
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(process.env.COOKIE_SECRET || 'Dancing bavarian cat'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// ensure authentication by checking exitennce of user session
function ensureAuth(req, res, next) {
  if (!req.session.userId) {
    res.status(401);
    res.send('Not allowed.');
  } else {
    next();
  }
}

// routes

// index
app.get('/', site.index);
// users
app.post('/api/users/login', user.login);
// game states
app.get('/api/game-states/:id', ensureAuth, gameState.get);
app.get('/api/game-states/:id/others', ensureAuth, gameState.others);
app.put('/api/game-states/:id', ensureAuth, gameState.update);
// games
app.post('/api/games', ensureAuth, game.create);
// invitations
app.get('/api/invitations', ensureAuth, invitation.index)
app.post('/api/invitations', ensureAuth, invitation.create)
app.put('/api/invitations/:id', ensureAuth, invitation.update)

// var privateKey = fs.readFileSync('./ssl/server.key').toString();
// var certificate = fs.readFileSync('./ssl/server.crt').toString();

// var options = {
//   key : privateKey,
//   cert : certificate
// };

// start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
