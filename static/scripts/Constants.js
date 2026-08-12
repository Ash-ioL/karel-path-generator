export class Constants { // Not rlly all constants but mainly used to store global vars
    static dimensionBasis = 1000;
    static c = document.getElementById("grid");
    static {
        Constants.c.width = Constants.dimensionBasis;
        Constants.c.height = Constants.dimensionBasis;
        Constants.c.style.width = "100cqw";
        Constants.c.style.height = "100cqh";
    }
    static ctx = Constants.c.getContext('2d');
    static source = [
        "robot_north",
        "robot_south",
        "robot_east",
        "robot_west",
        "beeper",
        "horizontal_wall",
        "vertical_wall"
    ];
    static images = {};
    static imagesLoaded;
    static imgRoot = window.initConfig["imgRoot"];
    static {
        Constants.images = {};
        let loaded = 0;
        let total = Object.keys(Constants.source).length;
        Constants.imagesLoaded = new Promise(resole => {
            for (let key of Constants.source) {
                let img = new Image();
                //img.crossOrigin = "anonymous";
                img.src = Constants.imgRoot+key+".png";
    
                img.onload = () => {
                    loaded++;
                    if (loaded === total) {
                        resole();
                    }
                };
    
                Constants.images[key] = img;
            }
        });
    }
}