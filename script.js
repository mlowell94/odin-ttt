var options = (function() {
    _gameType = document.querySelector('.player');
    _difficulty = document.querySelector('.difficulty');
    _difficultyChoices = Array.from(_difficulty.querySelectorAll('input'));
    _typeChoices = Array.from(_gameType.querySelectorAll('input'));
    _currentGameType = 'human';
    _currentDifficulty = 'easy';
    
    function _updateGameType(value) {
        _currentGameType = value;
        gameflow.resetGame();
    }

    function _updateDifficulty(value) {
        _currentDifficulty = value;
        gameflow.resetGame();
    }

    function getGameType() {
        return _currentGameType;
    }


    function getDifficulty() {
        return _currentDifficulty;
    }

    for(let i = 0; i < _typeChoices.length; i++) {
        _typeChoices[i].addEventListener('click', function(e) {
            _updateGameType(_typeChoices[i].value);
        })
    }

    for(let i = 0; i < _difficultyChoices.length; i++) {
        _difficultyChoices[i].addEventListener('click', function(e) {
            _updateDifficulty(_difficultyChoices[i].value);
        })
    }



    return { getGameType, getDifficulty }


})();

var gameboard = (function() {   

    var _cellsNodeList = document.querySelectorAll('h1');   // Select all h1, place them into a node list
    var _gameboard = document.querySelector('.gameboard');
    var _cellsArray = Array.from(document.querySelectorAll('.cell')); // Select all .cell divs, place them into an array
  
    _cellsArray.forEach(cell => {                           // for every cell
      cell.addEventListener('click', function(e) {          // add an event listener for click events
          gameflow.playerTurn(_cellsArray.indexOf(cell));   // make a turn passing the cell's index in the array to playerTurn function
      });
    });

    _cellsNodeList.forEach(node => {                            // for every node in the cellsNodeList
        node.addEventListener('transitionend', function(e) {    // add an event listener for transitions ending
            if(e.propertyName == 'opacity') {                 // if the transition is opacity
                gameflow.finalCheckState(node.textContent);     // do a final check of the game state 
            }
        })
    });
    
    
    function startUp() {
        _center = document.querySelector('.center');
        _centerBorders = Array.from(_center.querySelectorAll('span'));
        _options = document.querySelector('.options')
        setTimeout(function() { for(let i = 0; i < _centerBorders.length; i++) {
            if(_centerBorders[i].className == 'top' || _centerBorders[i].className == 'bottom') {
                _centerBorders[i].style.width = '150px';
            } else {
                if(_centerBorders[i].className == 'right') {
                    _centerBorders[i].style.height = '151px';

                }
                _centerBorders[i].style.height = '150px';
            }
        } }, 500);
        setTimeout(function() {_gameboard.style.transform = 'rotate(0deg)'}, 1500);
        _spans = Array.from(document.querySelectorAll('span'));
        setTimeout(function() { for(let i = 0; i < _spans.length; i++) {
            if((_spans[i].className == 'top' || _spans[i].className == 'bottom') && _spans[i].width != '150px') {
                _spans[i].style.width = '200px';
            } else {
                if(_spans[i].className == 'right' && _spans[i].height != '150px') {
                    _spans[i].style.height = '200px';

                }
                _spans[i].style.height = '200px';
            }
        } }, 2500);
        setTimeout(function() {_options.style.height = '21vw'; _options.style.opacity = '1'}, 3000); 
    }

    function getNodeList() {
        return _cellsNodeList;
    }

    function getGameboard() {
        return _gameboard;
    }


    function render() {
      var slots = gameflow.getSlots();
      var temp = gameflow.getTemp();


      for(let i = 0; i < 9; i++) {                      // while i < 9
        if(slots[i] == temp[i]) {                       // if slots[i] = temp[i] then it is not the most recent move played
            _cellsNodeList[i].textContent = slots[i];   // the text content of cellsNodeList[i] becomes slots[i]
        } else {
            gameflow.updateTemp(i);                     // if slots[i] != temp[i], then i is the most recent move played
            _cellsNodeList[i].textContent = slots[i]    // the text content of cellsNodeList[i] becomes slots[i]
            if(_cellsNodeList[i].textContent == 'X' || _cellsNodeList[i].textContent == 'O') { // If [i] is not null (prevents played from applying on initial render)
                _cellsNodeList[i].setAttribute('id', 'played');                                // Add the 'played' id 
                }
        }
      }

    }

    startUp();
  
    return { render, getNodeList, getGameboard }; // return these methods
  
  })();
  
  var players = (function() {
  
      var _playerChar = 'X';
      function getPlayerChar() {
          return _playerChar;
      }

      function turnChange() {
        if(getPlayerChar() == 'X') {
            _playerChar = 'O'
        } else {
            _playerChar = 'X'
        }
    }

    function resetPlayer() {
        _playerChar = 'X';
    }

  
      return { getPlayerChar, turnChange, resetPlayer };
  
  })();
  
  var gameflow = (function() {
      var _counter = 0;
      var _slots = [null,null,null,null,null,null,null,null,null];
      var _temp =  [null,null,null,null,null,null,null,null,null];
  
      function getSlots() {
          return _slots;
      }

      function getTemp() {
        return _temp;
      }
  
      function playerTurn(index) {
          if(_slots[index] == null) {
            
            _slots[index] = players.getPlayerChar();
            gameboard.render();
            counterIncrement();

            if(!prelimCheckState() && (options.getGameType() != 'human')) { // if the game is not over, the bot can make a move
                if(options.getDifficulty() == 'easy') {
                    setTimeout(insertBotPlay, 500); // wait 500ms to allow for spacing between player moves and bot moves
                } else if(options.getDifficulty() == 'medium') {
                    let roll = Math.floor(Math.random() * 4);
                    if(roll >= 1) {
                        setTimeout(insertOptimalPlay, 500);
                    } else {
                        setTimeout(insertBotPlay, 500);
                    }
                } else if(options.getDifficulty() == 'hard'){
                    let roll = Math.floor(Math.random() * 4);
                    if(roll > 0) {
                        setTimeout(insertOptimalPlay, 500);
                    } else {
                        setTimeout(insertBotPlay, 500);
                    }
                }  else if(options.getDifficulty() == 'impossible') {
                    setTimeout(insertOptimalPlay, 500);
                }
            } else if (!prelimCheckState() && (options.getGameType() == 'human')) {
                players.turnChange();
            }
              
          } else {
            gameboard.getGameboard().classList.add('bounce');
            setTimeout(function() { gameboard.getGameboard().classList.remove('bounce') }, 1000);
          }
      }

      function counterIncrement() {
        _counter += 1;
      }

      function updateTemp(index) {
        _temp[index] = _slots[index];
      }

  
      function insertBotPlay() {
          var potMoves = []                 // An array of possible positions for the bot to place its mark
          for(let i = 0; i < 9; i++) {      // while i < 9...
              if(getSlots()[i] == null) {   // if the index specified is empty
                  potMoves.push(i);         // push that index number into the potMoves array
              }
          }
          var play = potMoves[Math.floor((Math.random() * potMoves.length))];   // Select a random position from the potMoves array
          counterIncrement();                                                   // Increment the turn counter +1
          finalCheckState('X');                                                 // Check the game state
          _slots[play] = 'O';                                                   // Place an 'O' in the specified position
          gameboard.render();                                                   // Render the board

      }


      let scores = {
        'X': 1,
        'O': -1,
        'tie': 0
      }

      function insertOptimalPlay() {
        let testArray = [..._slots];
        let bestScore = -Infinity;
        let optimalMove;
        for(let i = 0; i < testArray.length; i++) {
            if(testArray[i] == null) {
                testArray[i] = 'O';
                let score = minimax(testArray, 0, false)
                testArray[i] = null;
                if(score > bestScore) {
                    bestScore = score;
                    optimalMove = i;
                }
            }
        }
        _slots[optimalMove] = 'O';
        counterIncrement();
        gameboard.render();
      }


      function minimax(board, depth, maximizing) {
        let mark;
        if(maximizing) {
            mark = 'O';
        } else {
            mark = 'X';
        }
        let result = areWeDoneOptimal(board, mark);
        if(result !== null) {
            let score = scores[result];
            return score;
        } else {
            if(maximizing) {
                let bestScore = -Infinity;
                let newBoard = [...board]
                for(let i = 0; i < newBoard.length; i++) {
                    if(newBoard[i] == null) {
                        newBoard[i] = mark;
                        let score = minimax(newBoard, depth + 1, false)
                        newBoard[i] = null;
                        if(score > bestScore) {
                            bestScore = score;
                        }
                    }
                }  
                return bestScore;        
            } else {
                let bestScore = Infinity;
                let newBoard = [...board]
                for(let i = 0; i < newBoard.length; i++) {
                    if(newBoard[i] == null) {
                        newBoard[i] = mark;
                        let score = minimax(newBoard, depth + 1, true)
                        newBoard[i] = null;
                        if(score < bestScore) {
                            bestScore = score;
                        }
                    }        
                }
                return bestScore;

            }
        }
    }


      // The conditions below are identical to those in finalCheckState. This was the hardest part of the current build.
      // When implementing transitions to accompany mark placement, I ran into the following issue: If the player's move resulted in a victory, 
      // their mark would be placed, the victory message would display, and the game would reset. However, this time the bot would move first instead of the player.
      // While not gamebreaking, it was not intented behavior. I *believe* this was a result of setting the bot moves within a setTimeout function.
      // I did this to space out player moves and bot moves so as to make it clear who wins. However, it produced the unintended side effect of having the bot move regardless of
      // whether or not the game had ended (the board would render empty and the bot would place its mark where it would've as if the board hadn't been cleared). 
      // If I used finalCheckState, then the board would instantly reset before the player's mark was placed (I attempted to circumvent this in different ways, but could not come up with a solution
      // that solved my problem without creating others). This is not a clean solution, but it works for now.

      function prelimCheckState() {                        
        if(areWeDone()) {              // If the win condition is met
              return true;             // return true
          } else if(_counter >= 9 && !(areWeDone()))  {  // If the tie condition is met
              return true;                              // return true
      }
      return false;
    }
  
      function finalCheckState(icon) {
          if(areWeDone()) {
              alert("'" + icon + "'" + ' won!');
              resetGame();

          } else if(_counter >= 9 && !(areWeDone()))  {
              alert('tie!');
              resetGame();

          }
      }
  
      function areWeDone() {
          return ((_slots[0] != null && _slots[0] == _slots[1] && _slots[1] == _slots[2]) || 
          (_slots[3] != null && _slots[3] == _slots[4] && _slots[4] == _slots[5]) || 
          (_slots[6] != null && _slots[6] == _slots[7] && _slots[7] == _slots[8]) || 
          (_slots[0] != null && _slots[0] == _slots[3] && _slots[3] == _slots[6]) || 
          (_slots[1] != null && _slots[1] ==_slots[4] && _slots[4] == _slots[7]) || 
          (_slots[2] != null && _slots[2] == _slots[5] && _slots[5] == _slots[8]) || 
          (_slots[0] != null && _slots[0] == _slots[4] && _slots[4] == _slots[8]) || 
          (_slots[2] != null && _slots[2] == _slots[4] && _slots[4] == _slots[6]))
      }
  
      function resetGame() {
          for(let i = 0; i < gameboard.getNodeList().length; i++) {
            gameboard.getNodeList()[i].setAttribute('id', 'unplayed');
          }
          _slots = [null,null,null,null,null,null,null,null,null]; 
          _counter = 0;
          players.resetPlayer();
          gameboard.render();
      }

      function areWeDoneOptimal(array, mark) { {

            if((array[0] != null && array[0] == array[1] && array[1] == array[2]) || 
            (array[3] != null && array[3] == array[4] && array[4] == array[5]) || 
            (array[6] != null && array[6] == array[7] && array[7] == array[8]) || 
            (array[0] != null && array[0] == array[3] && array[3] == array[6]) || 
            (array[1] != null && array[1] ==array[4] && array[4] == array[7]) || 
            (array[2] != null && array[2] == array[5] && array[5] == array[8]) || 
            (array[0] != null && array[0] == array[4] && array[4] == array[8]) || 
            (array[2] != null && array[2] == array[4] && array[4] == array[6])) {
                if(mark == 'X') {
                return 'X';
                } else {
                return 'O';
                }
            } else if(!array.includes(null)) {
                return 'tie';
            } else {
                return null;
            }
        }

    }

      return { getSlots, playerTurn, finalCheckState, getTemp, updateTemp, resetGame }
  })();