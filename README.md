## Squish
This repo contains the game library used by homegames-core and homegames-web to efficiently serialize & deserialize game data. 

## squish/unsquish
This is just serialization/deserialization. Conceptually similar to [protobufs](https://protobuf.dev/), squish contains schema definitions shared by the server and client that lets us transmit game data as efficiently as possible. 

```
const { squish, unsquish, Colors, GameNode, Shapes, ShapeUtils } = require('squish-1006');
const node = new GameNode.Shape({
  shapeType: Shapes.POLYGON,
  fill: Colors.COLORS.RED,
  coordinates2d: ShapeUtils.rectangle(20, 20, 10, 10)
});

const squished = squish(node);
[
  3,           0,            0,            53,
  2,           43,           0,            11,
  [Number: 0], [Number: 0],  [Number: 32], [Number: 61],
  [Number: 3], [Number: 90], [Number: 63], [Number: 44],
  44,          0,            3,            53,
  0,           7,            255,          0,
  0,           255,          55,           0,
  4,           3,            52,           0,
  23,          20,           0,            20,
  0,           30,           0,            20,
  0,           30,           0,            30,
  0,           20,           0,            30,
  0,           20,           0,            20,
  0
]

const unsquished = unsquish(squished);
Shape {
  node: InternalGameNode {
    id: [Number: 326103906344],
    children: [],
    color: undefined,
    handleClick: undefined,
    coordinates2d: [ [Array], [Array], [Array], [Array], [Array] ],
    border: undefined,
    fill: [ 255, 0, 0, 255 ],
    text: undefined,
    asset: undefined,
    effects: null,
    input: null,
    listeners: Set(0) {},
    playerIds: [],
    subType: 3
  },
  id: [Number: 326103906344]
}
```

## Game
## Versioning
