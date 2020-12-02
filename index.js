// @ts-check
import { SuperPigeon } from "./game.js";

window.addEventListener("load", () => {
    let element = document.getElementById("gameHere");
    new SuperPigeon(element);
});