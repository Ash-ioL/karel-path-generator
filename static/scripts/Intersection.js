import { Constants } from "./Constants.js";
import { Robot } from "./Robot.js";

export class Intersection {
    static avenues = 10;
    static streets = 10;
    static city = [];
    static cityBufferless = [];
    static initialized = false;
    
    static blockWidth = Constants.dimensionBasis/Math.max(Intersection.avenues+1, Intersection.streets+1);

    static wallWidth = 0.106811*Intersection.blockWidth;

    static resetAll() {
        Constants.ctx.clearRect(0, 0, Constants.c.width, Constants.c.height);
        this.addBufferBoundary();
        for (let i of Intersection.city) {
            for (let k of i) {
                k.resetNoClear();
            }
        }
    }
    static resizeCity(newStreets, newAvenues) { 
        if (!Intersection.initialized) {
            Intersection.initialized = true;
            Intersection.initializeCity();
        }
        let oldStreets = Intersection.streets;
        let oldAvenues = Intersection.avenues;
        let oldCity = Intersection.cityBufferless;

        if (newStreets <= 0) newStreets = 1;
        if (newAvenues <= 0) newAvenues = 1;

        Intersection.streets = newStreets;
        Intersection.avenues = newAvenues;
        Intersection.blockWidth = Constants.dimensionBasis/Math.max(Intersection.avenues+1, Intersection.streets+1);
        Intersection.wallWidth = 0.106811*Intersection.blockWidth;

        let addWidth = Intersection.wallWidth;

        Constants.c.width = Intersection.blockWidth*(newAvenues+1) + addWidth;
        Constants.c.height = Intersection.blockWidth*(newStreets+1) + addWidth;
        Constants.c.style.width = `${100*(newAvenues+1)/Math.max((newAvenues+1), (newStreets+1))}cqw`;
        Constants.c.style.height = `${100*(newStreets+1)/Math.max((newAvenues+1), (newStreets+1))}cqh`;

        let newCity = [];
        let bufferRow = [];
        for (let i = 0; i < newStreets; i++) {
            let street = [];
            for (let k = 0; k < newAvenues; k++) {
                if (i === newStreets-1) {
                    bufferRow.push(new Intersection(k, newStreets, true));
                }
                street.push(new Intersection(k, i, false));
            }
            newCity.push(street);
        }
        bufferRow.push(new Intersection(bufferRow.length, newStreets, true))

        let rowsToCheck = Math.min(newCity.length, oldCity.length);
        let colsToCheck = Math.min(newCity[0].length, oldCity[0].length);

        for (let i = 0; i < rowsToCheck; i++) {
            for (let k = 0; k < colsToCheck; k++) {
                newCity[i][k].horizontalWall = oldCity[i][k].horizontalWall;
                newCity[i][k].verticalWall = oldCity[i][k].verticalWall;
                newCity[i][k].numBeepers = oldCity[i][k].numBeepers;
            }
        }

        Intersection.cityBufferless = newCity;

        for (let i of newCity) {
            i.push(new Intersection(i.length, i[0].street, true))
        }
        newCity.push(bufferRow);
        Intersection.city = newCity;

        Intersection.addNormalBoundary();

        Intersection.resetAll();

        console.log(Intersection.city);
    }
    // problem: canvas origin not in same place as karel's - FIXED
    static initializeCity() {
        Intersection.city = [];
        Intersection.cityBufferless = []

        for (let i = 0; i < Intersection.streets+1; i++) {
            let street = [];
            let bufferLess = [];

            for (let k = 0; k < Intersection.avenues+1; k++) {
                if (k === Intersection.avenues) {
                    street.push(new Intersection(k, i, true));
                } else {
                    street.push(new Intersection(k, i, i === Intersection.streets ? true : false));
                }
                if (k < Intersection.avenues) {
                    bufferLess.push(new Intersection(k, i, false));
                }
            }

            Intersection.city.push(street);

            if (i < Intersection.streets) {
                Intersection.cityBufferless.push(bufferLess);
            }
        }
        this.resetAll();
    }

    static addNormalBoundary() {
        for (let i = 0; i < Intersection.streets+1; i++) {
            Intersection.city[i][0].verticalWall = true;
        }
        for (let i of Intersection.city[0]) {
            i.horizontalWall = true;
        }
    }

    static addBufferBoundary() {
        let img = Constants.images["vertical_wall"];

        for (let i = 0; i < Intersection.streets+1; i++) {
            let corner = Intersection.city[i][Intersection.avenues].position(1, 1);
            Constants.ctx.drawImage(img, corner[0], corner[1], Intersection.blockWidth, Intersection.blockWidth);
        }

        img = Constants.images["horizontal_wall"]
        for (let i of Intersection.city[Intersection.streets]) {
            let corner = i.position(-1, 3);
            Constants.ctx.drawImage(img, corner[0], corner[1], Intersection.blockWidth, Intersection.blockWidth);
        }
    }

