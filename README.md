![](public/images/logo.png?raw=true)

**A Sudoku game that integrates with [Kik](http://kik.com).**

- - -

##### Table of Contents  
* [Features](#features)
* [Technologies](#technologies)
* [Architecture](#architecture)
* [Possible improvements](#possible-improvements)

## Features

A user can:
* Start solving a random new sudoku game
* Continue old games
* Quit a game
* Invite other Kik users to a game
* See other players' progress ("solved" (with time), "in progress", or "quit")

## Technologies

The application has a client-side and a server-side. Both use various technologies:

### Server

* [MongoDB](https://www.mongodb.org/) for storing all resources related to the app
* [Express](http://expressjs.com/) for the overall server implementation
* [Mongoose](http://mongoosejs.com/) for mongoDB modeling
* [Q](https://github.com/kriskowal/q) for promises
* [mongoose-q](https://github.com/iolo/mongoose-q) for Q-like promises for mongoose
* [Sudoku](https://github.com/dachev/sudoku) for creating plain sudoku puzzles

### Client
* [Backbone.js](http://backbonejs.org/) for the overall client implementation
* [jQuery](http://jquery.com/) for AJAX and DOM manipulation
* [The Kik API](http://dev.kik.com/) for :
  * Getting Kik user information (e.g. username for identification)
  * Picking Kik friends to invite to a game
  * Send messages to inform about invitation
* [Handlebars](http://handlebarsjs.com/) for HTML templates
* HTML5 features:
  * localStorage for storing progress on games
  * Application Cache for caching JS/CSS/images

## Architecture

### Server

The server's entry point is [app.js](app.js). Here I 
* Configure the express.js server
* Do routing, i.e. map URLs to functions which handle request 
* Do simple session handling
* Start the server
 
I have grouped related request handlers into the same module. All these modules be found in the [routes folder](routes/):

* [site.js](routes/site.js): Serves the HTML file for the single-page app
* [user.js](routes/user.js): User-related API requests:
    * **Login** of user; responding with the user (including all current game states)
* [game.js](routes/game.js): Game-related API requests:
    * **Creating** a new random game for a user; responding with an initial game state 
* [gameState.js](routes/gameState.js): Game state-related API requests:
    * **Getting** a game state of a game for current user
    * **Updating** a game state; might result in solved or quit game
    * **Getting** the game states of players also playing this game
* [invitation.js](routes/invitation.js): Invitation-related API requests:
    * **Creating** a new invitation to a game from current user to invitee
    * **Getting** all invitations for current user
    * **Updating** an invitation by accepting or rejecting it

Except for site.js, all these modules correspond to kinds of resources. Each of these uses Mongoose models to handle requests. The [models folder](models/) contains all model modules. Each one defines a mongoose schema for a model and methods on top.

* [user.js](models/user.js):
   * **Schema**:
     * Username (provided by Kik)
     * List of Ids of game states
   * **Provided methods**:
     * Find/Create user based on Kik username
     * Invite a user to a game
     * Let a user join a game
* [game.js](models/game.js)
   * **Schema** 
     * Name
     * Initial board
     * Solution board
     * Id of creator of the game
   * **Provided methods**:
     * Create a random game
* [gameState.js](models/gameState.js):
   * **Schema** 
     * Current board
     * State name (solved, quit, or in_progress)
     * Timestamp at starting game
     * Timestamp at finishing game
     * Id of user playing
     * Id of game
   * **Provided methods**:
     * Check if current board is solved (by using the actual game's solution)
     * Update game state; might either result in quit or solved game state
     * Find other players' game states
* [invitation.js](models/invitation.js)
   * **Schema** 
     * Id of inviter
     * Id of invitee
     * Id of game the invitation refers to
     * Status name (pending, accepted, or rejected)
   * **Provided methods**:
     * Reject an invitation
     * Accept an invitation
     
Besides routes and models the server also holds the [public folder](public/) for resources like images, CSS, and JavaScript files.

### Client

The client-side of the app is implemented using Backbone.js. The framework helps to separate client-sided [models](public/javascripts/models), [views](public/javascripts/views), and a [main file](public/javascripts/main.js) for routing within the single-page app.

The backbone models provide functionality to fetch/create/update resources. Some hold custom methods:
* [user.js](public/javascripts/models/user.js) with method for:
  * Logging in using the username provided by the Kik API
* [game.js](public/javascripts/models/game.js) 
* [game-state.js](public/javascripts/models/game-state.js) with methods for:
  * Checking if a game is solved and detecting conflicts (e.g. number "1" twice in one row) 
  * Storing game in localStorage
  * Restoring game from localStorage
  * Quitting a game
* [invitation.js](public/javascripts/models/invitation.js) with methods for:
  * Accepting an invitation
  * Rejecting an invitation
  
For each of these models there exists a view.

## Possible improvements

* Make use of HTTPS, then use [Kik' auth support](http://dev.kik.com/docs/#identity-auth) for proper authentication for login
* Concatenate/minify JS/CSS for production mode
* Load client-sided models and views as modules, e.g. using [require.js](requirejs.org)
* Do browser testing, e.g. using [selenium](http://docs.seleniumhq.org/) and [mocha.js](visionmedia.github.io/mocha/)
* When playing a game, live-update the status of other players' progress, e.g. using server-sent events
