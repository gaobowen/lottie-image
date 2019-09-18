# lottie-image
keywords: lottie, png, apng, gif, lottie to gif, lottie to png, lottie to apng, svg, svg to image
> Renders [Lottie](http://airbnb.io/lottie) animations to **image**, **GIF**, **APNG**. Support only APNG and GIF for now, more formats will be added later.

## Install
Install [ffmpeg](https://ffmpeg.org/) on MacOS
```bash
brew install ffmpeg
```
Or  
Install [ffmpeg](https://ffmpeg.org/) on Linux(Ubuntu)
```bash
apt-get install ffmpeg
```
**About ffmpeg : If you want to convert a image with transparent background. you need versions 4.2.1 and above.**

Install pakage
```bash
npm install lottie-image --save
```

## Usage
- Create Converter
```js
var { LottieConverter, SvgConverter } = require('lottie-image');

var cvter = new LottieConverter({
    chromePath: 'replace with your own chrome path',//
    ffmpegPath: 'replace with your ffmpeg path' //
});

var svgcvter = new SvgConverter({
    chromePath : 'replace with your own chrome path'
});
```
- Use File Path
```js
;(async () => {
    await cvter.saveAs({
        lottiePath:'/replace with your lottie file path',//
        outputPath:'/replace with your output file path'//
    })
})()
```
- Use Json Object
```js
;(async () => {
    await cvter.dataSaveAs({
        lottieData:lottieJsonObjectData,
        outputPath:'replace with your output file path'//
    })
})()
```
- svg to image
```js
;(async () => {
    await svgcvter.svgSaveAs({
        filePath:'replace with your input file path',
        outputPath:'replace with your output file path',
        width:'1920',
        height:'1080'
    })
})()
```

