import 'bootstrap';
import './main.scss';

var view = {
    displayMessage: function (msg) {
        var answerOverlay = document.querySelector(".answer-overlay");
        var messageArea = document.getElementById("answer");
        answerOverlay.style.display = "block";
        messageArea.innerHTML = msg;
        setTimeout(function () {
            answerOverlay.style.display = "none";
            messageArea.innerHTML = '';
        }, 2000)
    },
    displayInstruction: function (inst) {
        var instArea = document.querySelector(".instruction");
        instArea.innerHTML = inst;
        setTimeout(function () {
            instArea.innerHTML = '';
        }, 2000)
    },
    displayHit: function (location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "hit");
    },
    displayMiss: function (location) {
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

    fire: function (guess) {

        var field = document.getElementById(guess);
        if (field.classList.contains("hit") || field.classList.contains("miss")) {
            view.displayInstruction("Tutaj już strzelałeś!");
        }
        else {
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
        }
        return false;
    },

    isSunk: function (ship) {
        for (var i = 0; i < this.shipLength; i++) {
            if (ship.hits[i] !== "hit") {
                return false;
            }
        }
        return true;
    },

    generateShipLocations: function () {
        var locations;
        for (var i = 0; i < this.numShips; i++) {
            do {
                locations = this.generateShip();
            }
            while (this.collision(locations));
            this.ships[i].locations = locations;
        }

    },

    generateShip: function () {
        let direction = Math.floor(Math.random() * 2);
        let row;
        let column;
        let newShipLocations = [];

        //układ poziomy
        if (direction === 1) {
            row = Math.floor(Math.random() * this.boardSize) + 1;
            column = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1))) + 1;
        }

        //układ pionowy
        else {
            row = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1))) + 1;
            column = Math.floor(Math.random() * this.boardSize) + 1;
        }

        for (let i = 0; i < this.shipLength; i++) {

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

    collision: function (locations) {
        for (var i = 0; i < this.numShips; i++) {
            var ship = this.ships[i];
            for (var j = 0; j < locations.length; j++) {
                if (ship.locations.indexOf(locations[j]) >= 0) {
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

        if (!guess.match(/^[A-Z][0-9]$/)) {
            view.displayInstruction("Proszę wpisać literę i cyfrę!");
        }

        else {
            var letters = ["", "A", "B", "C", "D", "E", "F", "G"];
            var row = letters.indexOf(guess.charAt(0));
            var column = guess.charAt(1);

            if (row < 0 || row >= model.boardSize + 1 ||
                column < 0 || column >= model.boardSize + 1) {
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
                document.getElementById("fireButton").setAttribute("class", "hidden");
                document.getElementById("guessInput").setAttribute("disabled", "");
                document.querySelector('.user-data-input').classList.remove("nondisplay");
            }
        }
    }
}


function init() {
    var fireButton = document.getElementById("fireButton");
    fireButton.onclick = handleFireButton;
    document.getElementById('userNameForm').reset();
    handleGuessField(fireButton);
    var guessInput = document.getElementById("guessInput");
    guessInput.focus();
    guessInput.onkeypress = handleKeyPress;
    model.generateShipLocations();

}

function handleFireButton() {
    var guessInput = document.getElementById("guessInput");
    var guess = guessInput.value;
    controller.parseGuess(guess);
    guessInput.value = "";
}

function handleKeyPress(e) {
    var fireButton = document.getElementById("fireButton");
    if (e.keyCode === 13) {
        fireButton.click();
        return false;
    }
}

function handleGuessField() {
    var guessFields = document.querySelectorAll('td');
    for (var i = 0; i < guessFields.length; i++) {
        guessFields[i].addEventListener("click", function () {
            var location = this.getAttribute("id");
            controller.processGuess(location);
            document.getElementById("guessInput").focus();
        });
    }
}

function getUserData() {
    document.getElementById('userNameForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('name');
        if (name.checkValidity()) {
            sendData(name.value);
        }
        else {
            showWarning(name);
        };
    })

}

function showWarning(name) {
    document.getElementById('warning').innerText = "Proszę wpisać poprawne dane!";
    name.setAttribute('style', 'border-color:red');
}

function sendData(name) {
    const date = new Date;
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const thedate = `${dd}.${mm}.${yyyy}`;
    const dataObj = {
        "name": name,
        'scores': controller.guesses,
        "date": thedate
    };
    const dataJSON = JSON.stringify(dataObj);
    

    const xhr = new XMLHttpRequest;
    xhr.open('post', 'http://localhost:3000/user-result', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(dataJSON);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            view.displayMessage(xhr.response);
        }
    }
}



window.onload = init;
getUserData();