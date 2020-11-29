// @ts-check
/** Class representing a particle */
class Particle {

    /**
     * Create a particle
     * @param {Array<Number>} position Position [x, y]
     * @param {Array<Number>} velocity Velocity [x, y]
     * @param {Number} radius Radius of particle
     * @param {Number} mass Mass of particle
     * @param {Number} id ID to identify the particle
     */
    constructor(position, velocity, radius, mass, id = null) {
        this.position = position;
        this.previousPosition = position.slice();
        this.velocity = velocity;
        this.previousVelocity = velocity.slice();
        this.radius = radius;
        this.mass = mass;
        this.id = id;
    }

    // Methods
    /**
     * Moves the particle in the container. If no parameters are passed the particle will move freely.
     * @param {Number} containerWidth Width of the container
     * @param {Number} containerHeight Height of the container
     */
    move(containerWidth = null, containerHeight = null) {
        if (containerWidth == null && containerHeight == null) {
            this.previousPosition = this.position.slice();
            this.position[0] += this.velocity[0];
            this.position[1] += this.velocity[1];
        } else {
            this.position[0] += this.velocity[0];
            this.position[1] += this.velocity[1];
            if (this.position[0] + this.radius >= containerWidth) {
                this.position[0] = containerWidth - this.radius - 1;
                this.velocity[0] *= -1;
            }
            if (this.position[0] - this.radius <= 0) {
                this.position[0] = this.radius + 1;
                this.velocity[0] *= -1;
            }
            if (this.position[1] + this.radius >= containerHeight) {
                this.position[1] = containerHeight - this.radius - 1;
                this.velocity[1] = this.previousVelocity[1];
                this.velocity[1] *= -1;
            }
            if (this.position[1] - this.radius <= 0) {
                this.position[1] = this.radius + 1;
                this.velocity[1] = this.previousVelocity[1];
                this.velocity[1] *= -1;
            }
        }
    }

    /**
     * Changes the velocity of the particle according to a vertical uniform gravitational field
     * g. By default 9.8 as in the surface of the Earth in m²/s²
     * @param {Number} g Gravity to apply to the particle
     */
    gravity(g = 9.8) {
        this.previousVelocity[1] = this.velocity[1];
        this.velocity[1] += g;
    }

    /**
     * Checks if two particles colide. True if they colide, false if they does not.
     * @param {Particle} particle1 
     * @param {Particle} particle2
     * @returns {Boolean}
     */
    static colides(particle1, particle2) {
        // Relative position vector to calulate distance.
        let relativePosition = [particle1.position[0] - particle2.position[0], particle1.position[1] - particle2.position[1]];
        let distance = Math.sqrt(Math.pow(relativePosition[0], 2) + Math.pow(relativePosition[1], 2));

        if (distance < (particle1.radius + particle2.radius)) {
            return true;
        }
        return false;
    }

