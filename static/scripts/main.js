new Robot(0, 0, "e", 4, "red");

import { Robot } from "./Robot.js";
import { Intersection } from "./Intersection.js"
import { Constants } from "./Constants.js";
import { controls } from "./controls.js";

await Constants.imagesLoaded;

function run() {
    Intersection.resizeCity(10, 10); // make sure not to resize before initialized
    Intersection.city[1][1].setContent("111");
    console.log(Intersection.city[1][1].horizontalWall);

    controls();
}
run();