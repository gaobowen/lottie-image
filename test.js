var LottieConverter = require('./index');
var cvter = new LottieConverter({
    chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ffmpegPath: '/Users/gaobowen/Downloads/test2/ffmpeg'
});
console.log(cvter);

(async () => {
    await cvter.saveAs({
        lottiePath:'/Users/gaobowen/Downloads/test2/lottie.json',
        outputPath:'/Users/gaobowen/Downloads/test2/lottie.gif'
    })
})()

