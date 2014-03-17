var Sudoku = Sudoku || {};
Sudoku.Models = Sudoku.Models || {};

// model for game states
Sudoku.Models.GameState = Backbone.Model.extend({
  urlRoot: "/api/game-states",


  // check for empty boxes and conflicts
  check: function() {
    var empty = 0;
    var conflicts = [];
    var seenColumns = Array(9);
    var seenBoxes = Array(9);
    for(var row = 0; row < 9; row++) {
      var seenRow = [];
      for (var col = 0; col < 9; col++) {
        var value = this.get('board')[row][col];
        var boxIndex = Math.floor(row / 3) * 3  + Math.floor(col / 3);
        seenBoxes[boxIndex] = seenBoxes[boxIndex] || Array(9);
        seenColumns[col] = seenColumns[col] || [];
        if (!value) {
          empty++;
          value = 0;
        } else {
          if (seenRow.indexOf(value) !== -1) {
            conflicts.push([row, col]);
            conflicts.push([row, seenRow.indexOf(value)]);
          }
          if (seenColumns[col].indexOf(value) !== -1) {
            conflicts.push([row, col]);
            conflicts.push([seenColumns[col].indexOf(value), col]);
          }
          if (seenBoxes[boxIndex][value]) {
            conflicts.push([row, col]);
            conflicts = conflicts.concat(seenBoxes[boxIndex][value]);
          } 
        }
        seenRow.push(value);
        seenColumns[col].push(value);
        seenBoxes[boxIndex][value] = seenBoxes[boxIndex][value] || [];
        seenBoxes[boxIndex][value].push([row,col]);
      }
    }
    return {empty: empty, conflicts: conflicts};
  },

  // check whether game was solved
  updateStatus: function() {
    var check = this.check();
    var solved = check.empty === 0 && check.conflicts.length === 0;
    this.set('stateName', solved ? 'solved' : this.get('stateName'));
    return {
      solved: solved,
      conflicts: check.conflicts
    };
  },

  // try to restore progress from localStorage
  restore: function() {
    var storage = JSON.parse(localStorage.getItem('gameStates')) || {};
    if (!storage[this.get('id')]) {
     return false;
    } else {
     this.set('board', storage[this.get('id')].board);
     return true;
    }
  },

  removeLocally: function() {
    var storage = JSON.parse(localStorage.getItem('gameStates')) || {};
    delete storage[this.get('id')];
    localStorage.setItem('gameStates', JSON.stringify(storage));
  },

  // store game progress locally and potentially save remotely
  store: function(cb) {
    var that = this;
    var storage = JSON.parse(localStorage.getItem('gameStates')) || {};
    storage[this.get('id')] = {board: this.get('board')};
    localStorage.setItem('gameStates', JSON.stringify(storage));
    var status = this.updateStatus()
    if (status.solved) {
      this.save({}, {
        success: function(res, object) {
          var solved = object.stateName === 'solved';
          if (solved) {
            that.removeLocally();
          }
          cb({solved: solved});
        }
      })
    } else {
      cb(status);
    }
  },

  // quit a game
  quit: function(cb) {
    var that = this;
    this.save({stateName: 'quit'}, {
      success: function() {
        that.removeLocally()
        cb(arguments);
      }
    });
  },

  // set field and store changed board
  setField: function(row, col, value, cb) {
    this.get('board')[row][col] = value;
    this.store(cb);
  }

});


// collection of game states
Sudoku.Models.GameStates = Backbone.Collection.extend({
  model: Sudoku.Models.GameState,

  urlRoot: "/api/game-states",

  comparator: function(model) {
    var order = {
      'in_progress' : 0,
      'solved': 1,
      'quit': 2,
    }
    return order[model.get('stateName')];
  },

  cleanLocally: function() {
    var storage = JSON.parse(localStorage.getItem('gameStates')) || {};
    for(gameId in storage) {
      if (!this.get(gameId)) {
        delete storage[gameId];
      }
    }
    localStorage.setItem('gameStates', JSON.stringify(storage));
  }
});
