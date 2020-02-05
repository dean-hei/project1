// Source for using physics in canvas:
// http://www.somethinghitme.com/2013/01/09/creating-a-canvas-platformer-tutorial-part-one/


// DOM References
let game = document.getElementById("game");
let ctx = game.getContext("2d");
let message = document.getElementById("message");


// Set game canvas width and height
game.setAttribute("width", getComputedStyle(game).width); // width=280
game.setAttribute("height", getComputedStyle(game).height); // height=800

// creates an array to represent a gameboard that is 800/20=40 blocks wide
let gameBoard = new Array(game.width/20);
for (let i=0; i < gameBoard.length; i++) {
    gameBoard[i] = new Array(game.height/20);
    // gameBoard[i] = gameBoard[i].map(function(item) {
    //     return "";
    // });
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
    this.speed = 3;
    this.velX = 0;
    this.velY = 0;
    this.jumping = false;
    this.grounded = false;
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

// initialize the terrain, creatures, and physics
newTerrain();
let frog = new Creature(Math.floor(Math.random()*game.width), 120, "purple", 30, 30); // change height to 120
let fly = new Creature(Math.floor(Math.random()*game.width), 20, "black", 20, 20);
let friction = 0.8
let gravity = 0.8;
let collisionObjects = [];
findCollisionObjects();

// puts all the collision blocks into the array
function findCollisionObjects() {
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[0].length; j++) {
            if (gameBoard[i][j] != undefined && gameBoard[i][j] != "leaf") {
                collisionObjects.push({
                    x: i*20,
                    y: j*20,
                    width: 20,
                    height: 20,
                    type: gameBoard[i][j]
                });
            }
        }
    }
}

// checks for collisions when jumping (taken from online, see above)
function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;
 
    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {         // figures out on which side we are colliding (top, bottom, left, or right)         
        var oX = hWidths - Math.abs(vX),             
            oY = hHeights - Math.abs(vY);         
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= 2*oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
}

function hop(speed) {
    if(!frog.jumping) {
        frog.velY = -frog.speed*speed;
        frog.jumping = true;
        frog.grounded = false;
    }
}

function keyboardHandler(e) {
    switch(e.keyCode) {
        case (68): // d right
            if (frog.velX < frog.speed) {
                frog.velX+=10;
                hop(2);
            }
            break;
        case (65): // a left
            if (frog.velX > -frog.speed) {
                frog.velX-=10;
                hop(2);
            }
            break;
        case (87): // w up
            hop(4);
            break;
        case (83): // s
            //place block;
    }
}

function buttonHandler(e) {
    switch(e.target.id) {
        case ("right"): // d right
            if (frog.velX < frog.speed) {
                frog.velX+=10;
                hop(2);
            }
            break;
        case ("left"): // a left
            if (frog.velX > -frog.speed) {
                frog.velX-=10;
                hop(2);
            }
            break;
        case ("up"): // w up
            hop(4);
            break;
        case ("down"): // s
            //place block;
    }
}

function gameLoop() {
    // set frog physics
    frog.velX *= friction;
    frog.velY += gravity;
    
    // clear canvas
    ctx.clearRect(0, 0, game.width, game.height);

    // check for collisions at each collision object
    frog.grounded = false;
    for(let i = 0; i < collisionObjects.length; i++) {
        var dir = colCheck(frog, collisionObjects[i]);
        if (dir === "l" || dir === "r") {
            frog.velX = 0;
            frog.jumping = false;
        } else if (dir === "b") {
            frog.grounded = true;
            frog.jumping = false;
        } else if (dir === "t") {
            frog.velY *= -1;
        }
    }
    if (frog.grounded) {
        frog.velY = 0;
        frog.y = frog.y;
    }
    frog.x += frog.velX;
    frog.y += frog.velY;

    // make sure frog doesn't go off canvas
    if (frog.x >= game.width-frog.width) {
        frog.x = game.width-frog.width;
    } else if (frog.x <= 0) {
        frog.x = 0; 
    }
    if (frog.y >= game.height-frog.height){
        frog.y = game.height - frog.height;
        frog.jumping = false;
    }

    // draw frog
    frog.render();
    // console.log(frog.x, frog.y);
    // draw fly
    if (fly.alive) {
        fly.x += 3;
        if (fly.x > game.width) {
            fly.x = 0;
        }
        fly.render();
    }
    // render terrain
    renderTerrain();
}

document.addEventListener("keydown", keyboardHandler);
let buttons = document.querySelectorAll("button");
for (button of buttons) {
    button.addEventListener("click", buttonHandler);
}
let runGame = setInterval(gameLoop, 60);
console.log(frog);
