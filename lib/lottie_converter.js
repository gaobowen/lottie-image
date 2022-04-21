const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
let browser = require('./share_object').browser;

const lottieScript = fs.readFileSync(path.join(__dirname, 'lottie.min.js'), 'utf8')
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

if (browser === undefined) {
    browser = {};
}

/** 
 * convert lottie to image
 * @name LottieConverter
 * @class
 * 
 * @param {object} opts - options
 * @param {string} opts.chromePath - chrome path
 * @param {string} opts.ffmpegPath - ffmpeg path
*/
function LottieConverter(opts) {
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
    this.svgSaveAs = svgSaveAs;

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
     * save lottie data object as image
     * @param {object} args
     * @param {object} args.lottieData - lottie data object
     * @param {string} args.outputPath - output file path
     * @param {string} args.loop = -1 for no loop, 0 for looping indefinitely (default),1-65535 loop count.
     */
    async function dataSaveAs(args) {
        if (browser.newPage === undefined) {
            // eslint-disable-next-line require-atomic-updates
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
        page.setViewport({ width: width, height: height });
        page.on('error', err => {
            console.error(err);
            page.close();
        });

        page.on('pageerror', err => {
            console.error(err);
            page.close();
        });
        await page.setContent(html, { waitUntil: 'load', timeout: 0 });
        let lh = await page.evaluateHandle('lottie');
        let anmihd = await page.evaluateHandle((lot, data) => {
            // eslint-disable-next-line no-undef
            var ht = document.getElementById('lottiehtml');
            // eslint-disable-next-line no-undef
            return anmi = lot.loadAnimation({
                container: ht,
                renderer: 'svg',
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
        cproc.stderr.on('data', err => console.error('\nffmpeg error->', err.toString()));
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
                console.error('ffmpeg failed');
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
        let result = await new Promise((resolve, reject) => {
            let count = 0;
            let to = {};
            to = setInterval(() => {
                if (fs.existsSync(outputPath)) {
                    clearInterval(to);
                    //console.log(lottie Convert successed)
                    resolve(outputPath);
                }
                count++;
                if (count > outp * 5) {
                    clearInterval(to);
                    reject('failed: timeout')
                }
            }, 100);
        });
        page.close();
        return result;
    }

    /**
     * save svg file as image
     * @param {object} args 
     * @param {string} args.filePath - svg file path
     * @param {string} args.outputPath - output path
     * @param {int} args.width - output width
     * @param {int} args.height - output height
     */
    async function svgSaveAs(args) {
        if (browser.newPage === undefined) {
            // eslint-disable-next-line require-atomic-updates
            browser = await puppeteer.launch({
                executablePath: chromePath,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        let width = parseInt(args.width);
        let height = parseInt(args.height);

        const page = await browser.newPage();
        page.setCacheEnabled(false);
        page.setViewport({ width, height });

        page.on('error', err => {
            console.error(err);
            page.close();
        });

        page.on('pageerror', err => {
            console.error(err);
            page.close();
        });
        let url = args.filePath;
        if (!url.startsWith('file:///')) {
            url = 'file:///' + url;
        }
        await page.goto(url, { waitUntil: 'load', timeout: 0 });
        // eslint-disable-next-line no-undef
        let svghd = await page.evaluateHandle(() => { return document.getElementsByTagName("svg")[0] });
        await page.evaluateHandle((svghd) => {
            svghd.setAttribute("style", "width:100%; height:100%;");
        }, svghd);

        await page.screenshot({ path: args.outputPath });
        page.close();
        if (fs.existsSync(args.outputPath)) {
            return args.outputPath;
        }
        return '';
    }
}

module.exports.LottieConverter = LottieConverter;