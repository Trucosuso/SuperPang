// @ts-check
import { Settings } from "./settings.js";
import { BallController, PlayerCharacterController, ShotController } from "./controllers.js";

/**
 * Class responsible of managing the whole game
 */
class SuperPigeon {
    /**
     * Create a SuperPigeon Game
     * @param {HTMLElement} element HTML element to draw on
     */
    constructor(element) {
        // Create SVG
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", Settings.GAME_WIDTH.toString());
        this.svg.setAttribute("height", Settings.GAME_HEIGHT.toString());
        element.appendChild(this.svg);

        /** @type {Number} Player lives */
        this.playerLives = 0;
        /** @type {SVGElement} SVG to paint how many lives the player has */
        this.playerLivesView = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        /** @type {Boolean} Move left activated */
        this.moveLeft = false;
        /** @type {Boolean} Move right activated */
        this.moveRight = false;

        /** @type {Number} Store the x position of the mouse */
        this.mousePositionX = null;

        // Variables for controlling if the game is played with keyboard or with mouse
        this.controlledByKeyboard = true;
        this.controlledByMouse = false;

        // Variables for controlling FPS
        this.fpsInterval = 1000 / Settings.MAX_FPS;
        this.then = Date.now();

        // Variables for controlling time for invulnerability and blink of player character
        this.lastHit = 0;
        this.timeSinceLastHit = Settings.INVULNERABILITY_TIME;
        this.blink = true;

        /** @type {Number} next ID to insert */
        this.nextID = 0;

        /** @type {PlayerCharacterController} Store the player */
        this.playerCharacter = null;

        /** @type {Array<BallController>} Balls in the game */
        this.balls = [];

        /** @type {Array<ShotController>} Shots in game */
        this.shots = [];

        // Load custom font
        this.loadCrimsonFont();

        // Paint main menu
        this.paintMainMenu();
    }

    /**
     * Paints the main game, creates the player, the balls, empties the shots and starts the game
     */
    startMainGame() {
        // Add control event listeners to window
        if (this.controlledByKeyboard) {
            this.removeMouseControlEventListeners();
            this.createKeyboardControlEventListeners();
        } else {
            this.removeKeyboardControlEventListeners();
            this.createMouseControlEventListeners();
        }

        // Paint game screen
        this.paintMainGame();

        // Create player character
        this.playerCharacter = new PlayerCharacterController([50, Settings.GAME_HEIGHT - Settings.PLAYER_HEIGHT], "images/steady.png", "player", Settings.PLAYER_WIDTH, Settings.PLAYER_HEIGHT, this.svg);

        // Set player lives
        this.playerLives = Settings.PLAYER_LIVES;

        // Create random balls
        this.balls = this.createBalls(Settings.INITIAL_BALLS);

        // Empty shots
        this.shots = [];

        // Set last hit time to 0 to stop blinking
        this.lastHit = 0;

        // Paint lives
        this.paintLives();

        // Main loop
        this.animationIdentification = window.requestAnimationFrame(() => { this.mainGameLoop(); });
    }

