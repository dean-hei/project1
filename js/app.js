// DOM References for canvas
let game = document.getElementById("game");
let ctx = game.getContext("2d");

// Set game canvas width and height
game.setAttribute("width", getComputedStyle(game).width);
game.setAttribute("height", getComputedStyle(game).height);

// creates an array to represent a gameboard that is 800/20=40 blocks wide
let gameBoard = new Array(game.width/20);
for (let i=0; i < gameBoard.length; i++) {
    gameBoard[i] = new Array(game.height/20);
    gameBoard[i] = gameBoard[i].map(i =>"");
}

// define things to draw blocks
function renderBlock(color, x, y) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 20, 20);
}
let treasureDesc = "red";
let stoneDesc = "gray";
let mudDesc = "sienna";
let leafDesc = "lime";

// define things to render creatures
function Creature(x, y, color, width, height) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = width;
    this.height = height;
    this.alive = true;
    this.render = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function newTerrain() {
    // DRAW TREASURE CHEST
    let treasureX = Math.floor(Math.random()*game.width/20)*20;
    let treasureY = game.height - 20;
    renderBlock(treasureDesc, treasureX, treasureY);
    // add treasure chest to the gameboard;
    gameBoard[treasureX/20][treasureY/20] = "treasure";
    
    // DRAW STONES
    // draw first two layers
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i][gameBoard[i].length-1] != "treasure") {
            renderBlock(stoneDesc, i*20, game.height-20);
            gameBoard[i][gameBoard[i].length-1] = "stone";
        }
        renderBlock(stoneDesc, i*20, game.height-40);
        gameBoard[i][gameBoard[i].length-2] = "stone";
    }
    // draw random layer of stone: draw three hills
    for (let i = 0; i < 3; i++) {
        hill = 4 + Math.floor(Math.random() * 4);
        leftBank = Math.floor(Math.random() * 10) + i*10;
        for (let j = leftBank; j < leftBank + hill; j++) {
            if(gameBoard[j][gameBoard[j].length-3] != "stone") {
                renderBlock(stoneDesc, j*20, game.height-60);
                gameBoard[j][gameBoard[j].length-3] = "stone";
            }
        }
    }
    
    // DRAW MUD
    // draw 2 blocks of mud on top of every stone block
    for (let i = 0; i < gameBoard.length; i++) {
        // draw middle row
        renderBlock(mudDesc, i*20, game.height-80);
        gameBoard[i][gameBoard[i].length-4] = "mud";
        // draw top row
        if(gameBoard[i][gameBoard[i].length-3] == "stone") {
            renderBlock(mudDesc, i*20, game.height-100);
            gameBoard[i][gameBoard[i].length-5] = "mud";
            // add extra block on hill
            if(i!=0 && gameBoard[i-1][gameBoard.length-5] != "mud") {
                renderBlock(mudDesc, (i-1)*20, game.height-100);
                gameBoard[i-1][gameBoard[i-1].length-5] = "mud";    
            }
        } else { //fill in the gaps between the stones
            renderBlock(mudDesc, i*20, game.height-60);
            gameBoard[i][gameBoard[i].length-3] = "mud";
            // add extra block on hill
            // console.log("index", i, gameBoard)
            if(i!=0 && gameBoard[i-1][gameBoard[i].length-3] == "stone" 
                && gameBoard[i][gameBoard[i].length-3] == "mud") {
                renderBlock(mudDesc, i*20, game.height-100);
                gameBoard[i][gameBoard[i].length-5] = "mud";    
            }
        }
    }
    
    // DRAW LEAVES
    // draw leaves somewhere on top of mud
    for (let i = 0; i < 3; i++) {
        // pick a random number between 1 and 13 
        let leafX = Math.floor(Math.random()*13)+i*13;
        let leafY = 0; 
        // console.log(i, leafX);
        // put it on top of mud
        if (gameBoard[leafX][gameBoard[0].length-5] == "mud") {
            leafY = game.height-120;
            renderBlock(leafDesc, leafX*20, leafY);
            gameBoard[leafX][leafY/20] = "leaf"; 
        } else {
            leafY = game.height-100;
            renderBlock(leafDesc, leafX*20, leafY);
            gameBoard[leafX][leafY/20] = "leaf"; 
        }
        //make it 6 high
        for (let j = 1; j < 6; j++) {
            renderBlock(leafDesc, leafX*20, leafY-j*20);
            gameBoard[leafX][leafY/20-j] = "leaf";
        }
    }
    console.log(gameBoard);
}

function renderTerrain() {
    // loop through all the spaces in gameBoard to render each 
    // type of block
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            switch (gameBoard[i][j]) {
                case ("treasure"):
                    renderBlock(treasureDesc, i*20, j*20);
                    break;
                case ("stone"):
                    renderBlock(stoneDesc, i*20, j*20);
                    break;
                case ("mud"):
                    renderBlock(mudDesc, i*20, j*20);
                    break;
                case ("leaf"):
                    renderBlock(leafDesc, i*20, j*20);
            }
        }
    }
}

// game init function
newTerrain();
let frog = new Creature(0, 120, "purple", 30, 30);
let fly = new Creature(Math.floor(Math.random()*game.width)
                        , 20, "black", 20, 20);

function gameLoop() {
    // clear previous
    ctx.clearRect(0, 0, game.width, game.height);

    // draw player
    frog.render();
    if (fly.alive) {
        fly.render();
    }
    // render terrain
    renderTerrain();
}

let funGame = setInterval(gameLoop, 60);