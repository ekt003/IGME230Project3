// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application(600,600);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images
PIXI.loader.
add(["images/Spaceship.png"]).
add(["images/explosions.png"]).
add(["images/blackOpal.jpg"]).
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene,ship,scoreLabel,lifeLabel,shootSound,hitSound,fireballSound;
let gameOverScene;
let circleTimer;
let levelDifficultly;

let circles = [];
let hunger = [];
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let gameOverScoreLabel;
let light;

function setup() {
	stage = app.stage;
    
    //Create the background Image
    let sprite = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    sprite.position.x = 0;
    sprite.position.y = 0;
    stage.addChild(sprite);
    
	// #1 - Create the `start` scene
	startScene = new PIXI.Container();
    stage.addChild(startScene);

	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

	// #4 - Create labels for all 3 scenes
	createLabelsAndButtons();

	// #5 - Create ship
    ship = new Ship();
    gameScene.addChild(ship);
	
	// #6 - Load Sounds
    shootSound = new Howl({
        src:['sounds/shoot.wav']
    });

    hitSound = new Howl({
        src:['sounds/hit.mp3']
    });
    fireballSound = new Howl({
        src:['sounds/fireball.mp3']
    });

	// #8 - Start update loop
	app.ticker.add(gameLoop);

	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill:0xFFFFFF,
        fontSize: 36,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    });

    //set up `startScene`
    //make the top start label
    let startLabel1 = new PIXI.Text("Project IPRE");
    startLabel1.style = new PIXI.TextStyle({
        fill:0xFFFFFF,
        fontSize: 48,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    });

    startLabel1.x = 150;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    //make the middle start label
    let startLabel2 = new PIXI.Text("Ready to explore the universe?");
    startLabel2.style = new PIXI.TextStyle({
        fill:0xFFFFFF,
        fontSize: 28,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    });

    startLabel2.x = 80;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    //make the start game button
    let startButton = new PIXI.Text("Start Research");
    startButton.style = buttonStyle;
    startButton.x = 170;
    startButton.y = sceneHeight-100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup",startGame); //function reference
    startButton.on("pointerover",e=>e.target.alpha = 0.7); //arrow function
    startButton.on("pointerout",e=>e.currentTarget.alpha = 1.0); //arrow function

    startScene.addChild(startButton);

    //set up `gameScene`
    let textStyle = new PIXI.TextStyle({
        fill:0xFFFFFF,
        fontSize: 18,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    });

    //make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    //make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    let gameOverText = new PIXI.Text(`The Hunger Wins`);

    gameOverScoreLabel = new PIXI.Text();

    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Consolas",
        stroke: 0xFF0000,
        strokeThickness: 6
    });

    

    gameOverText.style = textStyle;
    gameOverText.x = 35;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);


    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30 ,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    })

    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 50;
    gameOverScoreLabel.y = sceneHeight/2 + 50;
    gameOverScene.addChild(gameOverScoreLabel);

    //make "play again" button
    let playAgainButton = new PIXI.Text("Try the next cycle");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 120;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on("pointerover",e=>e.target.alpha = 0.7);
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);


}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x = 300;
    ship.y = 450;
    circleTimer = 0;
    levelDifficultly = 60;//One per 60 ticks
    loadLevel();
    SpawnLight();

}

function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score   ${score}`;
}

function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life   ${life}%`;
}

function SpawnCircle(){
    console.log("Spawn 1 hungery boi")
    createCircles(1);
}

function SpawnLight(){
    let c = new Circle(10,0xFFFFFF);
    c.x = Math.floor(Math.random()*(sceneWidth));
    c.y = 20;
    light = c;
    gameScene.addChild(light);
}

