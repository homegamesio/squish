Squish is a way to utility package for [Homegames-core](https://github.com/homegamesio/homegames-core) and [Homegames-web](https://github.com/homegamesio/homegames-web). It contains several utilities and the class definitions for the entities most important to running Homegames.

Below the term `First Class` is used to describe several functions and variables. This means those values should be treated as immutable, and in the case of functions are called automatically.

## Exported Features
* squish
* unsquish
* gameNode
* GameNode
* Colors
* Game
* Shapes
* ShapeUtils
* terrainGenerator

## squish
squish is a first class function that is used to compress the information of the game down to a set of integers. This compresses the data required to rendering down.

## unsquish
unsquish is a first class function that is used to uncompress squished entities. This uncompresses the data that was squished down for more easy manipulation and usage.

## gameNode
gameNode is the most foundational component to Homegames. The contents of a game is made up of a set of gameNodes that define entities, and display logic. Wrapped in a listener it contains the following:
* id :- a first calss numeric identification number. It is unique in a Game.
* color :- Defines the display color of the gameNode. See **Colors**
* handleClick :- a function that defines what happens if a user clicks on the gameNode. The function passed in will automatically be called, and will pass the player who clicked as the argument.
* coordinates2d :- an array of coordinates in a two dimensional plane that defines the vertices of the gameNode. It is recommened that **ShapeUtils** is used
* border :- a number that defines the thickness of the border on the gameNode
* fill :- Defines the color that fills the gameNode. See **Colors**
* text :- Defines the text (if any) that will be displayed by the gameNode. It has the form
  * text :- The text to be displayed;
  * x :- The x-position of the top-left corner of the text. This is relative to the entire screen
  * y :- The y-position of the top-left corner of the text. This is relative to the entire screen
  * size :- The font size of the text
  * align :- 'left' | 'center' | 'right'
  * color :- The Color of the text, see **Colors**
* asset :- Defines an asset (image, video, etc) to be displayed by the gameNode. Takes the form:
  * assetInfo :- The information for the display of the asset.
  * onClick :- a function that defines what happens if a user clicks on the asset. The function passed in will automatically be called, and will pass the player who clicked as the argument.
  * coordinates2d :- an array of coordinates in a two dimensional plane that defines the vertices of the gameNode. It is recommened that **ShapeUtils** is used
  * playerIds :- An array of player identification numbers. Defining who can see this asset.
* effects :- Defines any additional effects applied to the gameNode.
* input :- Defines whether the gameNode should accept an input or not. Takes the form:
  * type :- 'text' | 'file'
  * oninput :- A function that will be called with the inputting player's identification number and the data of the input.  (player: number, data: any) => void;
* playerIds :- An array of player identification numbers, that defines which players can see and interact with the gameNode.
* listeners :- The set of listeners attached to the gameNode.
* _animation :- An interval or timeout that can be used to modify the gameNode, such as lightening the color over time to give it a fade in, or darkening the color over time to give it a fade out.
* onStateChange :- A first class function that will notify listeners of a state change.
* addListener :- A first class function that will attach an additional listener to the gameNode.

## GameNode
A helpful wrapper and the recommended way of generatin a gameNode. It gives you the following:
* Asset :- Generates a gameNode with an asset attached to it
  * Example Call: `Asset(onClick: (player) => console.log(player), coordinates2d: [[0, 1], [2, 1], [2, 3], [0, 3], [0, 1]], assetInfo: { myAsset: { pos: { x: 0, y: 1 }, size: {  x: 2, y: 3 }}}, playerIds: [2])`
  * This will generate an asset based on `myAsset` and on clicking on the asset the asset will log out the clicking player.
* Shape :- Generates a generic two dimenstional gameNode
  * Example Call: `Shape({ color: COLORS.CANDY_RED, onClick: (player) => console.log(player), shapeType: Shapes.POLYGON, coordinates2d: [[0, 1], [2, 1], [2, 3], [0, 3], [0, 1]], border: 2, fill: COLORS.CANDY_RED, playerIds: [2], null, null })`
  * This will generate a rectangle of color COLORS.CANDY_RED, visible to player of identification number 2, and onClick will log out the player clicking.
* Text :- Generates a gameNode with text attached to it.
  * Example Call: `Text({ textInfo: { text: "My Text", color: COLORS.CANDY_RED, align: 'center',  x: 2, y: 3, size: 1 }, playerIds: [2] })`
  * This will generate a gameNode with texting starting at the (2, 3) position, visible to player of identification number 2. The Text will be centered and CANDY_RED, and will be "My Text".

## Colors
Colors is a utility for using shared homegames RGBA values. Colors is exported as an object with two keys: COLORS & randomColor.

**COLORS** is an object that takes the form of: `string -> RGBA Array`. For example we can GET the RBGA value for Homegames CANDY_RED (RGBA of [246, 84, 106, 255]) by doing the following `COLORS.CANDY_RED`. Thus COLORS serves as a map between strings and in-built colors.

**randomColor** is a function that takes the form: `string[] => RGBA array`. It is a function to get a random RGBA from the set of RGBA that Homegames provides. It can take in array of strings that limits the options, allowing for the exclusion of certain RGBA values from returning. For example we can call this function like `randomColor(["CANDY_RED"])` which would return an RGBA array from the set of COLORS while preventing CANDY_RED from being a possible return value.


## Game
Game is the base class definition for a game in Homegames. Most games will extend the definition to Game, and leverage most or all of its internal logic. Game holds the following Member Variables:
* players :- Object of the form `player id -> player object`
* timeouts :- Array of NodeJS.Timeout that holds the timeout triggered logic for the Game
* intervals :- Array of NodeJS.Timeout  that holds the interval triggered logic for the Game
* listeners :- the list of all listeners on this Game.
* root :- The base GameNode of this game, for which all other GameNodes are children

Game also holds the following Instance Functions
* _hgAddPlayer :- This is a first class function, and is used to add a player to the Game's `players` value.
* _hgRemovePlayer :- This is a first class function, and is used to remmove a player from the Game's `players` value.
* addStateListener :- This is a first class function, and is used to add a listener to the Game's `listeners` value.
* removeStateListener :- This is a first class function, and is used to remove a listener from the Game's `listeners` value.
* getRoot :- This is a function and returns the Game's `root` value. An example call would be: `getRoot()`. It is expected that this function is overwritten in the extending class's definition.
* setTimeout :- This is a function, and is used to add a timeout to the Game's `timeouts` value. It takes in two arguments a function to be called at the end of the timer, and how long the timer should be. An example call would be: `setTimeout( () => console.log("Welcome to Homegames"), 200)`
* setInterval :- This is a function, and is used to add an interval to the Game's `intervals` value. It takes in two arguments a function to be called at the end of the timer, and how long the timer should be. An example call would be: `intervals(() => console.log("Welcome to Homegames"), 200)`
* close :- This is a first class function, and is used to clear all `timeouts` and `intervals` from the Game, as the Game instance is spun down.

## Shapes
Shapes is functionally an enum of the types of shapes Homegames supports.

## ShapeUtils
ShapeUtils is a utility for building shapes for use in GameNodes. ShapeUtils is exported as an object with two keys rectangle & triangle.

**rectangle** is a function that takes the form `(startX, startY, width, height) => the rectangle's coordinate set`. Thus rectangle creates an array from the starting x position, the starting y position, the width, and the height that defines the vertices of the rectangle. An example call would be: `rectangle(0, 1, 2, 3)` which would create a rectangle with the top-left corner at (0,1), and bottom-right corner at (2, 4).

**triangle** is a function that takes the form `(x1, y1, x2, y2, x3, y3) => the triangle's coordinate set`. Thus triangle creates an array from provided vertex pairings. An example call would be `triangle(0, 1, 2, 3, 4, 5)` which would create a triangle with vertices at (0, 1), (2, 3), (4, 5).

## terrainGenerator
terrainGenerator is a utility function that generates a "board" from the provided information. This "board" functions as a map, defining regions of the board that are randomly marked to be "filled". This can be used to procedurally generate fields of play with parts of the map unaccessible to players. The "board" is guaranteed that all un-filled points are contiguous. An example call would be: `terrainGenerator({ x: 50, y: 100 }, { x: 2, y: 3 }, 5)`. This would generate board of area 50 * 100. The "filled" regions would be of area 2 * 3, and a maximum of 5 such "filled" regions will be placed. The outcome of this would be two-dimensionl area, where each element has the form
```
{
  filled: boolean
  north: boolean
  south: boolean
  east: boolean
  west: boolean
}
```
**filled** of true means this place can be marked as inaccessible to players

**north** of true means from this place a player can move "north".

**south** of true means from this place a player can move "south".

**east** of true means from this place a player can move "east".

**west** of true means from this place a player can move "west".
