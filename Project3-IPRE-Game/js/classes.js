
class Ship extends PIXI.Sprite{
    constructor(x=0,y=0){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(.5,.5); //set center of the sprite
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}

class Circle extends PIXI.Graphics{
    constructor(radius, color=0xFF0000, x=0, y=0,angle=0.0){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        

        //variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
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
    moveInCircleRev(dt=1/10){
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

class LightofCreation extends PIXI.Graphics{
    constructor(radius, x=0, y=0,angle=0.0){
        super();
        this.beginFill(0xFFFFFF);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;

        //variables
        this.isAlive = true;

    }

    move(dt=1/60){
        this.y -= 2*dt;
    }
    reflectY(){
        this.fwd.y *= -1;
    }
    
}
