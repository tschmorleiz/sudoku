var Sudoku = Sudoku || {};
Sudoku.Views = Sudoku.Views || {};

// view for playing a game
Sudoku.Views.GameState = Backbone.View.extend({

  events: {
    'input input'   : 'changeField',
    'click #quit'   : 'quit',
    'click #invite' : 'invite'
  },

  initialize: function() {
    this.others = new Sudoku.Models.GameStates();
    this.others.url = this.others.urlRoot + '/' + this.model.get('id') + '/others';
    this.render();
  },

  // render board as nested tables
  render:function () {
    var that = this;
    // render template
    var template = Handlebars.compile($('#game-state-template').html());
    var html = template({gameState: this.model.toJSON()});
    $(this.el).html(html);
    // render all boxes
    var blockSize = 3;
    for (var blockRow = 0; blockRow < blockSize; blockRow++) {
      for (var blockCol = 0; blockCol < blockSize; blockCol++) {
        for (var inBoxRow = 0; inBoxRow < blockSize; inBoxRow++) {
          for (var inBoxCol = 0; inBoxCol < blockSize; inBoxCol++) {
            var row = blockRow * 3 + inBoxRow;
            var col = blockCol * 3 + inBoxCol;
            var value = this.model.get('board')[row][col];
            var initialValue = this.model.get('game').initial[row][col];
            value = value || '';
            var disabled = (value === initialValue);
            var $box = $(this.el)
              .find('.boxes > tbody')
              .find('tr:nth-child(' + (blockRow + 1) + ')')
              .find('td:nth-child(' + (blockCol + 1) + ')')
              .find('tr:nth-child(' + (inBoxRow + 1) + ')')
              .find('td:nth-child(' + (inBoxCol + 1) + ') input')
              .attr('disabled', disabled)
              .attr('data-row', row)
              .attr('data-col', col)
              .val(value)
          }
        }
      }
    }

    // render other players' progress
    this.showStatus(this.model.updateStatus());
    this.others.fetch({
      success: function(gameStates) {
        if (gameStates.length === 1) {
          $(that.el).find('#others-game-states').hide();
          return;
        }
        $list = $('<ul>');
        gameStates.each(function(gameState) {
          if (gameState.get('user').id !== that.model.get('user')) {
            var subview = new Sudoku.Views.OtherGameState({model: gameState, el: $('<li>')});
            $list.append(subview.el);
          }
        });
        $(that.el).find('#others-game-states')
          .append("<strong>Other players:</strong")  
          .append($list)
      }
    });
  },

  // show status and conflicts
  showStatus: function(status) {
    var $boxes = $(this.el).find('.boxes')
    var $inputs = $(this.el).find('input')
    // reset
    $boxes.removeClass('solved conflicts progress');
    $inputs.removeClass('conflict');
    $(this.el).find('#quit').show();
    // show name of status
    if (status.solved) {
      $boxes.addClass('solved');
      $(this.el).find('#state-name').text('SOLVED!');
    } else {
      $(this.el).find('#state-name').text(this.model.get('stateName').replace('_', ' '));
      // mark all conflicts
      if (status.conflicts.length > 0) {
        for (var i = 0; i < status.conflicts.length; i++) {
          var conflict = status.conflicts[i];
          var row = conflict[0];
          var col = conflict[1];
          var query = 'input[data-row="' + row + '"][data-col="' + col +'"]';
          $(this.el).find(query).addClass('conflict');
        }
        $boxes.addClass('conflicts');
      } else {
        $boxes.addClass('progress');
      }
    }
    // in case game was solved or quit, disable all inputs
    if (this.model.get('stateName') !== 'in_progress') {
      $(this.el).find('input').attr('disabled','disabled');
      $(this.el).find('#quit').hide();
    }
  },

  // quit a game and navigate to home
  quit: function(e) {
    this.model.quit(function() {
      Sudoku.router.navigate('#', true);
    });
  },

  // invite others to join game
  invite: function() {
    var that = this;
    kik.pickUsers({maxResults: 1}, function(users) {
      if (typeof users !== 'undefined') {
        var invitee = users[0];
        var invitation = new Sudoku.Models.Invitation({
          inviteeUsername: invitee.username,
          gameId: that.model.get('game').id
        });
        invitation.save({}, {
          success: function() {
            // let other user know
            kik.send(invitee.username, {
              title: 'New invitation!',
              noForward: true,
              text: Sudoku.currentUser.get('fullName') + ' has challenged you, join the game now!'
            })
          }
        });
      }
    })
  },

  // react to field input
  changeField: function(e) {
    var that = this;
    var value = parseInt($(e.target).val());
    if (!value) {
      value = null;
    }
    var row = $(e.target).attr('data-row');
    var col = $(e.target).attr('data-col');
    this.model.setField(row, col, value, function(status) {
      console.log(status);
      that.showStatus(status);
    });
  }
  
});

// view for status of other players
Sudoku.Views.OtherGameState = Backbone.View.extend({

  initialize: function() {
    this.render();
  },

  render: function() {
    $(this.el).append(this.model.get('user').username + ': ');
    $(this.el).append(this.model.get('stateName').replace('_', ' '));
    if (this.model.get('stateName') === 'solved') {
      var started = (new Date(this.model.get('started'))).getTime();
      var finished = (new Date(this.model.get('finished')).getTime());
      var diff = finished - started;
      var minutes = Math.floor(diff / 60);
      var seconds = diff - minutes * 60;
      $(this.el).append(' (' + minutes + ':' + seconds + ')');
    }
  }
});
