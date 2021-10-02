```
> const { GameNode, Shapes, Colors, ShapeUtils, squish, unsquish } = require('squishjs');
> 
> const redSquare = new GameNode.Shape({
...     fill: Colors.COLORS.RED,
...     coordinates2d: ShapeUtils.rectangle(20, 20, 60, 60),
...     shapeType: Shapes.POLYGON
... });
> 
> const squished = squish(redSquare.node);
> const unsquished = unsquish(squished);
>
> squished
[
   3,  35,  43,   3,   0,
  44,   2,  52,  22,  20,
   0,  20,   0,  80,   0,
  20,   0,  80,   0,  80,
   0,  20,   0,  80,   0,
  20,   0,  20,   0,  53,
   6, 255,   0,   0, 255
]
>
> unsquished
InternalGameNode {
  id: 0,
  children: [],
  color: undefined,
  handleClick: undefined,
  coordinates2d: [
    20, 20, 80,
    20, 80, 80,
    20, 80, 20,
    20
  ],
  border: undefined,
  fill: [ 255, 0, 0, 255 ],
  text: undefined,
  asset: undefined,
  effects: null,
  input: null,
  listeners: Set {},
  playerIds: []
}
```
