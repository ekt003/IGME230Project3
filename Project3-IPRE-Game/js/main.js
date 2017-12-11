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
add(["images/Starblaster.png"]).
add(["images/explosions.png"]).
add(["images/blackOpal.jpg"]).
add(["images/light.png"]).
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let instScene;
let gameScene,ship,scoreLabel,lifeLabel, alertLabel, alertItem,shootSound,hitSound,fireballSound;
let gameOverScene;
let winScene;
let circleTimer;
let levelDifficultly;
let BG,BG2,BG3;
let spriteStart, spriteLoop1,spriteLoop2,spriteLoop3, spriteEnd, spriteWin;
let buttonStyle;

let circles = [];
let hunger = [];
let score = 0;
let life = 100;
let levelNum = 1;
let alertLife = 200;
let paused = true;
let gameOverScoreLabel,highScoreLabel,winScoreLabel,winHighScoreLabel;
let light;
let hungerSpeed;
let backgroundMusic;
let alertText,alertTimer;
let highScore;
let win;

let shieldState;

function setup() {
	stage = app.stage;
    
    //Create the background Image
    BG = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    BG.position.x = 0;
    BG.position.y = 0;
    stage.addChild(BG);
    
    //Create the background Image2
    BG2 = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    BG2.position.x = 0;
    BG2.position.y = -sceneHeight;
    stage.addChild(BG2);
    
    //Create the background Image3
    BG3 = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    BG3.position.x = 0;
    BG3.position.y = sceneHeight;
    stage.addChild(BG3);

    spriteStart = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    spriteStart.position.x = 0;
    spriteStart.position.y = 0;
    
    //Create the background Image
    spriteLoop1 = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    spriteLoop1.position.x = 0;
    spriteLoop1.position.y = 0;
    spriteLoop2 = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    spriteLoop2.position.x = 0;
    spriteLoop2.position.y = -sceneHeight;
    spriteLoop3 = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    spriteLoop3.position.x = 0;
    spriteLoop3.position.y = -sceneHeight*2;
    
    //Create the background Image
    spriteEnd = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    spriteEnd.position.x = 0;
    spriteEnd.position.y = 0;
    
    // Create the background Image
    spriteWin = PIXI.Sprite.fromImage('images/blackOpal.jpg');
    spriteWin.position.x = 0;
    spriteWin.position.y = 0;
    
	// Create the `start` scene
	startScene = new PIXI.Container();
    startScene.addChild(spriteStart);
    stage.addChild(startScene);

	// Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.addChild(spriteLoop1);
    gameScene.addChild(spriteLoop2);
    gameScene.addChild(spriteLoop3);
    gameScene.visible = false;
    stage.addChild(gameScene);

    // Create the `instructions` scene and make it invisible
    instScene = new PIXI.Container();
    instScene.visible = false;
    stage.addChild(instScene);

	// Create the `gameOver` scene and make it invisible
	gameOverScene = new PIXI.Container();
    gameOverScene.addChild(spriteEnd);
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    
    // #3b - Create the `Win` scene and make it invisible
	winScene = new PIXI.Container();
    winScene.addChild(spriteWin);
    winScene.visible = false;
    stage.addChild(winScene);

	// #4 - Create labels for all 3 scenes
    createStartLabelsAndButtons();
    createEndLabelsAndButtons();
    createWinLabelsAndButtons();

	// #5 - Create ship and set shields
    ship = new Ship();
    gameScene.addChild(ship);
    shieldState = false;
	
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
    backgroundMusic = new Howl({
        src:['sounds/starblaster.wav'],
        loop: true,
        volume: 0.5
    });

	// #8 - Start update loop
	app.ticker.add(gameLoop);
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

//displays the instruction scene
function displayInstructions(){
    //sets only instructions scene to visible
    startScene.visible = false;
    instScene.visible = true;
    gameOverScene.visible = false;
    gameScene.visible = false;

    //makes the button style
    buttonStyle = new PIXI.TextStyle({
        fill:0xFFFFFF,
        fontSize: 36,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    });

    //make the to game button
    let startButton = new PIXI.Text("Start Research");
    startButton.style = buttonStyle;
    startButton.x = 170;
    startButton.y = sceneHeight-70;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup",startGame); //function reference
    startButton.on("pointerover",e=>e.target.alpha = 0.7); //arrow function
    startButton.on("pointerout",e=>e.currentTarget.alpha = 1.0); //arrow function

    instScene.addChild(startButton);

    //make the top label
    let titleLabel = new PIXI.Text("Instructions");
    titleLabel.style = new PIXI.TextStyle({
        fill:0xFFFFFF,
        fontSize: 48,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    });

    titleLabel.x = 150;
    titleLabel.y = 50;
    instScene.addChild(titleLabel);

    //make the instructions
    let instStyle = new PIXI.TextStyle({
        fill:0xFFFFFF,
        fontSize: 22,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    })

    //list of instruction label
    let instList = [];

    //this was as non-DRY as I could since they all needed custom x and y positions and different content for each line
    instList.push(createNewLine(40, 120, "Navigate your ship around the screen using", instStyle));
    instList.push(createNewLine(40, 150, "the mouse. Chase the bright white Light of", instStyle));
    instList.push(createNewLine(35, 180, "Creation when it spawns and avoid being hit", instStyle));
    instList.push(createNewLine(35, 210, "by the colorful particles emanating from the ", instStyle));
    instList.push(createNewLine(30, 240, "monstrous hunger at the bottom of the screen.", instStyle));
    instList.push(createNewLine(40, 300, "If the Hunger’s particles consume the light", instStyle));
    instList.push(createNewLine(65, 330, "before you can reach it, it grows more", instStyle));
    instList.push(createNewLine(45, 360, "powerful and the light becomes even harder ", instStyle));
    instList.push(createNewLine(65, 390, "to retrieve. Getting hit by the Hunger ", instStyle));
    instList.push(createNewLine(45, 420, "damages the integrity of the ship. Try to ", instStyle));
    instList.push(createNewLine(60, 450, "retrieve enough Light before your luck ", instStyle));
    instList.push(createNewLine(170, 480, "(and ship) run out.", instStyle));

    //adds instructions to the scene
    for(let label of instList){
        instScene.addChild(label);
    }

    
}

//adds another line to the instructions
function createNewLine(xPos, yPos, content, style){
    let instLabel = new PIXI.Text(content);
    instLabel.style = style;
    instLabel.x = xPos;
    instLabel.y = yPos;

    return instLabel;
}

//adds content to the start screen
function createStartLabelsAndButtons(){
    buttonStyle = new PIXI.TextStyle({
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
    startButton.y = sceneHeight-200;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup",startGame); //function reference
    startButton.on("pointerover",e=>e.target.alpha = 0.7); //arrow function
    startButton.on("pointerout",e=>e.currentTarget.alpha = 1.0); //arrow function

    startScene.addChild(startButton);

    //make the tutorial game button
    let tutorialButton = new PIXI.Text("How to Play");
    tutorialButton.style = buttonStyle;
    tutorialButton.x = 200;
    tutorialButton.y = sceneHeight-100;
    tutorialButton.interactive = true;
    tutorialButton.buttonMode = true;
    tutorialButton.on("pointerup",displayInstructions); //function reference
    tutorialButton.on("pointerover",e=>e.target.alpha = 0.7); //arrow function
    tutorialButton.on("pointerout",e=>e.currentTarget.alpha = 1.0); //arrow function

    startScene.addChild(tutorialButton);
}

//adds content to the game screen
function createGameLabelsAndButtons(){

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
    scoreLabel.y = 580;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    //make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 150;
    lifeLabel.y = 580;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);
    
    //make the blaster alert system
    alertLabel = new PIXI.Text("==Starblaster Coms System==");
    alertLabel.style = textStyle;
    alertLabel.x = 180;
    alertLabel.y = 520;
    gameScene.addChild(alertLabel);
    
    //make the blaster alert system item
    alertItem = new PIXI.Text("");
    alertItem.style = textStyle;
    alertItem.x = 190;
    alertItem.y = 550;
    gameScene.addChild(alertItem);

}

//adds content to the end game
function createEndLabelsAndButtons(){
    
    //Red Style
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Consolas",
        stroke: 0xFF0000,
        strokeThickness: 6
    });

    //GAME OVER
    let gameOverText = new PIXI.Text(`The Hunger Wins`);
    gameOverText.style = textStyle;
    gameOverText.x = 35;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    //Purpel syle
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30 ,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    })
    
    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 50;
    gameOverScoreLabel.y = sceneHeight/2 + 50;
    gameOverScene.addChild(gameOverScoreLabel);
    
    highScoreLabel = new PIXI.Text();
    highScoreLabel.style = textStyle;
    highScoreLabel.x = 50;
    highScoreLabel.y = sceneHeight/2 + 100;
    gameOverScene.addChild(highScoreLabel);
    
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

