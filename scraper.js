const express = require("express");
const chrome = require("selenium-webdriver/chrome")
const { Builder, By } = require("selenium-webdriver");
const fs = require("fs");
const asyncHandler = require("express-async-handler");

require("dotenv").config();

const PORT = process.env.PORT;
const app = express();

app.get("/", asyncHandler(async (req, res) => {
    // Set the browser options
    const options = new chrome.Options().addArguments("--headless");

    // Initialize
    const driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        // Navigate to the target webpage
        await driver.get("https://www.scrapingcourse.com/infinite-scrolling");

        // Extract HTML of target webpage
        const html = await driver.getPageSource();

        // Locate the parent elements
        const parentElements = await driver.findElements(By.css(".product-info"));

        const namesArray = [];
        const pricesArray = [];
        
        for (let parentElement of parentElements) {
            // Find child elements within the parent element
            let names = await parentElement.findElement(By.css(".product-name"));
            let prices = await parentElement.findElement(By.css(".product-price"));

            namesArray.push(await names.getText());
            pricesArray.push(await prices.getText());
        }
        
        let productsData = "name,price\n";

        for (let i = 0; i < namesArray.length; i++) {
            productsData += `${namesArray[i]},${pricesArray[i]}\n`;
        }

        // Write data
        fs.writeFile("ProductDetails.csv", productsData, err => {
            if (err) {
                console.error("Error:", err);
            } else {
                console.log("Success");
            }
        })

        res.send(html);
    } catch (err) {
        console.error(`An error occured: `, err);
    } finally {
        await driver.quit();
    }
}));

app.listen(PORT, () => {
    console.log(`App running in http://localhost:${PORT}`);
})