    /**
     * Paints the main menu and adds the event listener to the start button
     */
    paintMainMenu() {
        // Add background
        let mainMenuBackground = document.createElementNS("http://www.w3.org/2000/svg", "image");
        mainMenuBackground.setAttribute("width", Settings.GAME_WIDTH.toString());
        mainMenuBackground.setAttribute("href", Settings.MENU_BACKGROUND);
        this.svg.appendChild(mainMenuBackground);

        // Add button to start game
        let newGameButton = document.createElementNS("http://www.w3.org/2000/svg", "image");
        newGameButton.setAttribute("x", "420");
        newGameButton.setAttribute("y", "400");
        newGameButton.setAttribute("width", "380");
        newGameButton.setAttribute("href", "images/newGameButton.png");
        newGameButton.setAttribute("transform", "rotate(1.5, 420, 400)");
        newGameButton.style.cursor = "pointer";
        this.svg.appendChild(newGameButton);

        // Start game when clicking on new game button
        newGameButton.addEventListener("click", () => {
            while (this.svg.firstChild) {
                this.svg.removeChild(this.svg.lastChild);
            }
            while (this.playerLivesView.firstChild) {
                this.playerLivesView.removeChild(this.playerLivesView.lastChild);
            }
            this.startMainGame();
        });

        // Add speech bubble
        let speechBubble = document.createElementNS("http://www.w3.org/2000/svg", "image");
        speechBubble.setAttribute("x", "290");
        speechBubble.setAttribute("y", "260");
        speechBubble.setAttribute("width", "650");
        speechBubble.setAttribute("href", "images/speechBubble.png");
        this.svg.appendChild(speechBubble);

        // Choose keyboard controls
        this.controlledByKeyboard = true;
        // Add text explaining the controls
        let controlsText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        controlsText.setAttribute("x", "335");
        controlsText.setAttribute("y", "300");
        controlsText.setAttribute("fill", "#00215A");
        controlsText.setAttribute("font-size", "23");
        controlsText.setAttribute("font-family", "\"Crimson\", Serif");
        controlsText.textContent = "Controls: Use keyboard arrows to move and space bar to shoot.";
        this.svg.appendChild(controlsText);

        // Add text with credits
        let creditsText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        creditsText.setAttribute("x", "430");
        creditsText.setAttribute("y", "580");
        creditsText.setAttribute("fill", "black");
        creditsText.setAttribute("font-size", "17");
        creditsText.setAttribute("font-family", "\"Crimson\", Serif");
        creditsText.textContent = "Credits: Programmed by Trucosuso, art by Lagartijosa. ";
        this.svg.appendChild(creditsText);

        // Add button to change the controls
        let changeControlsButton = document.createElementNS("http://www.w3.org/2000/svg", "image");
        changeControlsButton.setAttribute("x", "535");
        changeControlsButton.setAttribute("y", "335");
        changeControlsButton.setAttribute("height", "55");
        changeControlsButton.setAttribute("href", "images/changeControls.png");
        changeControlsButton.setAttribute("transform", "rotate(-2, 420, 350)");
        changeControlsButton.style.cursor = "pointer";
        this.svg.appendChild(changeControlsButton);

        // Change controls when clicking button
        changeControlsButton.addEventListener("click", () => {
            if (this.controlledByKeyboard) {
                this.controlledByKeyboard = false;
                this.controlledByMouse = true;
                controlsText.textContent = "Controls: Aim with the mouse to move and left click to shoot.";
            } else if (this.controlledByMouse) {
                this.controlledByMouse = false;
                this.controlledByKeyboard = true;
                controlsText.textContent = "Controls: Use keyboard arrows to move and space bar to shoot.";
            }
        });
    }

    /**
     * Paints background, frame, and UI
     */
    paintMainGame() {
        // Add background
        let background = document.createElementNS("http://www.w3.org/2000/svg", "image");
        background.setAttribute("width", Settings.GAME_WIDTH.toString());
        background.setAttribute("href", Settings.BACKGROUND);
        this.svg.appendChild(background);

        // Create Frame in SVG
        let frame = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        frame.setAttribute("width", Settings.GAME_WIDTH.toString());
        frame.setAttribute("height", Settings.GAME_HEIGHT.toString());
        frame.setAttribute("fill-opacity", "0");
        frame.setAttribute("stroke", "black");
        this.svg.appendChild(frame);
    }

    /**
     * Paint how much lives the player has
     */
    paintLives() {
        this.playerLivesView.setAttribute("x", "25");
        this.playerLivesView.setAttribute("y", "25");
        for (let i = 0; i < this.playerLives; i++) {
            let life = document.createElementNS("http://www.w3.org/2000/svg", "image");
            life.setAttribute("x", (i * 30).toString());
            life.setAttribute("height", "40");
            life.setAttribute("href", "images/life.png");
            this.playerLivesView.appendChild(life);
        }
        this.svg.appendChild(this.playerLivesView);
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
            if (this.mousePositionX) {
                let hasMoved = this.playerCharacter.moveTo(this.mousePositionX - Settings.PLAYER_WIDTH / 2, Settings.PLAYER_STEP);
                // If the character has not moved change its image to the steady one
                if (!hasMoved) {
                    this.playerCharacter.updateImage("images/steady.png");
                }
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

            // Check if the player character is hit by a ball and if it is hit stop the animation
            let playerHit = this.playerCharacter.colidesWithAnyBall(this.balls);

            this.timeSinceLastHit = now - this.lastHit;

            if (this.timeSinceLastHit < Settings.INVULNERABILITY_TIME) {
                if (this.blink) {
                    this.blink = !this.blink;
                    this.playerCharacter.hideOrShow(this.blink);
                } else {
                    this.blink = !this.blink;
                    this.playerCharacter.hideOrShow(this.blink);
                }
            } else if (this.blink) {
                this.blink = false;
                this.playerCharacter.hideOrShow(this.blink);
            }

            if (playerHit && this.timeSinceLastHit > 2000) {
                this.playerLives--;
                this.playerLivesView.childNodes[this.playerLives].remove();
                this.lastHit = Date.now();
                this.timeSinceLastHit = 0;
            }

        }

        // Next frame if the player still has lives and there are balls remaining. Defeat if no more lives. Victory if no more balls.
        if (this.playerLives && this.balls.length) {
            this.animationIdentification = window.requestAnimationFrame(() => { this.mainGameLoop(); });
        } else if (!this.playerLives) {
            this.showDefeatScreen();
        } else {
            this.showVictoryScreen();
        }
    }

