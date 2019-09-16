const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

const lottieScript = fs.readFileSync(path.join(__dirname, 'lib', 'lottie_html.min.js'), 'utf8')
const injectLottie = `
<script>
  ${lottieScript}
</script>`
const html = `<!DOCTYPE html>
<html id="lottiehtml" lang="en">
<head>
    <meta charset="UTF-8">
</head>
<style>
    html {
        width: 100%;
        height: 100%;
        background-color: transparent;
    }
</style>
${injectLottie}
<body></body>
</html>`;

function checkLottieData(lottieData) {
    if (lottieData.w === undefined
        || lottieData.h === undefined
        || lottieData.fr === undefined
        || lottieData.ip === undefined
        || lottieData.op === undefined) {
        throw new Error(`Lottie Data Error !`)
    }
}

var browser = {};

/** 
 * convert lottie to image
 * @name LottieConverter
 * @function
 * 
 * @param {object} opts - options
 * @param {string} opts.chromePath - chrome path
 * @param {string} opts.ffmpegPath - ffmpeg path
*/
module.exports = function LottieConverter(opts) {
    const { chromePath, ffmpegPath } = opts;
    if (!fs.existsSync(chromePath)) {
        throw new Error(`chromePath:'${chromePath}' not exist.`)
    }
    if (!fs.existsSync(ffmpegPath)) {
        throw new Error(`ffmpegPath:'${chromePath}' not exist.`)
    }

    this.chromePath = chromePath;
    this.ffmpegPath = ffmpegPath;
    this.saveAs = saveAs;
    this.dataSaveAs = dataSaveAs;

    /**
     * save lottie file as image
     * @param {object} args
     * @param {string} args.lottiePath - lottie file path
     * @param {string} args.outputPath - output file path
     * @param {string} args.loop = -1 for no loop, 0 for looping indefinitely (default),1-65535 loop count.
     */
    async function saveAs(args) {
        const { lottiePath, outputPath, loop = '0' } = args;
        const fsDataStr = fs.readFileSync(
            lottiePath,
            'utf-8'
        )
        let fsData = JSON.parse(fsDataStr);
        return await dataSaveAs({ lottieData: fsData, outputPath: outputPath, loop: loop });
    }

    /**
     * save lottie data as image
     * @param {object} args
     * @param {object} args.lottieData - lottie data object
     * @param {string} args.outputPath - output file path
     * @param {string} args.loop = -1 for no loop, 0 for looping indefinitely (default),1-65535 loop count.
     */
    async function dataSaveAs(args) {
        if (browser.newPage === undefined) {
            browser = await puppeteer.launch({
                executablePath: chromePath,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        const { lottieData, outputPath, loop = '0' } = args;
        checkLottieData(lottieData);
        let width = lottieData.w;
        let height = lottieData.h;
        let framerate = lottieData.fr;
        let inp = lottieData.ip;
        let outp = lottieData.op;
        width = width - (width % 2);
        height = height - (height % 2);
        let page = await browser.newPage();
        page.setCacheEnabled(false);
        page.setViewport({ width, height });
        page.on('error', err => {
            console.log(err);
            page.close();
        });

        page.on('pageerror', err => {
            console.log(err);
            page.close();
        });
        await page.setContent(html, { waitUntil: 'load', timeout: 0 });
        let lh = await page.evaluateHandle('lottie');
        let anmihd = await page.evaluateHandle((lot, data) => {
            var ht = document.getElementById('lottiehtml');
            return anmi = lot.loadAnimation({
                container: ht,
                renderer: 'html',
                loop: true,
                autoplay: false,
                animationData: data
            });
        }, lh, lottieData);
        let pp = path.parse(outputPath);
        let apngpath = path.format({
            root: '/ignored',
            dir: pp.dir,
            base: pp.name + `.apng`
        });
        const ffmpegargs = [
            '-v', 'error',
            `-y`,
            '-framerate', `${framerate}`,
            '-f', 'image2pipe',
            '-i', '-',
            `${apngpath}`,
        ];
        let cproc = cp.spawn(`${ffmpegPath}`, ffmpegargs, { cwd: null, env: null });
        cproc.stderr.on('data', err => console.log('\nffmpeg error->', err.toString()));
        cproc.on('close', async () => {
            if (fs.existsSync(apngpath)) {
                if (pp.ext.slice(1).toLowerCase() == 'gif') {
                    let palpath = path.format({
                        root: '/ignored',
                        dir: pp.dir,
                        base: pp.name + `-pal.png`
                    });
                    let palcmd = `${ffmpegPath} -v error -i ${apngpath} -vf "fps=${framerate},scale=-1:-1:flags=lanczos,palettegen" -y ${palpath}`;
                    let gifcmd = `${ffmpegPath} -v error -i ${apngpath} -i ${palpath} -loop ${loop} -lavfi "fps=${framerate},scale=-1:-1:flags=lanczos [x]; [x][1:v] paletteuse" -y ${outputPath}`;
                    cp.execSync(palcmd);
                    cp.execSync(gifcmd);
                    fs.unlinkSync(palpath);
                    fs.unlinkSync(apngpath);
                }
            }
            else {
                console.log('ffmpeg failed');
            }
        });
        for (let index = inp; index <= outp; index++) {
            await page.evaluateHandle((anmi, idx) => {
                anmi.goToAndStop(idx, true);
            }, anmihd, index);
            const buffer = await page.screenshot({ type: 'png', omitBackground: true });
            cproc.stdin.write(buffer);
            cproc.stdin.write(Buffer.from('\n', 'base64'));
        }
        cproc.stdin.end();
        await new Promise((resolve, reject) => {
            let count = 0;
            let to = {};
            to = setInterval(() => {
                if (fs.existsSync(outputPath)) {
                    clearInterval(to);
                    //console.log(lottie Convert successed)
                    resolve();
                }
                count++;
                if (count > outp * 5) {
                    clearInterval(to);
                    reject('failed: timeout')
                }
            }, 100);
        });
        page.close();
    }
};