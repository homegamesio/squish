# squish

The shared game library for Homegames, published to npm as **`squishjs`**. It provides two things:

1. **The game object model** — `GameNode` (Shape / Text / Asset), `Game`/`ViewableGame` base classes, colors, shape/geometry/view/physics/terrain helpers. Every Homegames game is built out of these.
2. **A compact binary wire protocol** (`squish`/`unsquish`) — conceptually like protobufs: a schema shared by the server ([homegames-core](../homegames-core)) and client ([homegames-client](../homegames-client)) so game state can be streamed efficiently as bytes. `Squisher` is the runtime driver that watches a `Game`, serializes its layers, and produces per-player frames.

Coordinates everywhere are a **0–100 percentage plane** (not pixels). Colors are RGBA byte arrays `[r, g, b, a]`, 0–255.

## Usage

```js
const { squish, unsquish, Colors, GameNode, Shapes, ShapeUtils } = require('squish-142');

const node = new GameNode.Shape({
    shapeType: Shapes.POLYGON,
    fill: Colors.COLORS.RED,
    coordinates2d: ShapeUtils.rectangle(20, 20, 10, 10),
    onClick: (player) => { /* ... */ },
});

const bytes = squish(node);      // flat array of byte values
const round = unsquish(bytes);   // back to a Shape instance
```

## Exports

| Export | What it is |
|---|---|
| `squish(entity, scale?)` / `unsquish(bytes)` | Serialize one node to a flat byte array / back to a node instance |
| `GameNode` | `{ Shape, Text, Asset }` node classes |
| `Game` / `ViewableGame` | Base game classes (state listeners, managed timers, `findNode`; ViewableGame adds a plane + layers) |
| `Squisher` | Watches a game, squishes layers, per-player frames (honoring `playerIds` visibility), asset bundling, per-player audio muting, coalesced flushes |
| `Colors` | ~110 named RGBA colors + `randomColor(exclusionList)` |
| `Shapes` / `subtypes` | Shape type enums (`POLYGON`, `CIRCLE`, `LINE`) |
| `ShapeUtils` | `rectangle(x, y, w, h)`, `triangle(...)` coordinate builders |
| `GeometryUtils` | `checkCollisions` (AABB overlap) |
| `ViewUtils` | `getView` — viewport/camera cropping + translation (crops partially-offscreen assets instead of squashing them) |
| `Physics` | `getPath` — straight-line trajectory clipped to bounds |
| `TerrainGenerator` | Grid maze/terrain generation with guaranteed-reachable key point |
| `Asset` | Asset descriptor + downloader (from `${API_URL}/assets`, cached under the OS app-data dir) |
| `gameNode` | Low-level factory for a raw `InternalGameNode` |

### Node types

- **Shape** — polygon / circle / line. `coordinates2d` (pairs for polygon/line; `[cx, cy, r]` for circle), `fill`, `color`, `border`, `effects.shadow {color, blur}`, `onClick`, `input`, `playerIds`.
- **Text** — `textInfo: {text, x, y, size, align, font, color}`. Full Unicode support.
- **Asset** — images/audio/fonts: `assetInfo: { [assetKey]: { pos, size, startTime?, cropLeft/Top/Right/Bottom? } }`.

`playerIds` scopes a node (and its subtree) to specific players; empty means visible to all. `showFor`/`hideFor` use player id `0` as the invisible sentinel.

## Wire format

`squish()` serializes **one node at a time** — children are not embedded; `Squisher` walks the tree and emits each node as a sibling frame in traversal order.

Top-level frame: `[3, L0, L1, L2, classCode, ...property subframes]` — byte 0 is the magic `3`; bytes 1–3 spill the total length across three bytes; byte 4 is the node class (`Asset=1, Shape=2, Text=3`).

Each property subframe is `[opcode, len0, len1, ...payload]` (two-byte length spill):

| Opcode | Property | Notes |
|---|---|---|
| 42 | `color` | 4 bytes RGBA |
| 43 | `id` | 12 fixed decimal digits |
| 44 | `playerIds` | raw id bytes |
| 47 | `text` | pos/size/color + align/font/text as 3-bytes-per-codepoint (Unicode-safe) |
| 48 | `asset` | 18 fixed bytes (pos, size, startTime, crop values as `[int, frac]` pairs) + asset key |
| 49 | `effects` | shadow only: color + optional blur |
| 50 | `handleClick` | 1 boolean byte — only *whether* a handler exists is sent, never the function |
| 51 | `input` | input type string |
| 52 | `coordinates2d` | each number as `[integer, fractional×100]`; integer clamped to 0–255; depends on `subType` for pairing |
| 53 | `fill` | 4 bytes RGBA |
| 54 | `border` | 1 byte |
| 55 | `subType` | 1 byte (`ASSET=1, TEXT=2, POLYGON=3, CIRCLE=4, LINE=5`) — always written before `coordinates2d` |

Note the two numbering schemes: the top-level **class code** (Asset=1, Shape=2, Text=3) is not the same as the **`subType`** value (Asset=1, Text=2, shapes=3/4/5).

Asset bundles are a separate format produced by `Squisher.initialize()`: per asset, a type byte, a media-type byte (image=1, audio=2, font=3), a 10-byte base-36 length, a 32-byte key, then the raw bytes.

## Versioning

Versions are npm releases of `squishjs` consumed under **aliased names** so multiple versions can coexist in one app: [homegames-common](../homegames-common) declares `"squish-142": "npm:squishjs@1.4.2"`, `"squish-143": "npm:squishjs@1.4.3"` and holds the canonical `squishMap` in `game-loader.js`. Each game pins its version via `metadata().squishVersion`; the platform resolves the matching package per session. This is what keeps old games running on newer Homegames. Consumers get the aliased packages symlinked in by homegames-common's `link-squish.js` postinstall.

There is no version constant in the code itself — `package.json` is the only version source, and releases are commits titled with the version (no git tags).

## Tests

```sh
npm test              # node testRunner.js — discovers test/**/*.test.js
node testRunner.js test/Squisher.test.js
```

A homegrown runner (global `test(name, fn)`). Coverage: squish/unsquish round-trips for every node type (including Unicode text and 255-player lists), scaling, Squisher flush coalescing, per-player frame seeding, audio muting, colors, terrain.

## Known quirks (as of this writing)

- Opcodes 45 (`pos`) and 46 (`size`) are registered but never emitted — `InternalGameNode` has no `pos`/`size` fields (position lives inside the `text`/`asset` payloads). Effectively dead.
- `onHover`/`offHover` are accepted by constructors and stored, but are **not serialized** — hover behavior is handled elsewhere.
- Non-uniform scaling of circles (`scale.x !== scale.y`) is self-flagged in the code as probably broken.
- `package.json` says ISC, but the project is GPL-3.0 (`LICENSE.md` is authoritative).
