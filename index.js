// @ts-check
import { SuperPang } from "./game.js";

window.addEventListener("load", () => {
    let element = document.getElementById("gameHere");
    new SuperPang(element);
});