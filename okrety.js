var view = {
  displayMessage: function(msg) {
    var answerOverlay = document.querySelector(".answer-overlay");
    var messageArea = document.getElementById("answer");
    answerOverlay.style.display = "block";
    messageArea.innerHTML = msg;
    setTimeout(function(){
      answerOverlay.style.display = "none";
      messageArea.innerHTML = '';
    }, 2000)
  },
  displayInstruction: function(inst) {
    var instArea = document.querySelector(".instruction");
    instArea.innerHTML = inst;
    setTimeout(function(){
      instArea.innerHTML = '';
    }, 2000)
  },
  displayHit: function(location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "hit");
  },
  displayMiss: function(location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  }
};

var model = {
  boardSize: 7,
  numShips: 3,
  shipLength: 3,
  shipsSunk: 0,

  ships: [
    { locations: ["", "", ""], hits: ["", "", ""] },
    { locations: ["", "", ""], hits: ["", "", ""] },
    { locations: ["", "", ""], hits: ["", "", ""] }
  ],

  fire: function(guess) {

    var field = document.getElementById(guess);
    if ( field.classList.contains("hit") || field.classList.contains("miss") ) {
      view.displayInstruction( "Tutaj już strzelałeś!");
    }

    for (var i = 0; i < this.numShips; i++) {
      var ship = this.ships[i];
      var index = ship.locations.indexOf(guess);

      if (index >= 0) {
        ship.hits[index] = "hit";
        view.displayHit(guess);
        view.displayMessage("TRAFIONY!!!!");
        if (this.isSunk(ship)) {
          this.shipsSunk++;
          view.displayMessage("TRAFIONY ZATOPIONY!");
        }
        return true;
      }
      view.displayMessage("PUDŁO!");
      view.displayMiss(guess);
    }
    fireButton.disabled = false;
    return false;
  },

  isSunk: function(ship) {
    for (var i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== "hit") {
        return false;
      }
    }
    return true;
  },

  generateShipLocations: function() {
    var locations;
    for (var i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip();
      }
      while (this.collision(locations));
      this.ships[i].locations = locations;

      // view.displayHit(locations[0]);
      // view.displayHit(locations[1]);
      // view.displayHit(locations[2]);
    }

  },

  generateShip: function() {
    var direction = Math.floor(Math.random() * 2);
    var row, col;
    var newShipLocations = [];

    //układ poziomy
    if (direction === 1) {
      row = Math.floor ( Math.random() * this.boardSize ) + 1;
      column = Math.floor ( Math.random() * (this.boardSize - (this.shipLength + 1) ) ) + 1;
    }

    //układ pionowy
    else {
      row = Math.floor ( Math.random() * (this.boardSize - (this.shipLength + 1) ) ) + 1;
      column = Math.floor ( Math.random() * this.boardSize ) + 1;
    }

    for (i = 0; i < this.shipLength; i++) {

      //układ poziomy
      if (direction === 1) {
        newShipLocations.push(row + "" + (column + i));
      }

      //układ pionowy
      else {
        newShipLocations.push((row + i) + "" + column);
      }
    }

    return newShipLocations;

  },

  collision: function(locations) {
    for ( var i = 0; i < this.numShips; i++ ) {
      var ship = this.ships[i];
      for (var j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0 ) {
          return true;
        }
      }
    }
    return false;
  }

};


var controller = {
  guesses: 0,

  parseGuess: function (guess) {

    guess = guess.toUpperCase();

    if(!guess.match(/^[A-Z][0-9]$/)) {
      view.displayInstruction("Proszę wpisać literę i cyfrę!");
    }

    else {
      var letters = ["","A", "B", "C", "D", "E", "F", "G"];
      var row = letters.indexOf(guess.charAt(0));
      var column = guess.charAt(1);

      if (row < 0 || row >= model.boardSize ||
        column < 0 || column >= model.boardSize) {
          view.displayInstruction("Strzał poza planszą!");
        }
        else {
          var location = row + column;
          this.processGuess(location);
        }
        return null;
      }
    },

    processGuess: function (location) {
      if (location) {
        this.guesses++;
        var hit = model.fire(location);

        if (hit && model.shipsSunk === model.numShips) {
          view.displayMessage("Zatopiłeś wszystkie okręty w " + this.guesses + " probach. Koniec gry.");

          var button = document.getElementById("fireButton");

          button.setAttribute("class", "hidden");
        }
      }
    }
  }


  function init() {
    var fireButton = document.getElementById("fireButton");
    fireButton.onclick = handleFireButton;
    handleGuessField(fireButton)
    var guessInput = document.getElementById("guessInput");
    guessInput.onkeypress = handleKeyPress;
    model.generateShipLocations();

  }

  function handleFireButton() {
    fireButton.disabled = true;
    var guessInput = document.getElementById("guessInput");
    var guess = guessInput.value;
    controller.parseGuess(guess);
    guessInput.value = "";
  }

  function handleKeyPress(e){
    var fireButton = document.getElementById("fireButton");
    if (e.keyCode === 13) {
      fireButton.click();
      return false;
    }
  }

  function handleGuessField(){
    var guessFields = document.querySelectorAll('th');
    for (var i = 0; i < guessFields.length; i++) {
      guessFields[i].addEventListener("click", function(){
        fireButton.disabled = true;
        var location = this.getAttribute("id");
        controller.processGuess(location);
      });
    }
  }

  window.onload = init;
