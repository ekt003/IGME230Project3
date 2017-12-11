
class Ship extends PIXI.Sprite{
    constructor(x=0,y=0){
        super(PIXI.loader.resources["images/Starblaster.png"].texture);
        this.anchor.set(.5,.5); //set center of the sprite
        this.scale.set(0.125);
        this.x = x;
        this.y = y;
    }
}

class Circle extends PIXI.Graphics{
    constructor(radius, color=0xFF0000, speed=50, x=0, y=0,angle=0.0){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        

        //variables
        this.fwd = getRandomUnitVectorUp();
        this.speed = speed;
        this.isAlive = true;
        this.angle = angle;
    }

    move(dt=1/10){
        //this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
    moveInCircle(dt=1/60){
        this.angle += 0.1;
        this.x += (Math.cos(this.angle) * 1) * this.speed * dt;
        this.y += (Math.sin(this.angle) * 1) * this.speed * dt;
    }
    moveInCircleRev(dt=1/60){
        this.angle -= 0.1;
        this.x -= (Math.cos(this.angle) * 1) * this.speed * dt;
        this.y -= (Math.sin(this.angle) * 1) * this.speed * dt;
    }

//    reflectX(){
//        this.fwd.x *= -1;
//    }
//
    reflectY(){
        this.fwd.y *= -1;
    }
}

//class for the Light of Creation object
class LightofCreation extends PIXI.Sprite{
    constructor(x=0,y=0,speed=50){
        super(PIXI.loader.resources["images/light.png"].texture);
        this.anchor.set(.5,.5); //set center of the sprite
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
    
    //variables
        this.fwd = getRandomUnitVectorDown();
        this.speed = speed;

        this.isAlive = true;

    }

    move(dt=1/60){
        this.y += 60*dt;//*this.fwd;
    }
    
    reflectY(){
        this.fwd.y *= -1;
    }
}
