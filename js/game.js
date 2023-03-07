

/************************************************************
 * BASIC JAVASCRIPT PLATFORM GAME
 * 
 * By Pat Scullion (pat@patscullion.co.uk)
 * 
 * This is based on the code that was put together at the 
 * March 2023 Hackers & Founders meetup, and expands upon it
 * to include:
 * 
 * - A dedicated "render" function
 * - Camera (following the player)
 * - More player animations
 * - Platform images
 * - Collectables
 * - Things that hurt
 * - Win / Lose states + resetting the game
 * - UI
 * - Timer (for time-attacks)
 * 
 * The goal:
 * - Get all of the coins, then find the flag!
 * - Avoid the deadly thorns!
 * - See how quickly you can do it!
 * 
 * It's designed as a base for you to build and improve upon 
 * - hopefully it'll be a useful starting point to inspire you 
 * to make something cool! Baddies, moving platforms, time 
 * attacks, bullets, sloped platforms, power ups, sounds... 
 * ...the list goes on!
 * 
 * In terms of improving the code, well, let's just say that 
 * there are lots of opportunities. :D It's been put together 
 * to Get It To Work, and can surely do with some clean up!
 * 
 * Should we have a game manager? A level definition? 
 * How can we better load images? What about a centralised
 * "item" object that can act as a coin, thorn etc?
 * 
 * How can we do better with the animations and should we
 * use a graphics library like Pixi.js?
 * 
 * Lots to consider :D
 * 
 * Anyway, enjoy and please let us know what you come up with!
 * 
 * Cheers,
 * 
 * Pat
 * 
 ************************************************************/



/*****************************************
 * RENDERING SET UP
 ****************************************/

// Set our canvas up
let canvas = document.createElement( "canvas" );
document.body.appendChild( canvas );

canvas.width = 1280;
canvas.height = 720;
canvas.style.background = "#b0ced8";


// Create an instance of our "render" handler. 
// This handles everything from loading images, to the camera, and drawing sprites and text 
let render = new Render();

// Add our background image and UI items
render.addImage( "background" );
render.addImage( "heart" );
render.addImage( "heart-broken" );

// Set our level limits (used to limit the camera, and stop the player falling out of the level bounds)
let levelLimit = {
    left : 0,
    right: 1700,
    top : -1000,
    bottom: 0  
}
// Let our renderer know the level limits for the camera
render.camera.limit = levelLimit;


/*****************************************
 * WORLD SET UP
 ****************************************/

/*
Create our platforms
- Our platforms have the following properties:
  - Position
  - Size
  - Image (scaled to the platform's size)
  - Solidity
*/

const PLATFORM_EMPTY = 0;       // Empty: Player can move through this. Useful for things like flowers / other decorations
const PLATFORM_SOLID = 1;       // A solid block: Player cannot move through this
const PLATFORM_SOLIDDOWN = 2;   // Solid *from the top only*: Player can jump up through this, move side to side through it, but can stand on it
// Feel free to expand these so you can have platforms that are, say, only solid to the left or right...

// Add our platforms
let platforms = [];

// Platforming areas along the floor
platforms.push( new Platform( 150, 520, 200, 50, "platform-200x50", PLATFORM_SOLID ) );
platforms.push( new Platform( 500, 375, 100, 300, "tree-100x300", PLATFORM_SOLID ) );
platforms.push( new Platform( 585, 545, 150, 25, "branch-150x25", PLATFORM_SOLIDDOWN ) );
platforms.push( new Platform( 370, 420, 150, 25, "branch-left-150x25", PLATFORM_SOLIDDOWN ) );
platforms.push( new Platform( 760, 280, 100, 50, "platform-100x50", PLATFORM_SOLID ) );
platforms.push( new Platform( 1050, 280, 100, 50, "platform-100x50", PLATFORM_SOLID ) );
platforms.push( new Platform( 1300, 375, 100, 300, "tree-100x300", PLATFORM_SOLID ) );
platforms.push( new Platform( 1550, 265, 100, 300, "tree-100x300", PLATFORM_SOLID ) );
platforms.push( new Platform( 1535, 405, 105, 117, "flowers", PLATFORM_EMPTY ) );
platforms.push( new Platform( 1550, 500, 200, 200, "platform-200x200", PLATFORM_SOLID ) );

