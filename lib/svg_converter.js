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

        await page.screenshot({ path: args.outputPath ,omitBackground: true});
        page.close();
        if (fs.existsSync(args.outputPath)) {
            return args.outputPath;
        }
        return '';
    }
}

module.exports.SvgConverter = SvgConverter;