    /**
     * Shows the victory screen on top of the main game
     */
    showVictoryScreen() {
        // Add shadow over background
        let endScreenBackground = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        endScreenBackground.setAttribute("width", Settings.GAME_WIDTH.toString());
        endScreenBackground.setAttribute("height", Settings.GAME_HEIGHT.toString());
        endScreenBackground.setAttribute("fill", "#0f2200");
        endScreenBackground.setAttribute("fill-opacity", "0.6");
        this.svg.appendChild(endScreenBackground);

        // Add victory image
        let endScreenImageWidth = 600;
        let endScreenImageHeight = 460;
        let endScreenImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        endScreenImage.setAttribute("x", (Settings.GAME_WIDTH / 2 - endScreenImageWidth / 2).toString());
        endScreenImage.setAttribute("y", (Settings.GAME_HEIGHT / 2 - endScreenImageHeight / 2).toString());
        endScreenImage.setAttribute("width", endScreenImageWidth.toString());
        endScreenImage.setAttribute("href", "images/victory.png");
        this.svg.appendChild(endScreenImage);

        // Add buttons
        this.addButtonsToEndScreen();
    }

    /**
     * Shows the defeat screen on top of the main game
     */
    showDefeatScreen() {
        // Add shadow over background
        let endScreenBackground = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        endScreenBackground.setAttribute("width", Settings.GAME_WIDTH.toString());
        endScreenBackground.setAttribute("height", Settings.GAME_HEIGHT.toString());
        endScreenBackground.setAttribute("fill", "#0f0022");
        endScreenBackground.setAttribute("fill-opacity", "0.6");
        this.svg.appendChild(endScreenBackground);

        // Add defeat image
        let endScreenImageWidth = 600;
        let endScreenImageHeight = 460;
        let endScreenImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        endScreenImage.setAttribute("x", (Settings.GAME_WIDTH / 2 - endScreenImageWidth / 2).toString());
        endScreenImage.setAttribute("y", (Settings.GAME_HEIGHT / 2 - endScreenImageHeight / 2).toString());
        endScreenImage.setAttribute("width", endScreenImageWidth.toString());
        endScreenImage.setAttribute("href", "images/defeat.png");
        this.svg.appendChild(endScreenImage);

        // Add buttons
        this.addButtonsToEndScreen();
    }

    /**
     * Adds buttons to start a new game and to go to menu. To be used in the end screens.
     */
    addButtonsToEndScreen() {
        // Add button to restart game
        let newGameButton = document.createElementNS("http://www.w3.org/2000/svg", "image");
        newGameButton.setAttribute("x", "250");
        newGameButton.setAttribute("y", "420");
        newGameButton.setAttribute("width", "230");
        newGameButton.setAttribute("href", "images/newGameButton.png");
        newGameButton.style.cursor = "pointer";
        this.svg.appendChild(newGameButton);

        // Start game when clicking on new game button
        newGameButton.addEventListener("click", () => {
            while (this.svg.firstChild) {
                this.svg.removeChild(this.svg.lastChild);
            }
            while (this.playerLivesView.firstChild) {
                this.playerLivesView.removeChild(this.playerLivesView.lastChild);
            }
            this.startMainGame();
        });

        // Add button to go back to main menu
        let menuButton = document.createElementNS("http://www.w3.org/2000/svg", "image");
        menuButton.setAttribute("x", "520");
        menuButton.setAttribute("y", "420");
        menuButton.setAttribute("width", "230");
        menuButton.setAttribute("href", "images/mainMenuButton.png");
        menuButton.style.cursor = "pointer";
        this.svg.appendChild(menuButton);

        // Go to main menu when clicking main menu button
        menuButton.addEventListener("click", () => {
            while (this.svg.firstChild) {
                this.svg.removeChild(this.svg.lastChild);
            }
            this.paintMainMenu();
        });
    }

