const puppeteer = require('puppeteer-core');
const fs = require('fs');
let browser = require('./share_object').browser;

if (browser === undefined) {
    browser = {};
}


/**
 * conver svg to image
 * @name SvgConverter
 * @class
 * 
 * @param {object} args 
 * @param {object} args.chromePath
 */
function SvgConverter(args) {
    const { chromePath } = args;
    if (!fs.existsSync(chromePath)) {
        throw new Error(`chromePath:'${chromePath}' not exist.`)
    }
    this.chromePath = chromePath;
    this.svgSaveAs = svgSaveAs;
    //this.clipSvgSaveAs = clipSvgSaveAs;

    /**
     * save svg file as image
     * @param {object} args 
     * @param {string} args.filePath - svg file path
     * @param {string} args.outputPath - output path
     * @param {number} args.width - output width
     * @param {number} args.height - output height
     * @param {object} args.clipData - svg clip image data 
     * @param {string} args.clipData.clipid - clip id
     * @param {string} args.clipData.imgPath - clip imgPath
     * @param {number} args.clipData.imgw - clip width
     * @param {number} args.clipData.imgh - clip height
     * @param {number} args.clipData.imgx - clip offset x
     * @param {number} args.clipData.imgy - clip offset y
     * @param {number} args.clipData.imgr - clip rotate
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
        page.setViewport({ width: width, height: height });

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
        if(args.clipData && !fs.existsSync(args.clipData.imgPath)) console.error(`FILE NOT EXSIT ${args.clipData.imgPath}`);
        if (args.clipData
            && args.clipData.clipid
            && fs.existsSync(args.clipData.imgPath)
            && args.clipData.imgw > 0
            && args.clipData.imgh > 0) {
            await page.evaluateHandle((svghd, args) => {
                let mypath = svghd.getElementById('lhImageFrame')
                if (mypath) {
                    let cpid = new Date().getTime().toString() + parseInt(Math.random() * 100)
                    let dfs = svghd.getElementsByTagName('defs')
                    // add defs
                    if (dfs.length > 0) {
                        dfs[0].innerHTML += `<clipPath id="${cpid}" fill="none">${mypath.outerHTML}</clipPath>`
                    }
                    else {
                        svghd.innerHTML +=
                            `<defs>
                                <clipPath id="${cpid}" fill="none">${mypath.outerHTML}</clipPath>
                            </defs>`
                    }
                    //add g & image
                    let imgpath = args.clipData.imgPath
                    let wid = args.clipData.imgw
                    let heig = args.clipData.imgh
                    let x = args.clipData.imgx
                    let y = args.clipData.imgy
                    let rota = args.clipData.imgr
                    let imgstr = `<image xlink:href="${imgpath}"  width="${wid}" height="${heig}" x="${x}" y="${y}" `
                        + `rotate="${rota}" transform="rotate(${rota} ${(x + wid / 2)} ${(y + heig / 2)})"/>`
                    svghd.innerHTML +=
                        `<g id="imageContainer" clip-path="url(#${cpid})">
                            ${imgstr}
                        </g>`
                }
            }, svghd, args);
        }


        await page.screenshot({ path: args.outputPath, omitBackground: true });
        page.close();
        if (fs.existsSync(args.outputPath)) {
            return args.outputPath;
        }
        return '';
    }
}

module.exports.SvgConverter = SvgConverter;