//adds content to win scene
function createWinLabelsAndButtons(){
    
    //Red Style
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Consolas",
        stroke: 0xFFFF00,
        strokeThickness: 6
    });

    //GAME OVER
    let winText = new PIXI.Text(`You Saved the Light!`);
    winText.style = textStyle;
    winText.x = 35;
    winText.y = sceneHeight/2 - 160;
    winScene.addChild(winText);

    //Purpel syle
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 30 ,
        fontFamily: "Consolas",
        stroke: 0x9900FF,
        strokeThickness: 4
    })
    
    winScoreLabel = new PIXI.Text();
    winScoreLabel.style = textStyle;
    winScoreLabel.x = 50;
    winScoreLabel.y = sceneHeight/2 + 50;
    winScene.addChild(winScoreLabel);
    
    winHighScoreLabel = new PIXI.Text("You are the best!");
    winHighScoreLabel.style = textStyle;
    winHighScoreLabel.x = 50;
    winHighScoreLabel.y = sceneHeight/2 + 100;
    winScene.addChild(winHighScoreLabel);
    
    //make "play again" button
    let playAgainButton = new PIXI.Text("Remember your journey");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 120;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on("pointerover",e=>e.target.alpha = 0.7);
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0);
    winScene.addChild(playAgainButton);


}

