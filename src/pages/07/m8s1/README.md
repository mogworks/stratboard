注意使用地图时缩放参数为：getScale(50, 0.78)

然后因为8层地图实在太小，可以参考 waymark_demo.astro 设置canvasClass：

`<StratBoard key="stratboard" canvasClass="h-full w-full" />`

这只会影响显示的大小，不会影响下载图片的大小
