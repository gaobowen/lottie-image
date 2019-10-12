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
     * @param {object} args.cilpData - svg clip image data 
     * @param {string} args.cilpData.clipid - clip id
     * @param {string} args.cilpData.imgPath - clip width
     * @param {string} args.cilpData.imgw - clip width
     * @param {string} args.cilpData.imgh - clip height
     * @param {string} args.cilpData.imgx - clip offset x
     * @param {string} args.cilpData.imgy - clip offset y
     * @param {string} args.cilpData.imgr - clip rotate
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
        if (args.cilpData
            && args.cilpData.clipid
            && fs.existsSync(args.cilpData.imgPath)
            && args.cilpData.imgw > 0
            && args.cilpData.imgh > 0) {
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
                    let imgpath = args.cilpData.imgPath
                    let wid = args.cilpData.imgw
                    let heig = args.cilpData.imgh
                    let x = args.cilpData.imgx
                    let y = args.cilpData.imgy
                    let rota = args.cilpData.imgr
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