//start game function
function startGame(){
    //sets game scene to visible and turns off all other scenes
    startScene.visible = false;
    instScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    win = false;

    //sets base stats and spawns necessary elements
    levelNum = 1;
    score = 0;
    life = 100;
    hungerSpeed = 50;
    ship.x = 300;
    ship.y = 450;
    circleTimer = 0;
    alertTimer = alertLife;
    levelDifficultly = 60;//One per 60 ticks
    loadLevel();
    
    SpawnLight();

}

//increases player score
function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score   ${score}`;
    
}

//decreases player life
function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life   ${life}%`;
}

//set alert status
function setAlertItem(input){
    
    alertText = input;
    alertTimer = 0;
    
}

//changing alert status through timers
function checkAlertItem(){
//Increase timer
    
    //console.log(circleTimer)
    //console.log("Alert: "+alertTimer)
    //spawn circle
    if(alertTimer < alertLife){
        alertTimer += 1;
        alertItem.text = alertText;   
    }
    else{
        alertItem.text = "...";
    }
}

//spawns a singular hunger particle
function SpawnCircle(){
    createCircles(1);
}

//spawns a light of creation object
function SpawnLight(){
    let c = new LightofCreation();
    c.x = Math.floor(Math.random()*(sceneWidth));
    c.y = -20;
    light = c;
    gameScene.addChild(light);
}

