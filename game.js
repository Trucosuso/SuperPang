// @ts-check
import { Settings } from "./settings.js";
import { BallController, PlayerCharacterController, ShotController } from "./controllers.js";

/**
 * Class responsible of managing the whole game
 */
class SuperPang {
    /**
     * Create a SuperPang Game
     * @param {HTMLElement} element HTML element to draw on
     */
    constructor(element) {
        // Create SVG
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", Settings.GAME_WIDTH.toString());
        this.svg.setAttribute("height", Settings.GAME_HEIGHT.toString());
        element.appendChild(this.svg);

        // Create Frame in SVG
        this.frame = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.frame.setAttribute("width", Settings.GAME_WIDTH.toString());
        this.frame.setAttribute("height", Settings.GAME_HEIGHT.toString());
        this.frame.setAttribute("fill-opacity", "0");
        this.frame.setAttribute("stroke", "black");
        this.svg.appendChild(this.frame);
        

        /** @type {PlayerCharacterController} Store the player */
        this.playerCharacter = new PlayerCharacterController([50, Settings.GAME_HEIGHT - Settings.PLAYER_HEIGHT], "images/steady.png", "jugador", Settings.PLAYER_WIDTH, Settings.PLAYER_HEIGHT, this.svg);

        /** @type {Number} next ID to insert */
        this.nextID = 0;

        /** @type {Array<BallController>} Balls in the game */
        this.balls = this.createBalls(4);

        /** @type {Array<ShotController>} Shots in game */
        this.shots = [];

        /** @type {Boolean} Move left activated */
        this.moveLeft = false;
        /** @type {Boolean} Move right activated */
        this.moveRight = false;

        // Add event listeners to window
        this.createEventListeners();

        // Variables for controlling FPS
        this.fpsInterval = 1000 / 30;
        this.then = Date.now();

        // Main loop
        this.animationIdentification = window.requestAnimationFrame(() => { this.mainGameLoop(); });
    }

    /**
     * Animates everything and unfolds the game
     */
    mainGameLoop() {
        // Variables for controlling FPS
        let now = Date.now();
        let elapsed = now - this.then;
        // If enough time has pased, draw the next frame
        if (elapsed > this.fpsInterval) {
            this.then = now - (elapsed % this.fpsInterval);


            // Move character if needed
            if (this.moveLeft) {
                this.playerCharacter.moveLeft(Settings.PLAYER_STEP);
            }
            if (this.moveRight) {
                this.playerCharacter.moveRight(Settings.PLAYER_STEP);
            }

            // Propagate shots if there are any
            for (let i = 0; i < this.shots.length; i++) {
                let deleteShot = this.shots[i].propagateOrRemove();
                if (deleteShot) {
                    this.shots.splice(i, 1);
                }
            }

            // Move all balls
            for (const ball of this.balls) {
                ball.move();
            }

            // Check if any ball colides with any shot
            for (let i = 0; i < this.shots.length; i++) {
                let ballToDelete = this.shots[i].colidesWithAnyBall(this.balls);
                // If any ball collides break it and delete the shot
                if (ballToDelete >= 0) {
                    this.shots.splice(i, 1);
                    let newBalls = this.balls[ballToDelete].breakBall(this.nextID);
                    this.balls.splice(ballToDelete, 1);
                    // If the breaked ball has created two new balls add them to the array
                    if (newBalls) {
                        this.nextID += 2;
                        this.balls.push(...newBalls);
                    }
                }
            }
        }

        // Check if the player character is hit by a ball and if it is hit stop the animation
        let playerHit = this.playerCharacter.colidesWithAnyBall(this.balls);
        if (!playerHit) {
            this.animationIdentification = window.requestAnimationFrame(() => { this.mainGameLoop(); });
        }
    }

    /**
     * Adds event listeners to window
     */
    createEventListeners() {
        window.addEventListener("keydown", (e) => {
            if (e.key == "ArrowRight") {
                this.moveRight = true;
            }
            if (e.key == "ArrowLeft") {
                this.moveLeft = true;
            }
            if (e.key == " ") {
                if (this.shots.length < Settings.MAX_SHOTS) {
                    this.shots.push(new ShotController([this.playerCharacter.position[0] + this.playerCharacter.width / 2, this.playerCharacter.position[1] + this.playerCharacter.height], Settings.SHOT_SPEED, Settings.SHOT_WIDTH, this.nextID++, Settings.SHOT_COLOR, this.svg));
                    this.playerCharacter.updateImage("images/shooting.png");
                }
            }
        });
        window.addEventListener("keyup", (e) => {
            if (e.key == "ArrowRight") {
                this.moveRight = false;
                this.playerCharacter.updateImage("images/steady.png");
            }
            if (e.key == "ArrowLeft") {
                this.moveLeft = false;
                this.playerCharacter.updateImage("images/steady.png");
            }
            if (e.key == " ") {
                this.playerCharacter.updateImage("images/steady.png");
            }
        });
    }

    /**
     * Generate random balls.
     * @param {Number} quantity Quantity of balls to be created
     * @returns {Array<BallController>}
     */
    createBalls(quantity) {
        let balls = [];
        for (let i = 0; i < quantity; i++) {
            balls.push(new BallController([numAleatorio(200, 800), numAleatorio(50, 300)], [numAleatorioPositivoONegativo(5), -numAleatorio(1, 2.5)], numAleatorioEntero(1, 4), this.nextID++, Settings.BALL_COLOR, this.svg));
        }
        return balls;
    }
}

/**
 * Devuelve un color aleatorio en hex
 * @returns {String} Color aleatorio en hex
 */
function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Devuelve un número aleatorio entre el número indicado y su opuesto
 * @param {Number} numero Número máximo
 * @returns {Number}
 */
function numAleatorioPositivoONegativo(numero) {
    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    return (Math.random() * numero) * plusOrMinus;
}

/**
 * Devuelve un número aleatorio entre los números indicados
 * @param {Number} min Número mínimo
 * @param {Number} max Número máximo
 * @returns {Number}
 */
function numAleatorio(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Devuelve un número aleatorio entre los números indicados
 * @param {Number} min Número mínimo
 * @param {Number} max Número máximo
 * @returns {Number}
 */
function numAleatorioEntero(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


export { SuperPang };