// Little platforms on the right
platforms.push( new Platform( 1575, 100, 50, 50, "platform-50x50", PLATFORM_SOLIDDOWN ) );
platforms.push( new Platform( 1575, -100, 50, 50, "platform-50x50", PLATFORM_SOLIDDOWN ) );
platforms.push( new Platform( 1575, -300, 50, 50, "platform-50x50", PLATFORM_SOLIDDOWN ) );
platforms.push( new Platform( 1575, -500, 50, 50, "platform-50x50", PLATFORM_SOLIDDOWN ) );

// Logs and platforms at the top
platforms.push( new Platform( 0, -600, 200, 50, "platform-200x50", PLATFORM_SOLID ) );
platforms.push( new Platform( 175, -650, 500, 50, "log-500x50", PLATFORM_SOLID ) );
platforms.push( new Platform( 650, -600, 200, 50, "platform-200x50", PLATFORM_SOLID ) );
platforms.push( new Platform( 825, -650, 500, 50, "log-500x50", PLATFORM_SOLID ) );
platforms.push( new Platform( 1300, -600, 200, 50, "platform-200x50", PLATFORM_SOLID ) );

// Base floors
platforms.push( new Platform( -10, 675, 1305, 50, "floor-1305x50", PLATFORM_SOLID ) );
platforms.push( new Platform( 1295, 675, 1305, 50, "floor-1305x50", PLATFORM_SOLID ) );


// Create our player
let player = new Player(100, 640, false);

// Create our coins
let coinsGot = 0;
let coins = [];
coins.push( new Coin( 180, 450 ) );
coins.push( new Coin( 275, 450 ) );
coins.push( new Coin( 630, 595 ) );
coins.push( new Coin( 790, 200 ) );
coins.push( new Coin( 1080, 200 ) );

coins.push( new Coin( 1580, 40 ) );
coins.push( new Coin( 1580, -160 ) );
coins.push( new Coin( 1580, -360 ) );
coins.push( new Coin( 1580, -560 ) );


coins.push( new Coin( 300, -730 ) );
coins.push( new Coin( 500, -730 ) );
coins.push( new Coin( 990, -730 ) );
coins.push( new Coin( 1120, -730 ) );

// Create our painful items
let thorns = [];
thorns.push( new Thorns( 850, 640 ) );
thorns.push( new Thorns( 950, 640 ) );
thorns.push( new Thorns( 1050, 640 ) );
thorns.push( new Thorns( 1150, 640 ) );
thorns.push( new Thorns( 1250, 640 ) );
thorns.push( new Thorns( 1350, 640 ) );
thorns.push( new Thorns( 1450, 640 ) );
thorns.push( new Thorns( 1630, 460 ) );

thorns.push( new Thorns( 175, -690 ) );
thorns.push( new Thorns( 370, -690 ) );
thorns.push( new Thorns( 570, -690 ) );

thorns.push( new Thorns( 820, -690 ) );
thorns.push( new Thorns( 1220, -690 ) );

// Create our end goal(s)
let goals = [];
goals.push( new Goal( 50, -850 ) );


/*****************************************
 * KEY PRESS HANDLING
 ****************************************/

// Handle our key presses, which we use to move our player
// We allow multiple keys to perform an action, 
// e.g. w, space and up arrow = jump
let keyPressed = {
    left : false,
    right : false,
    jump : false
};

document.addEventListener("keydown", function(e) {

    switch (e.key.toLowerCase()) {
        case "w":
        case " ":
        case "arrowup":
            keyPressed.jump = true;
            break;
        case "a":
        case "arrowleft":
            keyPressed.left = true;
            break;
        case "d":
        case "arrowright":
            keyPressed.right = true;
            break;
    }

});

document.addEventListener("keyup", function(e) {

    switch (e.key.toLowerCase()) {
        case "w":
        case " ":
        case "arrowup":
            keyPressed.jump = false;
            break;
        case "a":
        case "arrowleft":
            keyPressed.left = false;
            break;
        case "d":
        case "arrowright":
            keyPressed.right = false;
            break;
    }

});


/*****************************************
 * GAME LOOP
 ****************************************/

// Define our game states
const GAME_RESTART = 1;
const GAME_PLAYING = 2;
const GAME_WON_ENTER = 3;
const GAME_WON = 4;
const GAME_LOST_ENTER = 5;
const GAME_LOST = 6;

let gameState = GAME_RESTART;
let gameStartTime;
let gameSeconds = 0;

// START OUR GAME!
let gameInterval = setInterval(gameLoop, 1000 / 60); // Force a 60fps speed. 
                                                     // You can redo this to use requestAnimationFrame() if you fancy!