//main game loop
function gameLoop(){
	if (paused) return; // keep this commented out for now
	
	//Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if(dt > 1/12) dt=1/12;
	
    //Screen scrolling
    spriteLoop1.position.y += 3;
    if(spriteLoop1.position.y == sceneHeight){
            spriteLoop1.position.y = -sceneHeight*2
       }
    spriteLoop2.position.y += 3;
    if(spriteLoop2.position.y == sceneHeight){
            spriteLoop2.position.y = -sceneHeight*2
       }
    spriteLoop3.position.y += 3;
    if(spriteLoop3.position.y == sceneHeight){
            spriteLoop3.position.y = -sceneHeight*2
       }
    
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
    light.move(dt);
    if (light.y <= 0){
        light.reflectY();
    }

    // #3 - gyrate Hunger
    for(let h of hunger){
        h.moveInCircle(dt);
    }
	
	//Check for Collisions
	for(let c of circles){
        //circles and ship circle collision detection
        if(c.isAlive && circIntersect(c,ship)){
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            if(!shieldState){
                decreaseLifeBy(20);
            }
            
        }
        //circles and light collision detection
        if((light.isAlive && c.isAlive && circIntersect(c,light)) || (light.isAlive && light.y > sceneHeight)){
            let hAlert = "The Hunger consumed the light!";
            setAlertItem(hAlert);
            hungerSpeed +=10;
            levelDifficultly -= 2;
            if(levelDifficultly <= 2){
                levelDifficultly = 2;
            }
            light.isAlive = false;
        }
        
    }

    //ship and light collision detection
    if(light.isAlive && circIntersect(light,ship)){
        let lAlert = "The IPRE gains the light!";
        setAlertItem(lAlert);
        increaseScoreBy(1);
        recordHighScore(score);
        light.isAlive = false;
    }
    
    //Increase timer
    circleTimer += 1;
    //spawn circle
    if(circleTimer >= levelDifficultly){
        
        SpawnCircle();
        circleTimer = 0;
    }
    
    //set alert system
    checkAlertItem();

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
    if(score == 100){
        win = true;
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
        
        //tints the circles randomly to create a darkened rainbow effect
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
        
        let c = new Circle(10, colorSel,hungerSpeed);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = sceneHeight - 25;
        
        //adds the new circle to the list of circles and the scene
        circles.push(c);
        gameScene.addChild(c);
        
    }
}

//creates the dark cloud at the bottom of the screen
function createHunger(numHunger){
    for(let i=0;i<numHunger;i++){
        let h = new Circle(50, 0x111111);
        h.x = Math.random() * (sceneWidth - 50) + 25;
        h.y = sceneHeight - 5 - i;
        h.angle = i;
        hunger.push(h);
        gameScene.addChild(h);  
    }
}

//loads up the game level
function loadLevel(){
    score = 0;
    createCircles(20);
    createHunger(40);
    backgroundMusic.play();
    createGameLabelsAndButtons();
    increaseScoreBy(0);
    decreaseLifeBy(0);
    paused = false;
}

//loadStorage for high score tracking
function recordHighScore(scoreIn){
    loadHighScore();
    if(scoreIn>highScore){
        let save = localStorage.setItem("--IPRE-SCORE--",scoreIn);
    }
}

//loading high score at the end of the game
function loadHighScore(){
    highScore = localStorage.getItem("--IPRE-SCORE--");
    if(!highScore){
        highScore = 0;
    }
    else{
        highScore = JSON.parse(highScore);
    }
}

//end of game state
function end(){
    paused = true;

    //clear out level
    circles.forEach(c=>gameScene.removeChild(c));
    circles = [];
    
    hunger.forEach(h=>gameScene.removeChild(h));
    hunger = [];
    gameScene.removeChild(light);

    if(win){
         winScene.visible = true;
    }
    
    else{
        gameOverScene.visible = true;
    }
    gameScene.visible = false;
    backgroundMusic.stop();

    gameOverScoreLabel.text = `You saved ${score} Lights of Creation`;
    loadHighScore();
    highScoreLabel.text = `Best cycle: ${highScore}`;
}

