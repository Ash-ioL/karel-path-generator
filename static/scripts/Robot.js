import { Constants } from "./Constants.js";
import { Intersection } from "./Intersection.js";

export class Robot {
    static robots = [];
    static currentRobot = null;

    static pathMap = {
        t: "robot.turnLeft();",
        m: "robot.move();",
        i: "robot.pickBeeper();",
        o: "robot.putBeeper();"
    }
    static skeleton = `
        import kareltherobot.*;
        import static kareltherobot.Directions;

        public class myClass {
            static {
                World.setDelay(0);
                World.loadWorld(worldName);
                World.setVisible(true);
            }
            static Robot robot = new Robot(robotLocation);
            public static void main(String[] args) {
                // Your robot code goes here
            }
        }
    `;
    constructor(x, y, direction, numBeepers, color) {
        this.x = x;
        this.y = y;
        this.direction = direction; 
        this.numBeepers = numBeepers; // can be Inifnity
        this.color = [255, 255, 255];
        this.past = false;
        this.history = []
        this.isSprinting = false;

        document.getElementById("color-selector").addEventListener("change", (val) => {
            let myColor = val.target.value;
            myColor = myColor.replace("#", "");
            console.log(myColor);
            for (let i = 0; i < 3; i++) {
               let hex = myColor.substring(i*2, i*2+2);
               let intOne = parseInt(hex[0], 16);
               let intTwo = parseInt(hex[1], 16);
               this.color[i] = intOne*16 + intTwo;
            }
            Intersection.city[this.y][this.x].reset();
        });
        document.getElementById("copy-save").addEventListener("click", () => {
            let copyText = "";
            for (let i of this.history) {
                copyText+=i;
            }
            navigator.clipboard.writeText(copyText);
            console.log(this.history);
        });
        document.getElementById("load-save").addEventListener("keydown", (ky) => {
            if (ky.key === "Enter") {
                this.history = [];
                for (let i of document.getElementById("load-save").value) {
                    this.history.push(i);
                }
                console.log(this.history);
                document.getElementById("load-save").value="";
            }
        });
        document.getElementById("get-code").addEventListener("click", () => {
            let res = "";
            for (let i of this.history) {
                res+=Robot.pathMap[i]+"\n";
            }
            navigator.clipboard.writeText(res);
        });

        Robot.robots.push(this);
        if (Robot.currentRobot === null) {
            Robot.currentRobot = this;
        }
    }
    getPose() {
        return [this.x, this.y];
    }
    resetIntersection(grid, xOffset, yOffset) {
        try {
            grid[this.y+yOffset][this.x+xOffset].reset();
        } catch {
            //nothing
        }
    }
    setDirection(direction) {
        let mapping = direction === "n" ? 0 : direction === "e" ? 1 : direction === "s" ? 2 : 3;
        let current = this.direction === "n" ? 0 : this.direction === "e" ? 1 : this.direction === "s" ? 2 : 3;
        for (let i = 0; i < (current-mapping+4)%4; i++) {
            this.history.push("t");
        }
        this.direction = direction;
    }
    // north to south 0 -> 2 north to west 0 -> 3
    move() {
        if (this.direction === "s") {
            if (Intersection.city[this.y][this.x].horizontalWall) return;
        }
        else if (this.direction === "n") {
            try{
                if (Intersection.city[this.y+1][this.x].horizontalWall) return;
            } catch {
                return;
            }
        }
        else if (this.direction == "e") {
            try {
                if (Intersection.city[this.y][this.x+1].verticalWall) return;
            } catch {
                return;
            }
        }
        else 
            if (Intersection.city[this.y][this.x].verticalWall) return;
        if (this.isSprinting) {
            this.isSprinting = false;
            this.move();
        }
        if (this.direction === "n") {
            this.y += 1;
            this.resetIntersection(Intersection.city, 0, -1);

        } else if (this.direction === "s") {
            this.y -= 1;
            this.resetIntersection(Intersection.city, 0, 1);
        } else if (this.direction === "e") {
            this.x += 1;
            this.resetIntersection(Intersection.city, -1, 0);
        } else {
            this.x -= 1;
            this.resetIntersection(Intersection.city, 1, 0);
        }
        if (this.x >= 0 && this.x <= Intersection.avenues && this.y >= 0 && this.y <= Intersection.streets) {
            this.history.push("m");
        } else {
            this.x = Math.max(0, Math.min(Intersection.avenues, this.x));
            this.y = Math.max(0, Math.min(Intersection.streets, this.y));
        }
        this.resetIntersection(Intersection.city, 0, 0);
        console.log(`Direction = ${this.direction}, Coords = ${this.x}, ${this.y}`);
    }

    moveAbsolute(direction) {
        this.setDirection(direction);
        this.move();
    }

    uTurn() {
        if (this.direction === "n") {
            this.direction = "s";
        } else if (this.direction === "s") {
            this.direction = "n";
        } else if (this.direction === "e") {
            this.direction = "w";
        } else {
            this.direction = "e";
        }
        this.history.push("t");
        this.history.push("t");
        this.resetIntersection(Intersection.city, 0, 0);
    }
    turnRight() {
        if (this.isSprinting) {
            this.isSprinting = false;
            this.uTurn();
            return;
        }
        if (this.direction === "n") {
            this.direction = "e";
        } else if (this.direction === "s") {
            this.direction = "w";
        } else if (this.direction === "e") {
            this.direction = "s";
        } else {
            this.direction = "n";
        }
        this.history.push("t");
        this.history.push("t");
        this.history.push("t");
        this.resetIntersection(Intersection.city, 0, 0);
    }
    turnLeft() {
        if (this.isSprinting) {
            this.isSprinting = false;
            this.uTurn();
            return;
        }
        if (this.direction === "n") {
            this.direction = "w";
        } else if (this.direction === "s") {
            this.direction = "e";
        } else if (this.direction === "e") {
            this.direction = "n";
        } else {
            this.direction = "s";
        }
        this.history.push("t");
        this.resetIntersection(Intersection.city, 0, 0);
    }
    putBeeper() {
        if (Intersection.city[this.y][this.x].buffer) return;
        if (this.numBeepers <= 0) return;
        this.numBeepers -= 1;
        Intersection.city[this.y][this.x].increaseBeeper(1);
        this.history.push("o");
        this.resetIntersection(Intersection.city, 0, 0);
    }
    pickBeeper() {
        if (this.isSprinting) {
            this.isSprinting = false;
            this.pickBeeper();
        }
        
        let success = Intersection.city[this.y][this.x].decreaseBeeper(1);
        if (success) {
            this.numBeepers += 1;
            this.history.push("i");
        }
        this.resetIntersection(Intersection.city, 0, 0);
    }
    draw(center, blockWidth) {
        if (this.direction === "n") {
            var img = Constants.images["robot_north"]
        } else if (this.direction == "s") {
            var img = Constants.images["robot_south"]
        } else if (this.direction == "e") {
            var img = Constants.images["robot_east"]
        } else {
            var img = Constants.images["robot_west"]
        }

        let botWidth = 0.6;
        let area = blockWidth * botWidth;
        let top_corner = [center[0]-0.5*area, center[1]-0.5*area];

        Constants.ctx.drawImage(img, top_corner[0], top_corner[1], area, area);
    }
}