function gameLoop() {

    // MOVE / UPDATE

    switch (gameState) {

        case GAME_RESTART:

            // Reset our player
            player.reset();

            // Reset our coins
            coinsGot = 0;
            for (let i = 0; i < coins.length; i++) coins[i].reset();

            // Clear our jump button status so we 
            // don't immediately jump on restarting the game!
            keyPressed.jump = false; 

            gameStartTime = new Date();

            gameState = GAME_PLAYING;

            break;

        case GAME_PLAYING:

            // Move our player
            player.move();

            // Collide our player with platforms
            player.checkForPlatforms();

            // Interact our player with items
            player.checkForItems();

            // Follow our player with the camera
            render.moveCameraTo(player.x, player.y);

            let gameCurrentTime = new Date();

            // Get our time elapsed, and round it down to 0.1 second intervals
            gameSeconds = ( (gameCurrentTime - gameStartTime) / 1000 ).toFixed(1);

            break;

        case GAME_WON_ENTER:
            
            // Clear our jump button status so, if 
            // we were jumping when we won, we don't 
            // immediately restart the game!
            keyPressed.jump = false;    
            
            // And set our game state to GAME_WON
            gameState = GAME_WON;       

            // DON'T break here - just fall straight 
            // into the GAME_WON condition

        case GAME_WON:

            if (keyPressed.jump) {
                // Restart the game!
                gameState = GAME_RESTART;
            }

            break;

        case GAME_LOST_ENTER:
            
            keyPressed.jump = false;    
            
            // And set our game state to GAME_LOST
            gameState = GAME_LOST;       

            // DON'T break here - just fall straight 
            // into the GAME_LOST condition

        case GAME_LOST:

            if (keyPressed.jump) {
                // Restart the game!
                gameState = GAME_RESTART;
            }

            break;

    }


    // DRAW

    // Redraw our background
    render.clear();
    render.background("background", 0, 0, canvas.width * 1.25, canvas.height, 0.25);

    // Draw our platforms
    for (let i = 0; i < platforms.length; i++) platforms[i].draw();

    // Draw our coins
    for (let i = 0; i < coins.length; i++) coins[i].draw();

    // Draw our thorns
    for (let i = 0; i < thorns.length; i++) thorns[i].draw();

    // Draw our goals
    for (let i = 0; i < goals.length; i++) goals[i].draw();

    // Draw our player
    player.draw();

    // Draw our UI
    render.ui();


    switch (gameState) {
        case GAME_PLAYING:
            break;

        case GAME_WON:

            render.rect( 0, 0, canvas.width, canvas.height, "rgba(0,0,0,0.5)" );
            render.rect( canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2, "rgba(50,200,50,1)" );
            render.text( "YOU WON!", canvas.width / 2, (canvas.height / 2) - 80, 80, "white", "center" );

            render.text( "You did it in " + gameSeconds + " seconds!", canvas.width / 2, (canvas.height / 2) + 20, 40, "white", "center");
            render.text( "Press jump to play again", canvas.width / 2, (canvas.height / 2) + 150, 45, "white", "center");

            // Draw our player
            player.draw();

            break;

        case GAME_LOST:

            render.rect( 0, 0, canvas.width, canvas.height, "rgba(0,0,0,0.5)");
            render.rect( canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2, "rgba(200,50,50,1)");
            render.text( "YOU LOST!", canvas.width / 2, (canvas.height / 2) - 80, 80, "white", "center");
            render.text( "Better luck next time!", canvas.width / 2, (canvas.height / 2) + 20, 40, "white", "center");
            render.text( "Press jump to try again", canvas.width / 2, (canvas.height / 2) + 150, 45, "white", "center");

            // Draw our player
            player.draw();

            break;
    }

}



/*****************************************
 * RENDERER
 ****************************************/
// This function handles drawing things to our canvas - sprites, boxes, text - and
//  considers the camera position.
// We use it also to handle loading of images

