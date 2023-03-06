# js_platform_game
A little Javascript-based platform game example, built on a 
game developed at the Hackers and Founders meetup in Maastricht
in March 2023, and designed to be built upon further.

This includes, on top of the basic character movement and
platform collision created on the night:

- Camera (following the player) + parallax background
- Player animations
- Platform images
- Collectable coins
- Painful thorns
- End goal
- A full level layout
- Win / Lose states + resetting the game
- UI
- Timer (for time-attacks)
- A dedicated "render" function

Gameplay:
- Get all of the coins, then find the end goal, without
being hit too many times by the deadly thorns!
- See how quickly you can complete the challenge!

General notes:
- It's designed as a base for you to build and improve upon 
- hopefully it'll be a useful starting point to inspire you
to make something cool! Baddies, moving platforms, time
attacks, bullets, sloped platforms, power ups... the list
goes on!

Code improvements:
- In terms of improving the code, well, let's just say that 
there are lots of opportunities. :D It's been put together 
to Get It To Work, and can surely do with some clean up!
- Should we have a game manager? A level definition? 
How can we better load images? What about a centralised
"item" object that can act as a coin, thorn etc?
- How can we do better with the animations and should we
use a graphics library like Pixi.js?

Lots to consider :D

Anyway, enjoy and please let us know what you come up with!

Cheers,

Pat