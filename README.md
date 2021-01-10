```
> const { GameNode, Shapes, Colors, ShapeUtils, squish, unsquish } = require('squishjs');
> const redSquare = new GameNode.Shape({
     coordinates2d: ShapeUtils.rectangle(40, 40, 20, 20),
     fill: Colors.COLORS.RED,
     shapeType: Shapes.POLYGON
 });
> const squished = squish(redSquare);
> squished
[ 3, 5, 43, 3, 0 ]
```