function Render() {

    this.images = {};

    this.camera = {
        x : 0,
        y : 0,
        limit : {
            top : -1000,
            bottom: 0,
            left : 0,
            right: 10000
        }
    };

    // Create our "context", which is what how we draw on the canvas
    this.c = canvas.getContext('2d');

    // Move our camera to the specified position (less half of the width/height of the canvas)
    this.moveCameraTo = function(x, y) {
        // Set our camera position
        this.camera.x = x - (canvas.width / 2);
        this.camera.y = y - (canvas.height / 2);

        // Limit our camera position so it doesn't go "out of bounds"
        if (this.camera.x < this.camera.limit.left) this.camera.x = this.camera.limit.left;
        if (this.camera.x > this.camera.limit.right - canvas.width) this.camera.x = this.camera.limit.right - canvas.width;
        if (this.camera.y < this.camera.limit.top) this.camera.y = this.camera.limit.top;
        if (this.camera.y > this.camera.limit.bottom) this.camera.y = this.camera.limit.bottom;
    }

    // Create a clear rectangle (this wipes out anything within
    // its bounds on the canvas - we use it to "clear screen")
    this.clear = function() {
        this.c.clearRect(0,0, canvas.width, canvas.height);
    }

    // Draw an image, based on camera position
    // This handles drawing it backwards if needed
    this.sprite = function(image, x, y, width, height, flipped) {
        if (flipped) {

            // To draw a flipped image, we have to temporarily "flip" the canvas so its
            // "x scale" is -1 (reversed). We then draw our player, and then flip the canvas back

            this.c.save(); // Save the current canvas scale
            this.c.scale( -1, 1 ); // Flip the canvas
            this.c.drawImage(
                this.image( image ), 
                -( width + x - this.camera.x ), 
                y - this.camera.y, 
                width, 
                height
            );
            this.c.restore(); // Restore our canvas scale back to normal
        } else {
            this.c.drawImage(
                this.image( image ), 
                x - this.camera.x, 
                y - this.camera.y, 
                width, 
                height
            );
        }
    }

    // Draw an image, fixed on camera (regardless of camera position)
    // This is used for UI elements - lives, coins, etc.
    this.spriteFixed = function(image, x, y, width, height) {
        this.c.drawImage(
            this.image( image ), 
            x , 
            y, 
            width, 
            height
        );
    }

    // Draw our background, applying a parallax to simulate distance based on camera position
    this.background = function(image, x, y, width, height, parallax) {
        this.c.drawImage(
            this.image( image ), 
            x - (this.camera.x * parallax), 
            y - (this.camera.y * parallax), 
            width, 
            height
        );
    }

    this.rect = function(x, y, width, height, color) {
        this.c.fillStyle = color;
        this.c.fillRect( x, y, width, height );
    }

    this.ui = function() {
        // Draw our UI

        // Coins collected
        this.spriteFixed( "coin1", 20, 20, 40, 40);
        this.text( coinsGot + " / " + coins.length, 75, 55, 40, "white", "left" );

        // Lives
        for (i = 1; i <= player.maxLives; i++) {
            let sprite = (player.lives >= i ? "heart" : "heart-broken");
            this.spriteFixed( sprite, canvas.width - 25 - (i * 50), 25, 40, 40 );
        }

        // Current play time
        this.text( gameSeconds, canvas.width / 2, 55, 40, "white", "center");
    }

    this.text = function(text, x, y, size, color, align) {
        this.c.font = size + "px Paytone One";
        this.c.fillStyle = color;
        this.c.textAlign = align;
        this.c.fillText( text, x, y );
    }

    // Add an image element and add it to our array of available images 
    this.addImage = function(name) {
        if (!this.images[name]) { // Only add it if it's a unique name
            this.images[name] = new Image();
            this.images[name].src = "images/" + name + ".png";    
        }
    }

    // Get an image
    this.image = function(name) {
        if (!this.images[name]) {
            // Not found!
            // Do something nice here... for now we just moan about it to the console.
            console.log( "Image not found: " + name );
        }
        return this.images[name];
    }

}


/*****************************************
 * PLAYER
 ****************************************/
// We've split the movement / collision checks into separate functions, added a function 
// to check for objects (coins, thorns etc) and react to them. We've also added animations,
// sprite direction, getting hurt & recovering, winning / losing and more!

