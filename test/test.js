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


// ; (async () => {
//     // var lticvter = new LottieConverter({
//     //     chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
//     //     ffmpegPath: '/Users/gaobowen/Downloads/test2/ffmpeg'
//     // });
//     // var svgcvter = new SvgConverter({
//     //     chromePath : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
//     // });
//     //console.log(lticvter);
//     //console.log(svgcvter);
//     // await cvter.saveAs({
//     //     lottiePath:'/Users/gaobowen/Downloads/test2/lottie.json',
//     //     outputPath:'/Users/gaobowen/Downloads/test2/lottie.gif'
//     // })
//     // await svgcvter.svgSaveAs({
//     //     filePath:'/Users/gaobowen/Downloads/222.svg',
//     //     outputPath:'/Users/gaobowen/Downloads/222.png',
//     //     width:'1920',
//     //     height:'1080'
//     // })
//     return Promise.resolve();
// })()

