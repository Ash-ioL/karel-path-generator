import Robot from "./Robot.js";
import Constants from "./Constants.js";

export function controls() {
    window.addEventListener("keydown", (e) => {
        let robot = Robot.currentRobot;
        if (robot === null) {
            robot = Robot.robots[0];
        }
        if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
            return;
        }
        if (e.repeat) return;
        if (e.shiftKey) robot.isSprinting = true;
        let key = e.key.toLowerCase();

        if (key == "w") {
            robot.moveAbsolute("n");
        }
        if (key == "a") {
            robot.moveAbsolute("w");
        }
        if (key == "s") {
            robot.moveAbsolute("s");
        }
        if (key == "d") {
            robot.moveAbsolute("e");
        }

        if (key == "f") {
            robot.move();
        }
        if (key == "q") {
            robot.turnLeft();
        }
        if (key == "e") {
            robot.turnRight();
        }
        if (key == "x") {
            robot.putBeeper();
        }
        if (key == "z") {
            robot.pickBeeper();
        }
        if (key == "p") {
            console.log(robot.history);
        }
        console.log(`Key press detected: ${e.key}`);
    });
    Intersection.resetAll();
};