    /**
     * Adds keyboard control event listeners to window
     */
    createKeyboardControlEventListeners() {
        window.addEventListener("keydown", (e) => {
            if (e.key == "ArrowRight") {
                // Start moving right
                this.moveRight = true;
            }
            if (e.key == "ArrowLeft") {
                // Stop moving right
                this.moveLeft = true;
            }
            if (e.key == " ") {
                if (this.shots.length < Settings.MAX_SHOTS) {
                    // Add new shot
                    this.shots.push(new ShotController([this.playerCharacter.position[0] + this.playerCharacter.width / 2, this.playerCharacter.position[1] + this.playerCharacter.height], Settings.SHOT_SPEED, Settings.SHOT_WIDTH, this.nextID++, Settings.SHOT_COLOR, this.svg));
                    // Update player character to shooting image
                    this.playerCharacter.updateImage("images/shooting.png");
                }
            }
        });
        window.addEventListener("keyup", (e) => {
            if (e.key == "ArrowRight") {
                // Stop moving right
                this.moveRight = false;
                // Update player character to steady image
                this.playerCharacter.updateImage("images/steady.png");
            }
            if (e.key == "ArrowLeft") {
                // Stop moving left
                this.moveLeft = false;
                // Update player character to steady image
                this.playerCharacter.updateImage("images/steady.png");
            }
            if (e.key == " ") {
                // Update player character to steady image
                this.playerCharacter.updateImage("images/steady.png");
            }
        });
    }

    /**
     * Removes keyboard control event listeners from window
     */
    removeKeyboardControlEventListeners() {
        // TODO
    }

    /**
     * Adds mouse control event listeners to svg
     */
    createMouseControlEventListeners() {
        this.svg.addEventListener("mousemove", (e) => {
            this.mousePositionX = e.offsetX;
        });
        this.svg.addEventListener("mousedown", (e) => {
            if (e.button == 0 && this.shots.length < Settings.MAX_SHOTS) {
                // Add new shot
                this.shots.push(new ShotController([this.playerCharacter.position[0] + this.playerCharacter.width / 2, this.playerCharacter.position[1] + this.playerCharacter.height], Settings.SHOT_SPEED, Settings.SHOT_WIDTH, this.nextID++, Settings.SHOT_COLOR, this.svg));
                // Update player character to shooting image
                this.playerCharacter.updateImage("images/shooting.png");
                // Stop propagating the event
                e.stopPropagation();
            }
        });
    }

    /**
     * Adds mouse control event listeners from svg
     */
    removeMouseControlEventListeners() {
        // TODO
    }

    /**
     * Generate random balls.
     * @param {Number} quantity Quantity of balls to be created
     * @returns {Array<BallController>}
     */
    createBalls(quantity) {
        let balls = [];
        for (let i = 0; i < quantity; i++) {
            balls.push(new BallController([randomNumber(200, 800), randomNumber(50, 300)], [randomNumPositiveOrNegative(5), -randomNumber(1, 2.5)], randomInteger(1, 4), this.nextID++, Settings.BALL_COLOR, this.svg));
        }
        return balls;
    }

    /**
     * Loads Crimson font to document
     */
    loadCrimsonFont() {
        let crimsonFont = new FontFace("Crimson", "url(fonts/CrimsonText-Regular.woff2)");
        crimsonFont.load().then(function (loaded_face) {
            document.fonts.add(loaded_face);
        }).catch(function (error) {
            console.log(error);
        });
    }
}

/**
 * Returns a pseudorandom number between the indicated number and its oposite
 * @param {Number} number Max number
 * @returns {Number}
 */
function randomNumPositiveOrNegative(number) {
    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    return (Math.random() * number) * plusOrMinus;
}

/**
 * Returns a pseudorandom number between the indicated numbers
 * @param {Number} min Lower number
 * @param {Number} max Upper number
 * @returns {Number}
 */
function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a pseudorandom integer between the indicated numbers
 * @param {Number} min Lower number
 * @param {Number} max Upper number
 * @returns {Number}
 */
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


export { SuperPigeon };