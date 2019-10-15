
var { LottieConverter, SvgConverter } = require('../index');
var expect = require('chai').expect;

describe('module export test', function () {

    it('LottieConverter is not undefined', function () {
        expect(LottieConverter).to.be.not.equal(undefined);
    });

    it('SvgConverter is not undefined', function () {
        expect(SvgConverter).to.be.not.equal(undefined);
    });

});



; (async () => {
    // var lticvter = new LottieConverter({
    //     chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    //     ffmpegPath: '/Users/gaobowen/Downloads/test2/ffmpeg'
    // });
    // var svgcvter = new SvgConverter({
    //     chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    // });

    // var returl = await lticvter.saveAs({
    //     lottiePath:'/Users/gaobowen/Downloads/test2/lottie2.json',
    //     outputPath:'/Users/gaobowen/Downloads/test2/lottie2.gif'
    // })
    // console.log(returl);
    // await svgcvter.svgSaveAs({
    //     filePath:'/Users/gaobowen/Downloads/222.svg',
    //     outputPath:'/Users/gaobowen/Downloads/222.png',
    //     width:'1920',
    //     height:'1080'
    // })

    // await svgcvter.svgSaveAs({
    //     filePath: __dirname + '/test_clip.svg',
    //     outputPath: __dirname + '/test_clip.png',
    //     width: '254.6',
    //     height: '254.6',
    //     clipData: {
    //         clipid: 'lhImageFrame',
    //         imgPath:  __dirname + '/test.jpg',
    //         imgw: 200.02066773076928,
    //         imgh: 132.01364070230773,
    //         imgx: 46.799999237060575,
    //         imgy: 66.7150068664551,
    //         imgr: 29.200863558049512
    //     }
    // })
    // return Promise.resolve();
})()