function gameLoop(){
	if (paused) return; // keep this commented out for now
	
	//Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if(dt > 1/12) dt=1/12;
	
	//Move Ship
	let mousePosition = app.renderer.plugins.interaction.mouse.global;
    
    let amt = 6*dt;

    //lerp (linear interpolate) the x&y values with lerp()
    let newX = lerp(ship.x, mousePosition.x, amt);
    let newY = lerp(ship.y, mousePosition.y, amt);

    //keep the ship on the screen with clamp()
    let w2 = ship.width/2;
    let h2 = ship.height/2;
    ship.x = clamp(newX,0+w2,sceneWidth-w2);
    ship.y = clamp(newY,0+h2,sceneHeight-h2);
	
	// #3 - Move Circles
    for(let c of circles){
        c.move(dt);
        if(c.x <= c.radius || c.x >= sceneWidth-c.radius){
            c.reflectX();
            //c.move(dt);
        }
        if(c.y >= sceneHeight-c.radius){
            c.reflectY();
            c.move(dt);
        }
    }

    //move light of creation
    light.move();
    if (light.y <= 0){
        light.reflectY();
    }

    // #3 - gyrate Hunger
    for(let h of hunger){
        h.moveInCircle(dt);
//        if(h.x <= h.radius || h.x >= sceneWidth-h.radius){
//            h.reflectX();
//            //c.move(dt);
//        }
//        //c.y <= c.radius || 
//        if(h.y >= sceneHeight-h.radius){
//            h.reflectY();
//            h.move(dt);
//        }
    }
	
	//Check for Collisions
	for(let c of circles){
        //circles and ship
        if(c.isAlive && rectsIntersect(c,ship)){
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
        if(light.isAlive && c.isAlive && rectsIntersect(c,light)){
            console.log("Hunger gets the light");
            light.isAlive = false;
        }
    }

    if(light.isAlive && rectsIntersect(light,ship)){
        console.log("The IPRE gains the light!");
        increaseScoreBy(1);
        light.isAlive = false;
    }
    
    //Increase timer
    circleTimer += 1;
    //console.log(circleTimer)
    //spawn circle
    if(circleTimer == levelDifficultly){
        //console.log(circleTimer)
        SpawnCircle();
        circleTimer = 0;
    }


	// #6 - Now do some clean up
	if(!light.isAlive){
        gameScene.removeChild(light);
        SpawnLight();
    }

	// #7 - Is game over?
	if(life <= 0){
        end();
        return;
    }
	
	// #8 - Load next level
    if(circles.length == 0){
        levelNum ++;
        loadLevel();
    }
}

//creates circle enemies coming off of the enemy
function createCircles(numCircles){
    for(let i=0;i<numCircles;i++){
        
        let colorTint = Math.floor(Math.random()*(10));
        let colorSel = 0x000000;
        switch(colorTint){
			case 0:
				colorSel = 0x590000;
				break;
			case 1:
				colorSel = 0x592200;
				break;
			case 2:
				colorSel = 0x594a00;
				break;
			case 3:
				colorSel = 0x475900;
				break;
			case 4:
				colorSel = 0x2c0379;
				break;
			case 5:
				colorSel = 0x00591d;
				break;
			case 6:
				colorSel = 0x003f59;
				break;
			case 7:
				colorSel = 0x002459;
				break;
			case 8:
				colorSel = 0x170059;
				break;
			case 9:
				colorSel = 0x490059;
				break;
		}
        
        let c = new Circle(10, colorSel);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = sceneHeight - 25;
        
        circles.push(c);
        gameScene.addChild(c);
        
    }
}

function createHunger(numHunger){
    for(let i=0;i<numHunger;i++){
        let h = new Circle(50, 0x222222);
        h.x = Math.random() * (sceneWidth - 50) + 25;
        h.y = sceneHeight - 5 - i;
        h.angle = i;
        hunger.push(h);
        gameScene.addChild(h);  
    }
}
function loadLevel(){
    createCircles(50);
    createHunger(40);
    paused = false;
}

function end(){
    paused = true;

    //clear out level
    circles.forEach(c=>gameScene.removeChild(c));
    circles = [];
    
    hunger.forEach(h=>gameScene.removeChild(h));
    hunger = [];

    gameOverScene.visible = true;
    gameScene.visible = false;

    gameOverScoreLabel.text = `You saved ${score} Lights of Creation`;
}

