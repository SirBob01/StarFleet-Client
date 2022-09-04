# StarFleet-Client

Client-side endpoint for StarFleet games

# Gameplay

This is a very barebones RTS game. The player controls a fleet of ships whose goal is to dominate a sector of space.

## Core Gameplay Loop

1. Players start off with an initial scout ship with very limited capabilities
2. Over the course of the game, players must find planets and capture them
3. Players can gather resources on the planets
4. Using these resources, players can build more ships (with associated costs per ship type)
5. Player wins when all other players have no more ships or all planets have been captured

## Additional Mechanics

- Players can plant cloaking devices to set traps for the enemy
- Players can mine for resources from asteroids temporarily

# Controls

- Click on a ship and its micromanage button to control it directly
- Select multiple ships by dragging over using the selection box
- Right click to move, attack, and capture, the ships will automatically destroy nearby enemy ships if in range