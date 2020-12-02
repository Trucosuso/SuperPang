class Settings {
    // Game settings
    /** @type {Number} Game width in pixels */
    static GAME_WIDTH = 1000;
    /** @type {Number} Game height in pixels */
    static GAME_HEIGHT = 600;
    /** @type {String} Menu background image location */
    static MENU_BACKGROUND = "images/menuBackground.png"
    /** @type {String} Background image location */
    static BACKGROUND = "images/background.png"
    /** @type {Number} Max FPS */
    static MAX_FPS = 30;

    // Character settings
    /** @type {Number} Player lives */
    static PLAYER_LIVES = 3;
    /** @type {Number} Invulnerability time in miliseconds */
    static INVULNERABILITY_TIME = 2000;
    /** @type {Number} Player character width */
    static PLAYER_WIDTH = 109;
    /** @type {Number} Player character height */
    static PLAYER_HEIGHT = 85;
    /** @type {Number} Player moving speed */
    static PLAYER_STEP = 4;

    // Ball settings
    /** @type {Number} Initial quantity of balls */
    static INITIAL_BALLS = 4;
    /** @type {Number} Player moving gravity to apply to balls */
    static GRAVITY = 9.8 * 0.008;
    /** @type {String} Ball color */
    static BALL_COLOR = "#480381";

    // Shot settings
    /** @type {Number} Max shots allowed */
    static MAX_SHOTS = 4;
    /** @type {Number} Shot propagating speed */
    static SHOT_SPEED = 6;
    /** @type {Number} Shot width in pixels */
    static SHOT_WIDTH = 3;
    /** @type {String} Shot color */
    static SHOT_COLOR = "#0CCCE1";
}

export { Settings };