    /**
     * Checks if a particle colides with one in an array of particles. True if it does colide, false if it does not.
     * @param {Particle} particleToCheck Particle to check agains the array
     * @param {Array<Particle>} particles Array of particles
     * @returns {Boolean}
     */
    static colidesWithArray(particleToCheck, particles) {
        for (const particle of particles) {
            // Relative position vector to calulate distance.
            let relativePosition = [particleToCheck.position[0] - particle.position[0], particleToCheck.position[1] - particle.position[1]];
            let distance = Math.sqrt(Math.pow(relativePosition[0], 2) + Math.pow(relativePosition[1], 2));
            if (distance < (particleToCheck.radius + particle.radius)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Resolve a collision of two particles updating their velocities. Does not check if those two particles collides, for that use colides method.
     * Assumes a perfectly elastic collision.
     * https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
     * @param {Particle} particle1 
     * @param {Particle} particle2
     */
    static resolveCollision(particle1, particle2) {
        // Return to previous position
        particle1.position = particle1.previousPosition.slice();
        particle2.position = particle2.previousPosition.slice();

        // Coefficients to compute new velocities
        let coefficient1 = scalarProduct2D([particle1.velocity[0] - particle2.velocity[0], particle1.velocity[1] - particle2.velocity[1]], [particle1.position[0] - particle2.position[0], particle1.position[1] - particle2.position[1]]);
        coefficient1 /= scalarProduct2D([particle1.position[0] - particle2.position[0], particle1.position[1] - particle2.position[1]], [particle1.position[0] - particle2.position[0], particle1.position[1] - particle2.position[1]]);
        let coefficient2 = scalarProduct2D([particle2.velocity[0] - particle1.velocity[0], particle2.velocity[1] - particle1.velocity[1]], [particle2.position[0] - particle1.position[0], particle2.position[1] - particle1.position[1]]);
        coefficient2 /= scalarProduct2D([particle2.position[0] - particle1.position[0], particle2.position[1] - particle1.position[1]], [particle2.position[0] - particle1.position[0], particle2.position[1] - particle1.position[1]]);

        // Update velocities
        particle1.velocity[0] -= coefficient1 * (particle1.position[0] - particle2.position[0]) * (2.0 * particle2.mass) / (particle1.mass + particle2.mass);
        particle2.velocity[0] -= coefficient2 * (particle2.position[0] - particle1.position[0]) * (2.0 * particle1.mass) / (particle1.mass + particle2.mass);
        particle1.velocity[1] -= coefficient1 * (particle1.position[1] - particle2.position[1]) * (2.0 * particle2.mass) / (particle1.mass + particle2.mass);
        particle2.velocity[1] -= coefficient2 * (particle2.position[1] - particle1.position[1]) * (2.0 * particle1.mass) / (particle1.mass + particle2.mass);
    }

}

/**
 * Class representing a View in SVG of a Particle
 */
class ParticleView {
    /**
     * Create a ParticleView
     * @param {Array<Number>} position Position [x, y]
     * @param {Number} radius Radius of particle
     * @param {String} color Hex string representing color
     * @param {Number} id ID to assign to the HTML element
     * @param {SVGElement} svgContainer Svg element to draw on
     */
    constructor(position, radius, color, id, svgContainer) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.id = id;
        this.svgContainer = svgContainer;
        /** @type {SVGCircleElement} */
        this.circle = null;
    }

    /**
     * Draws the particle in the container for the first time
     */
    firstDraw() {
        this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.circle.setAttribute("cx", this.position[0].toString());
        this.circle.setAttribute("cy", this.position[1].toString());
        this.circle.setAttribute("r", this.radius.toString());
        this.circle.setAttribute("fill", this.color);
        this.circle.id = this.id.toString();
        this.svgContainer.appendChild(this.circle);
    }

    /**
     * Updates the view position of the particle
     * @param {Array<Number>} position Position [x, y]
     */
    updatePosition(position) {
        this.position = position;
        this.circle.setAttribute("cx", this.position[0].toString());
        this.circle.setAttribute("cy", this.position[1].toString());
    }

    /**
     * Removes the HTML element. You should delete this object after doing this. This method does not remove it.
     */
    remove() {
        this.circle.remove();
    }
}

/**
 * Class representing a Super Pang Ball.
 * @extends Particle
 */
class BallSuperPang extends Particle {
    /**
     * Create a ball for Super Pang
     * @param {Array<Number>} position Position [x, y]
     * @param {Array<Number>} velocity Velocity [x, y]
     * @param {Number} size Size of the ball. Only 1, 2, 3 and 4 allowed.
     * @param {Number} id ID to identify the ball
     */
    constructor(position, velocity, size, id = null) {
        let radius = 0;
        switch (size) {
            case 1:
                radius = 10;
                break;
            case 2:
                radius = 20;
                break;
            case 3:
                radius = 40;
                break;
            default:
                size = 4;
                radius = 70;
                break;
        }
        super(position, velocity, radius, 1, id);
        this.size = size;
    }

    // Methods
    /**
     * Breaks the ball. Creates two new smaller ball if it was big enough.
     * You should delete this object after doing this. This method does not remove it.
     * If the balls where created the method returns the two new balls in an array.
     * @returns {Array<BallSuperPang>|null} Two smaller balls if it is big enough. Null if the ball being breaked is the smallest one
     */
    break() {
        if (this.size > 1) {
            let ball1 = new BallSuperPang([this.position[0] - this.radius, this.position[1] + this.radius], [-Math.abs(this.velocity[0]), -Math.abs(this.velocity[1])], this.size - 1);
            let ball2 = new BallSuperPang([this.position[0] + this.radius, this.position[1] + this.radius], [Math.abs(this.velocity[0]), -Math.abs(this.velocity[1])], this.size - 1);
            return [ball1, ball2];
        } else {
            return null;
        }
    }
}


/**
 * Class representing a player character
 */
class PlayerCharacter {
    /**
     * Create a player character for Super Pang
     * @param {Array<Number>} position Character position
     * @param {String} id ID to identify the player character
     * @param {Number} width Character width
     * @param {Number} height Character height
     * 
     */
    constructor(position, id, width, height) {
        this.position = position;
        this.id = id;
        this.width = width;
        this.height = height;
    }

    /**
     * Moves the player character right. One unit if no step indicated. If no parameters are passed the player will not hit any wall
     * @param {Number} containerWidth Width of the container
     * @param {Number} step How much to move the player
     */
    moveRight(containerWidth = null, step = 1) {
        if (containerWidth == null) {
            this.position[0] += step;
        } else {
            this.position[0] += step;
            if (this.position[0] + this.width >= containerWidth) {
                this.position[0] = containerWidth - this.width;
            }
        }
    }

    /**
     * Moves the player character left. One unit if no step indicated. If no parameters are passed the player will not hit any wall
     * @param {Number} containerWidth Width of the container
     * @param {Number} step How much to move the player
     */
    moveLeft(containerWidth = null, step = 1) {
        if (containerWidth == null) {
            this.position[0] -= step;
        } else {
            this.position[0] -= step;
            if (this.position[0] <= 0) {
                this.position[0] = 0;
            }
        }
    }

    /**
     * Checks if the player character collides with a ball. If it does returns true. False if it does not.
     * @param {BallSuperPang} ball Ball to check collision with
     * @returns {Boolean} True if it has collided. False if it does not.
     */
    colidesWithBall(ball) {
        // Nearest rectangle point to ball
        let point = ball.position.slice();

        // Check for closest edge. First X axis the. Y axis.
        if (ball.position[0] < this.position[0]) {
            point[0] = this.position[0];
        } else if (ball.position[0] > this.position[0] + this.width) {
            point[0] = this.position[0] + this.width;
        }
        if (ball.position[1] < this.position[1]) {
            point[1] = this.position[1];
        } else if (ball.position[1] > this.position[1] + this.height) {
            point[1] = this.position[1] + this.height;
        }

        // Calculate from the center of the ball to the nearest rectangle point
        let distance = Math.sqrt(Math.pow(ball.position[0] - point[0], 2) + Math.pow(ball.position[1] - point[1], 2));

        if (distance <= ball.radius) {
            return true;
        }
        return false;
    }
}

/**
 * Class representing a View in SVG of a PlayerCharacter
 */
class PlayerCharacterView {
    /**
     * Create a PlayerCharacterView
     * @param {Array<Number>} position Character position
     * @param {Number} width Character width
     * @param {Number} height Character height
     * @param {String} image String to image of player character
     * @param {String} id ID to assing to the HTML element
     * @param {SVGElement} svgContainer Svg element to draw on
     */
    constructor(position, width, height, image, id, svgContainer) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.image = image;
        this.id = id;
        this.svgContainer = svgContainer;
        this.figure = null;
    }

    /**
     * Draws the player character in the container for the first time.
     */
    firstDraw() {
        this.figure = document.createElementNS("http://www.w3.org/2000/svg", "image");
        this.figure.setAttribute("x", this.position[0].toString());
        this.figure.setAttribute("y", this.position[1].toString());
        this.figure.setAttribute("width", this.width.toString());
        this.figure.setAttribute("height", this.height.toString());
        this.figure.setAttribute("href", this.image);
        this.figure.id = this.id.toString();
        this.svgContainer.appendChild(this.figure);
    }

    /**
     * Updates the position of the character in the view
     * @param {Array<Number>} position Position [x, y]
     */
    updatePosition(position) {
        this.position = position;
        this.figure.setAttribute("x", this.position[0].toString());
        this.figure.setAttribute("y", this.position[1].toString());
    }

    /**
     * Updates the image of the character
     * @param {String} imageLocation Image location
     */
    updateImage(imageLocation) {
        this.figure.setAttribute("href", imageLocation);
    }

    /**
     * Removes the HTML element. You should delete this object after doing this. This method does not remove it.
     */
    remove() {
        this.figure.remove();
    }
}


/**
 * Class representing a shot. In our coordinate system Y axis increments downwards.
 * So this shot propagates upwards according to that.
 */
class Shot {
    /**
     * Create a shot
     * @param {Array<Number>} position Shot initial position
     * @param {Number} speed Shot speed
     * @param {Number} width Shot width
     * @param {Number} id ID to identify the shot
     */
    constructor(position, speed, width, id) {
        this.position = position;
        this.width = width;
        this.height = 0;
        this.speed = speed;
        this.id = id;
    }

