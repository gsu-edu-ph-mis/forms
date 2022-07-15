const puppeteer = require('puppeteer');


let pageToPdf = async (url, filePath) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })
    const buff = await page.pdf({ 
        path: filePath, 
        printBackground: true,
        preferCSSPageSize : true,
    })

    await browser.close()
    return buff
}

let stringToPdf = async (string, filePath) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.setContent(string, { waitUntil: 'networkidle2' })
    await page.pdf({ 
        path: filePath, 
        format: 'Legal', 
        printBackground: true 
    })

    await browser.close()
}


module.exports = {
    pageToPdf: pageToPdf,
    stringToPdf: stringToPdf,
}