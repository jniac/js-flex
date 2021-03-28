# js-flex

resolving "kind-of-flex" model in javascript

[online demo / test](https://jniac.github.io/js-flex/test/html/)

features: 
- 1D (default) or 2D space
- include "gutter" style prop (actually missing in the current flexbox model)
- "fill" / "fit" / and a lot of size options (%, op, ...)

![2D-StressTest](https://user-images.githubusercontent.com/11039919/112748031-7a639380-8fb9-11eb-9fff-7a03714fdc33.png)
![1D-StressTest](https://user-images.githubusercontent.com/11039919/112748034-7d5e8400-8fb9-11eb-9455-372579b23810.png)


## start developing
Watch changes on ./src (chokidar), build on changes (rollup), test build (mocha giveup, using custom lib).
```
npm start
```

## or simply test
```
npm test
```

## visual test

### local:
Need to serve the whole folder over http. Currently using super-quick-static:
```
super-quick-static
```
http://localhost:8000/test/html

### online
[here's the (github) page](https://jniac.github.io/js-flex/test/html/)

1D
![image](https://user-images.githubusercontent.com/11039919/112734983-7d26a000-8f49-11eb-857c-35a1169dd22f.png)

2D
![image](https://user-images.githubusercontent.com/11039919/112735032-c971e000-8f49-11eb-8e99-52d21033bf41.png)