function Player(x, y, facingLeft) {

    // Size / position
    this.x = x;
    this.y = y;
    this.facingLeft = facingLeft;
    this.width = 40;
    this.height = 64;

    // Initial size / position (used for when we reset the level / put our player back to the start)
    this.initial = {
        x : x,
        y : y,
        facingLeft : facingLeft
    }

    // X speed and (de)acceleration
    this.speed = 0;
    this.speedMax = 7;
    this.acceleration = 0.75;
    this.decceleration = 1;

    // Y speed and jump status
    this.jumpSpeed = 0;
    this.jumpSpeedMax = 10;
    this.gravity = 0.5;
    this.jumping = false;
    this.jumpBoostRemaining = 10; // Jump boost alows

    // "Hurt" status
    this.hurt = false;
    this.recovering = false;
    this.recoveryCyclesRemaining = 0;

    // Lives
    this.maxLives = 3;
    this.lives = this.maxLives;
    this.dead = false;
    this.won = false;

    // Images
    // NOTE: Each one of the images are arrays so we can have animations!
    this.images = {
        standing : ["player-stand"],
        jump : ["player-jump"],
        fall : ["player-fall"],
        walk : ["player-walk-1", "player-walk-2", "player-walk-3", "player-walk-4"],
        hurt : ["player-hurt"],
        win : ["player-win"],
        dead : ["player-dead"],
    }
    // Keep track of our current image, and current frame of animation
    this.currentImage = "player-stand";
    this.currentImageFrame = 0;

    // Add our images to our renderer
    render.addImage( "player-stand" );
    render.addImage( "player-jump" );
    render.addImage( "player-fall" );
    render.addImage( "player-walk-1" );
    render.addImage( "player-walk-2" );
    render.addImage( "player-walk-3" );
    render.addImage( "player-walk-4" );
    render.addImage( "player-hurt" );
    render.addImage( "player-win" );
    render.addImage( "player-dead" );

    this.move = function() {
        // MOVEMENT

        // Only take player input (or slow down left/right) if we're not bouncing back in our "hurt" pose
        // This allows that classic platformer trope of "bouncing back when hurt on something"
        if (!this.hurt) {

            // KEYBOARD INPUT

            // Update speed according to player input
            if (keyPressed.left) {
                this.speed -= this.acceleration; // Shorthand for: this.speed = this.speed - this.acceleration;
            }
            if (keyPressed.right) {
                this.speed += this.acceleration;
            }
            
            // Slow down left and right  - if we're not pressing left OR right
            if (!keyPressed.left && !keyPressed.right) {

                if (this.speed > this.decceleration) {

                    // We're moving to the right, faster than the amount we want to slow down
                    // Subtract our decelleration from our speed
                    this.speed = this.speed - this.decceleration;

                } else if (this.speed < -this.decceleration) {

                    // We're moving to the left, faster than the amount we want to slow down
                    // Add our decelleration from our speed (our speed is negative, as we're moving left)
                    this.speed = this.speed + this.decceleration;

                } else {

                    // The amount we want to decellerate is larger than our speed - if we applied it, we'd end up moving the other way...
                    // ...so, just stop.
                    this.speed = 0;

                }
            }

            if (keyPressed.jump) {

                // We are pressing the jump key...
                if (!this.jumping) {
                    // ...and we're not jumping.

                    // Start jumping!
                    this.jump();

                } else if (this.jumpBoostRemaining > 0) {

                    // ...and we're jumping, but still have some "boost" left!
                    this.jumpBoost();

                }

            } else {

                // We're not pressing jump - stop any jump boosting
                this.jumpBoostRemaining = 0;

            }
        }

        // Prevent our speed from getting out of hand!
        if (this.speed < -this.speedMax) this.speed = -this.speedMax;
        if (this.speed > this.speedMax) this.speed = this.speedMax;

        // Apply gravity, if we're jumping
        if (this.jumping) {
            this.jumpSpeed += this.gravity;
        }

        // Move our player!
        this.x += this.speed;
        this.y += this.jumpSpeed;

        // Keep our player within level limits
        if (this.x < levelLimit.left) this.x = levelLimit.left;
        if (this.x + this.width > levelLimit.right) this.x = levelLimit.right - this.width;
    }

    this.checkForPlatforms = function() {
        // PLATFORM COLLISION
        // NOTE: we now tell the platform which direction of movement we want to check, 
        //       as some platforms aren't solid in all directions... yep, we have 
        //       platforms you can jump up through, and then stand on! You could expand
        //       this to have walls that are solid to the left only, for example, or 
        //       platforms you could fall down into but then not get back up from (for
        //       a tunnel trap or similar)

        // Check for walls in the direction we're moving...
        if (this.speed > 0) {

            // We're moving right - check to the right!
            for (let i = 0; i < platforms.length; i++) {

                if ( 
                    platforms[i].hit( this.x + this.width, this.y + (this.height / 2), "right" ) 
                ) {
                    // We've hit a wall!
                    this.speed = 0;
                    this.x = platforms[i].x - this.width - 1;
                }

            }

        } else if (this.speed < 0) {

            // We're moving left - check to the left!
            for (let i = 0; i < platforms.length; i++) {

                if ( 
                    platforms[i].hit( this.x, this.y + (this.height / 2), "left" ) 
                ) {
                    // We've hit a wall!
                    this.speed = 0;
                    this.x = platforms[i].x + platforms[i].width + 1;
                }

            }

        }

        // When checking our above/below position, we should check a little inside us
        // so our image doesn't look like it's "floating" off the edge of platforms
        let innerLeft = this.x + (this.width / 5);
        let innerRight = this.x + this.width - (this.width / 5);

        // Are we jumping (or falling)?
        if (this.jumping) {

            // Yes!
            if (this.jumpSpeed >= 0) {

                // ...We're falling - check for platforms below us
                for (let i = 0; i < platforms.length; i++) {

                    if ( 
                        platforms[i].hit( innerLeft, this.y + this.height, "down" ) ||
                        platforms[i].hit( innerRight, this.y + this.height, "down" ) 
                    ) {
                        // We've hit the platform!
                        this.land();
                        this.y = platforms[i].y - this.height;
                    }

                }

            }  else {

                // ...We're jumping up - check for ceilings above us
                for (let i = 0; i < platforms.length; i++) {

                    if ( 
                        platforms[i].hit( innerLeft, this.y, "up" ) ||
                        platforms[i].hit( innerRight, this.y, "up" ) 
                    ) {
                        // We've hit the platform!
                        this.jumpSpeed = 0;
                        // Move to the top of the hit platform
                        this.y = platforms[i].y + platforms[i].height;
                    }

                }

            }

        } else {

            // No. We're standing on a platform

            // Check that there is still a platform under us - otherwise: FALL!
            // NOTE: On the game night this was a bit wrong in that we would say that we were falling
            // unless EVERY SINGLE PLATFORM was under us at the same time! D'oh! 
            // Now we correctly check, and say that we're only falling if there are NO platforms under us

            let platformBelowMe = false;

            for (let i = 0; i < platforms.length; i++) {

                if ( 
                    platforms[i].hit( innerLeft, this.y + this.height, "down" ) ||
                    platforms[i].hit( innerRight, this.y + this.height, "down" ) 
                ) {
                    // We hit this platform. Make sure we're still at the top of this platform 
                    // (in case we walk sideways and hit a slightly higher platform)
                    this.y = platforms[i].y - this.height;
                    platformBelowMe = true;
                }

            }

            // If we didn't find any platforms below us, start falling!
            if (!platformBelowMe) {
                this.jumping = true;
                this.jumpSpeed = 0;
            }

        }
    }

    this.checkForItems = function() {
        // NOTE: When checking for items, we check from the *middle* of our player's position
        //       for simplicity, so we're not checking several times per object

        let middle = {
            x : this.x + (this.width / 2),
            y : this.y + (this.height / 2)
        }

        // Check for coins!
        for (let i = 0; i < coins.length; i++) {
            if (coins[i].hit( middle.x, middle.y )) {
                // Hooray!
            }
        }

        // Check for thorns!
        for (let i = 0; i < thorns.length; i++) {

            if ( thorns[i].hit( middle.x, middle.y ) ) {
                // Eek! We got hurt!
                // Only get hurt if we're NOT:
                // - Falling back from being hurt
                // - Recovering
                if (!this.hurt && !this.recovering) {
                    this.getHurt();
                }
                break;
            }

        }

        // Check for goals!
        for (let i = 0; i < goals.length; i++) {

            if ( goals[i].hit( middle.x, middle.y ) ) {
                // Yay! It's the end! Do we have all our coins?
                if (coinsGot == coins.length) {
                    // Yes! Yay! Game win!
                    this.win();
                }
                break;
            }

        }

        if (this.recovering) this.keepRecovering();
    }

    this.jump = function() {
        // Jump!
        this.jumpSpeed = -this.jumpSpeedMax;
        this.jumping = true;
        this.jumpBoostRemaining = 10;
    }

    this.jumpBoost = function() {
        // Keep our upwards jump speed to the max!
        this.jumpSpeed = -this.jumpSpeedMax;

        // And reduce our remaining jump boost
        this.jumpBoostRemaining--;
    }

    this.fall = function() {
        // Start falling!
        this.jumpSpeed = 0;
        this.jumping = true;
        this.jumpBoostCyclesRemaining = 0;
    }

    this.land = function() {
        // Land on a platform!
        this.jumping = false;
        this.jumpSpeed = 0;

        // If we're hurt, recover as we've hit the ground!
        if (this.hurt) this.startRecovering();
    }

    this.getHurt = function() {
        // Ouch! We've been hurt!
        this.hurt = true;

        // "jump" (but don't let us boost the jump) 
        // up from the thing that hurt!
        this.jumping = true;
        this.jumpBoostCyclesRemaining = 0;
        this.jumpSpeed = -this.jumpSpeedMax;

        // Bounce back in the opposite direction that we
        // were facing, away from the thing that hurt!
        if (this.facingLeft) {
            this.speed = this.speedMax / 2;
        } else {
            this.speed = -this.speedMax / 2;
        }

        // Reduce our lives
        this.lives--;
        if (this.lives <= 0) { 
            this.die();
        }
    }

    this.startRecovering = function() {
        this.hurt = false;
        this.recovering = true;
        this.recoveryCyclesRemaining = 60;
        this.speed = 0;
        this.facingLeft = !this.facingLeft;
    }

    this.keepRecovering = function() {
        this.recoveryCyclesRemaining--;
        if (this.recoveryCyclesRemaining <= 0) this.stopRecovering();
    }

    this.stopRecovering = function() {
        this.recovering = false
    }

    this.die = function() {
        this.dead = true;
        gameState = GAME_LOST_ENTER;
    }

    this.win = function() {
        this.won = true;
        gameState = GAME_WON_ENTER;
    }

    this.draw = function() {
        // Update our image based on our player's state!
        if (this.dead) {
        
            // We're dead!
            this.currentImage = "dead";
            this.currentImageFrame = 0;
        
        } else if (this.won) {

            // We won!
            this.currentImage = "win";
            this.currentImageFrame = 0;
        
        } else if (this.hurt) {

            // We're hurt!
            this.currentImage = "hurt";
            this.currentImageFrame = 0;

        } else if (this.jumping && this.jumpSpeed <= 0) {

            // We're jumping up
            this.currentImage = "jump";
            this.currentImageFrame = 0;

        } else if (this.jumping && this.jumpSpeed > 0) {

            // We're falling
            this.currentImage = "fall";
            this.currentImageFrame = 0;

        } else if (this.speed < -0.1 || this.speed > 0.1) {

            // We're moving left or right (with a speed of more than 0.1)
            this.currentImage = "walk";

            // Handle our animation frames!

            // NOTE: There are nicer ways to do this next bit. That said, this works, and sometimes that's enough :D

            // Slowly move through our frames - we don't need to increment 
            // it by 1 each time (as that'd be much too fast), so we can 
            // increment it by a fractional amount...
            this.currentImageFrame += 0.25;

            // If the "floor" (the integer value without the fractional 
            // component - e.g. 4.66's floor is 4) of the current frame 
            // is greater than the amount of frames we've got, loop back 
            // to the first frame! 
            if ( Math.floor( this.currentImageFrame ) >= this.images["walk"].length ) {
                this.currentImageFrame = 0;
            }

        } else {
            this.currentImage = "standing";
            this.currentImageFrame = 0;
        }

        // Work out the frame that we're in (e.g. if our currentImageFrame is 2.844, our frame is 2)
        let frameFloored = Math.floor( this.currentImageFrame );

        // Get the sprite and its current frame
        let sprite = this.images[this.currentImage][frameFloored];

        // Set our player's sprite direction (so we look left when moving left)
        if (this.speed > 0) this.facingLeft = false;
        if (this.speed < 0) this.facingLeft = true;


        // If we're "recovering", only draw our player every other loop - to give that 'flickering'
        // look whilst we're invulnerable / recovering 
        if (this.recovering && (this.recoveryCyclesRemaining % 2 == 0)) return;

        // Draw our player!
        render.sprite( sprite, this.x, this.y, this.width, this.height, this.facingLeft );
    }

    this.reset = function() {
        this.lives = this.maxLives;
        this.dead = false;
        this.won = false;

        this.x = this.initial.x;
        this.y = this.initial.y;
        this.facingLeft = this.initial.facingLeft;

        this.hurt = false;
        this.recovering = false;
        this.jumping = 0;
        this.speed = 0;
        this.jumpSpeed = 0;
    }
}


