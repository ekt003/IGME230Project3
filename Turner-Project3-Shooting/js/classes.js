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
    constructor(radius, color=0xFF0000, x=0, y=0){
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
    }

    move(dt=1/10){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX(){
        this.fwd.x *= -1;
    }

    reflectY(){
        this.fwd.y *= -1;
    }
}
