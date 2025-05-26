注意因为后半的地图不是中心对称的，使用地图时要设置中心点 anchor

参考 demo.astro：

```ts
const floorTexture = await Assets.load(floor_img)
const floor = Sprite.from(floorTexture)
const centerToNorth = 17.54 * Math.cos(Math.PI / 5) + 8
const centerToSouth = 17.54 + 8
floor.anchor.set(0.5, centerToNorth / (centerToNorth + centerToSouth))
floor.scale.set(getScale())
container.addChild(floor)
```