function Platform(x, y, width, height, image, type) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    this.type = type;
    /*
    Type options:
    PLATFORM_EMPTY = 0;       // Empty: Player can move through this. Useful for things like flowers / other decorations
    PLATFORM_SOLID = 1;       // A solid block: Player cannot move through this
    PLATFORM_SOLIDDOWN = 2;   // Solid *from the top only*: Player can jump up through this, move side to side through it, but can stand on it
    */

    // Add our image to the renderer
    render.addImage( this.image );

    this.draw = function() {
        render.sprite( this.image, this.x, this.y, this.width, this.height );
    }

    this.hit = function(x, y, direction) {
        // First, check if we're solid in the direction specified
        if (this.type == PLATFORM_EMPTY) {
            // We're never solid
            return false;

        } else if (this.type == PLATFORM_SOLIDDOWN && direction != "down") {
            // We're only solid in the down direction
            return false;

        } else {
            // We're solid in the direction being checked. Let's see if it's a hit
            if (
                this.x <= x && 
                this.x + this.width >= x &&
                this.y <= y && 
                this.y + this.height >= y 
            ) {
                // We've got a hit!
                return true;
            }

            // No hit
            return false;
        }
    }

}


function Coin(x, y) {

    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.collecting = false;
    this.collected = false;
    this.images = {
        spinning : ["coin1", "coin2", "coin3", "coin4"],
        got : ["coin-got1", "coin-got2", "coin-got3", "coin-got4"],
    };

    render.addImage( "coin1" );
    render.addImage( "coin2" );
    render.addImage( "coin3" );
    render.addImage( "coin4" );
    render.addImage( "coin-got1" );
    render.addImage( "coin-got2" );
    render.addImage( "coin-got3" );
    render.addImage( "coin-got4" );

    this.currentImage = "spinning";
    this.currentImageFrame = 0;

    this.update = function() {
    }

    this.draw = function() {

        if (this.collected) return;

        if (this.collecting) {
            this.currentImage = "got";
            this.currentImageFrame += 0.125;
            if ( Math.floor( this.currentImageFrame) >= this.images["spinning"].length ) {
                this.currentImageFrame = this.images["spinning"].length - 1;
                this.collected = true;
            }
        } else {
            this.currentImage = "spinning";
            this.currentImageFrame += 0.175;
            if ( Math.floor( this.currentImageFrame ) >= this.images["spinning"].length ) {
                this.currentImageFrame = 0;
            }
        }

        // Work out the frame that we're in (e.g. if our currentImageFrame is 2.844, our frame is 2)
        let frameFloored = Math.floor( this.currentImageFrame );

        // Get the sprite and its current frame
        let sprite = this.images[this.currentImage][frameFloored];

        // Draw the sprite!
        render.sprite( sprite, this.x, this.y, this.width, this.height );
    }

    this.hit = function(x, y) {
        if (this.collecting || this.collected) return false;

        // Give a generous hit box
        if (
            this.x - (this.width * 0.5) <= x && 
            this.x + (this.width * 1.5) >= x &&
            this.y - (this.height * 0.5) <= y && 
            this.y + (this.height * 1.5) >= y
        ) {
            // We've got a hit!
            this.collect();
            return true;
        }
        return false;
    }

    this.collect = function() {
        this.collecting = true;
        this.currentImageFrame = 0;
        coinsGot++;
    }

    this.reset = function() {
        this.collected = false;
        this.collecting = false;
    }

}


function Thorns(x, y) {

    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 40;
    this.image = "thorns-100x50";

    render.addImage( this.image );

    this.update = function() {
    }

    this.draw = function() {
        render.sprite( this.image, this.x, this.y, this.width, this.height );
    }

    this.hit = function(x, y) {

        if (
            this.x <= x && 
            this.x + this.width >= x &&
            this.y <= y && 
            this.y + this.height >= y 
        ) {
            // We've got a hit!
            return true;
        }
        return false;
    }

    this.reset = function() {
    }

}


function Goal(x, y) {

    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 256;

    this.image = "flag";

    render.addImage( this.image );

    this.update = function() {
    }

    this.draw = function() {
        render.sprite( this.image, this.x, this.y, this.width, this.height );
    }

    this.hit = function(x, y) {

        if (
            this.x <= x && 
            this.x + 10 >= x && // We're only going to check on the thin flag pole, not the whole sprite
            this.y <= y && 
            this.y + this.height >= y 
        ) {
            // We've got a hit!
            return true;
        }
        return false;
    }

    this.reset = function() {
    }

}