    /**
     * Propagates the shot upwards (decrementing its Y position and incrementing its heigh).
     * If the shot colides with top returns true to inform the controller that it should be deleted.
     * @returns {Boolean} True if it should be deleted. False if it does not.
     */
    propagateOrRemove() {
        if (this.position[1] > 0) {
            this.height += this.speed;
            this.position[1] -= this.speed;
            return false;
        } else {
            return true;
        }
    }

    /**
     * Checks if the shot collides with a ball. If it does returns true. False if it does not.
     * @param {BallSuperPang} ball Ball to check collision with
     * @returns {Boolean} True if it has collided. False if it does not.
     */
    colidesWithBall(ball) {
        // Nearest rectangle point to ball
        let point = ball.position.slice();

        // Check for closest edge. First X axis the. Y axis.
        if (ball.position[0] < this.position[0]) {
            point[0] = this.position[0];
        } else if (ball.position[0] > this.position[0] + this.width) {
            point[0] = this.position[0] + this.width;
        }
        if (ball.position[1] < this.position[1]) {
            point[1] = this.position[1];
        } else if (ball.position[1] > this.position[1] + this.height) {
            point[1] = this.position[1] + this.height;
        }

        // Calculate from the center of the ball to the nearest rectangle point
        let distance = Math.sqrt(Math.pow(ball.position[0] - point[0], 2) + Math.pow(ball.position[1] - point[1], 2));

        if (distance <= ball.radius) {
            return true;
        }
        return false;
    }
}

/**
 * Class representing a View in SVG of a Shot
 */
class ShotView {
    /**
     * Create a ShotView
     * @param {Array<Number>} position Shot position
     * @param {Number} width Shot width
     * @param {Number} height Shot height
     * @param {Number} id ID to assing to the HTML element
     * @param {String} color Hex string representing color
     * @param {SVGElement} svgContainer Svg element to draw on
     */
    constructor(position, width, height, id, color, svgContainer) {
        this.position = position;
        this.id = id;
        this.width = width;
        this.height = height;
        this.color = color;
        this.svgContainer = svgContainer;
        this.figure = null;
    }