    constructor(avenue, street, buffer) { 
        this.avenue = avenue;
        this.street = street;
        this.buffer = buffer;
        this.width = Intersection.blockWidth;
        this.numBeepers = 0;
        this.horizontalWall = false;
        this.verticalWall = false;
        this.coords = this.resetCoords();
        this.hasRobot = Robot.currentRobot != null && Robot.currentRobot.getPose()[0] === this.avenue && Robot.currentRobot.getPose()[1] === this.street;
    }
    // clear the intersection before drawing instead of overlapping
    reset() {
        Constants.ctx.clearRect(this.minX(), this.minY(), this.width, this.width);

        this.coords = this.resetCoords();
        this.width = Intersection.blockWidth;
        this.hasRobot = Robot.currentRobot != null && Robot.currentRobot.getPose()[0] === this.avenue && Robot.currentRobot.getPose()[1] === this.street;

        this.draw();
    }
    resetCoords() {
        return [this.avenue*Intersection.blockWidth, ((Intersection.streets)-this.street)*Intersection.blockWidth+Intersection.wallWidth];
    }
    resetNoClear() {
        this.coords = this.resetCoords();
        this.width = Intersection.blockWidth;
        this.hasRobot = Robot.currentRobot != null && Robot.currentRobot.getPose()[0] === this.avenue && Robot.currentRobot.getPose()[1] === this.street;

        this.draw();
    }
    setContent(content) {
        this.numBeepers = parseInt(content[0]);
        this.horizontalWall = content[1] === "1";
        this.verticalWall = content[2] === "1";
        this.reset();
    }
    // "bhv"
    // b is the number of beepers
    // h is either 1 or 0, 1 meaning yes horizontal wall
    // v is similar to h 
    increaseBeeper(num) {
        this.numBeepers += num;
    }
    decreaseBeeper(num) {
        if (num <= this.numBeepers) {
            this.numBeepers -= num;
            return true;
        } else {
            return false;
        }
    }
    setHorizontalWall(condition) {
        if (condition) {
            this.horizontalWall = true;
        } else {
            this.horizontalWall = false;
        }
    }
    setVerticalWall(condition) {
        if (condition) {
            this.verticalWall = true;
        } else {
            this.verticalWall = false;
        }
    }
    position(x, y) {
        let center = [this.coords[0]+Intersection.blockWidth/2, this.coords[1]+Intersection.blockWidth/2];
        let length = Intersection.blockWidth;
        return [(center[0]+x*length*0.5), (center[1]+(-y*length)*0.5)];
    }
    minX() {
        return this.coords[0];
    }
    maxX() {
        return this.coords[0]+Intersection.blockWidth;
    }
    minY() {
        return this.coords[1];
    }
    maxY() {
        return this.coords[1]+Intersection.blockWidth;
    }
    draw() {
        let center = this.position(0, 0);
        let top_left = this.position(-1, 1);
        let top_right = this.position(1, 1);

        // Draw the default grid lines
        Constants.ctx.beginPath();
        Constants.ctx.strokeStyle = "#6366f1";
        Constants.ctx.fillStyle = "#BDBFFF"

        if (this.buffer) {
            Constants.ctx.strokeStyle = "#BFBF15";
            Constants.ctx.fillStyle = "#F7F797";
        }
        Constants.ctx.lineWidth = 3;
        
        Constants.ctx.fillRect(top_left[0], top_left[1], this.width, this.width);
        Constants.ctx.fill();

        Constants.ctx.beginPath();
        Constants.ctx.moveTo(center[0], this.minY());
        Constants.ctx.lineTo(center[0], this.maxY());
        Constants.ctx.moveTo(this.minX(), center[1]);
        Constants.ctx.lineTo(this.maxX(), center[1]);
        Constants.ctx.stroke();

        // Draw horizontal wall
        if (this.horizontalWall) {
            let img = Constants.images["horizontal_wall"];
            let width = this.width;
            let height = this.width;

            Constants.ctx.drawImage(img, top_left[0], top_left[1], width, height);
        }

        // Draw vertical wall
        if (this.verticalWall) {
            let img = Constants.images["vertical_wall"];
            let width = this.width;
            let height = this.width;

            Constants.ctx.drawImage(img, top_left[0], top_left[1], width, height);
            console.log();
        }
        
        // Draw beeper
        if (this.numBeepers >= 1) {
            Constants.ctx.beginPath();
            Constants.ctx.fillStyle = "white";
            Constants.ctx.strokeStyle = "black";
            Constants.ctx.arc(this.position(0, 0)[0], this.position(0, 0)[1], this.width/4, 0, Math.PI*2);
            Constants.ctx.stroke();
            Constants.ctx.fill();

            let img = Constants.images["beeper"];
            let width = this.width/2;
            let height = this.width/2;

            Constants.ctx.drawImage(img, top_left[0]+width/2, top_left[1]+width/2, width, height);
            
            Constants.ctx.font = "600 "+this.width*0.21+"px Inter";
            Constants.ctx.textAlign = "right";
            Constants.ctx.textBaseline = "top";
            Constants.ctx.fillStyle = "black";
            Constants.ctx.strokeStyle = "black";
            Constants.ctx.lineWidth = 5;
            Constants.ctx.fillText(""+this.numBeepers, top_right[0]-0.15*this.width, top_right[1]+0.15*this.width);
        }

        // Draw the robot if robot is on its square
        if (this.hasRobot) {
            Robot.currentRobot.draw(center, this.width);
        }
    }
}