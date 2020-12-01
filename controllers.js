// @ts-check
import { Settings } from "./settings.js";
import { BallSuperPang, ParticleView, PlayerCharacter, PlayerCharacterView, Shot, ShotView } from "./classes.js";

/**
 * Class for controlling a Super Pang Ball and its View
 */
class BallController {
    /**
     * Create controller for a Super Pang Ball and its View
     * @param {Array<Number>} position Position [x, y]
     * @param {Array<Number>} velocity Velocity [x, y]
     * @param {Number} size Size of the ball. Only 1, 2, 3 and 4 allowed.
     * @param {Number} id ID to identify the ball
     * @param {String} color Hex string representing color
     * @param {SVGElement} svgContainer Svg element to draw on
     */
    constructor(position, velocity, size, id, color, svgContainer) {
        this.model = new BallSuperPang(position, velocity, size, id);
        this.view = new ParticleView(position, this.model.radius, color, id, svgContainer);
        this.view.firstDraw();
    }

    /**
     * Applies gravity to the ball, moves it within the svgContainer borders and updates its view.
     */
    move() {
        let borders = this.view.svgContainer.getBoundingClientRect();
        this.model.gravity(Settings.GRAVITY);
        this.model.move(borders.width, borders.height);
        this.view.updatePosition(this.model.position);
    }

    /**
     * Breaks the ball and deletes its view. If the ball was big enough returns two ballController with the new balls in it
     * You should delete this object after doing this. This method does not remove it.
     * @param {Number} nextID Next ID to be assigned
     * @returns {Array<BallController>|null} Two smaller balls if it is big enough. Null if the ball being breaked is the smallest one
     */
    breakBall(nextID) {
        // Variable to return
        let newBallControllers = null;
        // Break current ball and store the new balls if needed
        let createdBalls = this.model.break();

        // Create new BallControllers if needed
        if (createdBalls) {
            newBallControllers = [];
            newBallControllers[0] = new BallController(createdBalls[0].position, createdBalls[0].velocity, createdBalls[0].size, nextID++, this.view.color, this.view.svgContainer);
            newBallControllers[1] = new BallController(createdBalls[1].position, createdBalls[1].velocity, createdBalls[1].size, nextID++, this.view.color, this.view.svgContainer);
        }

        // Delete current ball
        delete this.model;
        this.view.remove();
        delete this.view;

        // Return new BallControllers or null
        return newBallControllers;
    }
}

/**
 * Class for controlling a Player Character and its View
 */
class PlayerCharacterController {
    /**
     * Create controller for a Player Character and its View
     * @param {Array<Number>} position Position [x, y]
     * @param {String} image String to image of player character
     * @param {String} id ID to identify the player character
     * @param {Number} width Character width
     * @param {Number} height Character height
     * @param {SVGElement} svgContainer Svg element to draw on
     */
    constructor(position, image, id, width, height, svgContainer) {
        this.model = new PlayerCharacter(position, id, width, height);
        this.view = new PlayerCharacterView(position, width, height, image, id, svgContainer);
        this.view.firstDraw();
    }


    // Getters
    /**
     * Gets player position
     * @returns {Array<Number>}
     */
    get position() {
        return this.model.position;
    }

    /**
     * Gets player height
     * @returns {Number}
     */
    get height() {
        return this.model.height;
    }

    /**
     * Gets player width
     * @returns {Number}
     */
    get width() {
        return this.model.width;
    }


    // Methods

    /**
     * Moves the player character right and updates its view. One unit if no step indicated
     * @param {Number} step How much to move the player
     */
    moveRight(step = 1) {
        let containerWidth = this.view.svgContainer.getBoundingClientRect().width;
        this.model.moveRight(containerWidth, step);
        this.view.updatePosition(this.model.position);
        this.updateImage("images/moveRight.png");
    }

    /**
     * Moves the player character left and updates its view. One unit if no step indicated
     * @param {Number} step How much to move the player
     */
    moveLeft(step = 1) {
        let containerWidth = this.view.svgContainer.getBoundingClientRect().width;
        this.model.moveLeft(containerWidth, step);
        this.view.updatePosition(this.model.position);
        this.updateImage("images/moveLeft.png");
    }

    /**
     * Updates the image of the character
     * @param {String} imageLocation Image location
     */
    updateImage(imageLocation) {
        this.view.updateImage(imageLocation);
    }

    /**
     * Checks if the player character collides any ball in the array. 
     * @param {Array<BallController>} balls Array of balls to check collision with
     * @returns {Boolean} True if the player character collides with a ball. False if it does not.
     */
    colidesWithAnyBall(balls) {
        /** @type {Array<BallSuperPang>} */
        let ballsModel = pluck(balls, "model");
        let collides = false;
        ballsModel.forEach( ball => {
            if (this.model.colidesWithBall(ball)) {
                collides = true;
            }
        });

        return collides;
    }

    /**
     * Hides the HTML element of the view if hide is true. "Unhides" it if it is false.
     * @param {Boolean} hide True if you want to hide the image. False if you want to show it
     */
    hideOrShow(hide = false){
        if (hide) {
            this.view.hideImage();
        } else {
            this.view.showImage();
        }
    }
}

/**
 * Class for controlling a Shot and its View
 */
class ShotController {
    /**
     * Create controller for a Super Pang Ball and its View
     * @param {Array<Number>} position Position [x, y]
     * @param {Number} speed Shot speed
     * @param {Number} width Shot width
     * @param {Number} id ID to identify the shot
     * @param {String} color Hex string representing color
     * @param {SVGElement} svgContainer Svg element to draw on
     */
    constructor(position, speed, width, id, color, svgContainer) {
        this.model = new Shot(position, speed, width, id);
        this.view = new ShotView(position, width, this.model.height, id, color, svgContainer);
        this.view.firstDraw();
    }

    /**
     * Propagates the shot upwards. Returns true if the shot collided with the top of the container.
     * If this method returns true you should delete this object. This method does not remove it.
     * @returns {Boolean} True if it should be deleted. False if it does not.
     */
    propagateOrRemove() {
        if (this.model.propagateOrRemove()) {
            this.view.remove();
            delete this.view;
            delete this.model;
            return true;
        }
        this.view.updateSvg(this.model.position, this.model.height);
        return false;
    }

    /**
     * Checks if the shot collides any ball in the array. If it does removes the shot and returns the index of the ball in the array. -1 if it does not collides.
     * If this method returns true you should delete this object and the ball it has collided with. This method does not remove them.
     * @param {Array<BallController>} balls Array of balls to check collision with
     * @returns {Number} Index of the ball in the array if it collides. -1 if it does not collides.
     */
    colidesWithAnyBall(balls) {
        /** @type {Array<BallSuperPang>} */
        let ballsModel = pluck(balls, "model");
        let indexToReturn = -1;
        ballsModel.forEach( (ball, index) => {
            if (this.model.colidesWithBall(ball)) {
                indexToReturn = index;
            }
        });

        if (indexToReturn >= 0) {
            this.view.remove();
            delete this.view;
            delete this.model;
        }

        return indexToReturn;
    }
}

/**
 * Returns an array of only one property from an array with objects
 * @param {Array<Object>} array 
 * @param {String} key 
 */
function pluck(array, key) {
    return array.map(function(item) { return item[key]; });
}  

export { BallController, PlayerCharacterController, ShotController };