    /**
     * Draws the shot in the container for the first time.
     */
    firstDraw() {
        this.figure = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.figure.setAttribute("x", this.position[0].toString());
        this.figure.setAttribute("y", this.position[1].toString());
        this.figure.setAttribute("width", this.width.toString());
        this.figure.setAttribute("height", this.height.toString());
        this.figure.setAttribute("fill", this.color);
        this.figure.id = this.id.toString();
        this.svgContainer.appendChild(this.figure);
    }

    /**
     * Updates the shot in the view setting its new y and height
     * @param {Array<Number>} position Position [x, y]
     * @param {Number} height Shot height
     */
    updateSvg(position, height) {
        this.position = position;
        this.height = height;
        this.figure.setAttribute("y", this.position[1].toString());
        this.figure.setAttribute("height", this.height.toString());
    }

    /**
     * Removes the HTML element. You should delete this object after doing this. This method does not remove it.
     */
    remove() {
        this.figure.remove();
    }
}


/**
 * Returns the scalar product of two 2D vectors
 * @param {Array<Number>} vector1 First vector
 * @param {Array<Number>} vector2 Second vector
 * @returns {Number}
 */
function scalarProduct2D(vector1, vector2) {
    return vector1[0] * vector2[0] + vector1[1] * vector2[1];
}



export { Particle, ParticleView, BallSuperPang, PlayerCharacter, PlayerCharacterView, Shot, ShotView };