# lottie-image
keywords: lottie, png, apng, gif, lottie to gif, lottie to png, lottie to apng
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
var LottieConverter = require('lottie-image');
var cvter = new LottieConverter({
    chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',//replace with your chrome path
    ffmpegPath: '/Users/gaobowen/Downloads/test2/ffmpeg' //replace with your ffmpeg path
});
```
- Use File Path
```js
(async () => {
    await cvter.saveAs({
        lottiePath:'/Users/gaobowen/Downloads/test2/lottie.json',//replace with your lottie file path
        outputPath:'/Users/gaobowen/Downloads/test2/lottie.gif'//replace with your output file path
    })
})()
```
- Use Json Object
```
(async () => {
    await cvter.saveAs({
        lottieData:lottieJsonObject,
        outputPath:'/Users/gaobowen/Downloads/test2/lottie.gif'//replace with your output file path
    })
})()
```

