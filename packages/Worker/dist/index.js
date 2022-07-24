"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require('axios');
const path_1 = require("path");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: (0, path_1.resolve)(__dirname, "../../.env") });
const puppeteer = __importStar(require("puppeteer"));
let sciName = '';
let animalData = {
    SciName: '',
    result: {
        status: '',
        name: '',
        description: ''
    }
};
let isClose = true;
/**
 * @description get sciName request
 * @returns {string} sciName
 */
const getSciName = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios.get(`http://localhost:${process.env.PORT}`);
        sciName = yield response.data.SciName;
    }
    catch (error) {
        console.error(`get sciName failed because ${error}`);
    }
    return sciName;
});
/**
 * @description scrape animalData by sciName
 * @returns {void} no return
 */
const scrapeRelatedDataBySciName = () => __awaiter(void 0, void 0, void 0, function* () {
    let sciName = yield getSciName();
    console.log('sciName', sciName);
    const browser = yield puppeteer.launch();
    // //open new tab
    const page = yield browser.newPage();
    // //go to the page
    isClose = false;
    yield page.goto(`https://www.wikipedia.org`, { waitUntil: 'load', timeout: 0 });
    // //type the search form
    yield page.type("#searchInput", sciName);
    yield page.click("#search-form fieldset button");
    yield page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 });
    const pageContent = yield page.content();
    const url = yield page.url();
    if (pageContent.includes('#mw-content-text > div.searchresults > p.mw-search-nonefound')) {
        yield resultNotFound(page);
    }
    else if (pageContent.includes('#mw-content-text > div.searchdidyoumean')) {
        yield getResultAfterSpellCorrection(page, sciName);
    }
    else if (url.includes('search')) {
        yield getResultFromFirstLink(page, sciName);
    }
    else {
        yield getResultDirectly(page, sciName);
    }
    yield page.close();
    isClose = true;
    return isClose;
});
/**
 * @descritpion get result directly from result page
 * @param {puppeteer.page} result page
 * @param {string} sciName
 */
const getResultDirectly = (page, name) => __awaiter(void 0, void 0, void 0, function* () {
    const data = { status: '', name: '', description: '' };
    try {
        let commonName = yield page.$eval('#firstHeading > i', e => e.textContent);
        let description = yield page.$eval('#mw-content-text > div.mw-parser-output > p:nth-child(4)', e => e.textContent);
        data.name = commonName ? commonName : '';
        data.description = description ? description : '';
    }
    catch (err) {
        console.log(err);
    }
    if (data.name && data.description) {
        data.status = 'ok';
    }
    animalData.SciName = name;
    animalData.result = data;
    yield axios({
        method: 'post',
        url: `http://localhost:${process.env.PORT}`,
        headers: {},
        data: { animalData: animalData }
    });
    console.log('animalData', animalData);
});
const getResultFromFirstLink = (page, name) => __awaiter(void 0, void 0, void 0, function* () {
    // await page.waitForSelector("#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a", {visible: true});
    yield page.waitForSelector('#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a');
    yield page.click('#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a'),
        yield page.waitForNavigation({ waitUntil: "domcontentloaded" });
    yield getResultDirectly(page, name);
});
const getResultAfterSpellCorrection = (page, name) => __awaiter(void 0, void 0, void 0, function* () {
    yield page.click('#mw-search-DYM-suggestion');
    yield page.waitForNavigation({ waitUntil: "domcontentloaded" });
    yield getResultFromFirstLink(page, name);
});
const resultNotFound = (page) => __awaiter(void 0, void 0, void 0, function* () {
    animalData.result.status = 'error';
    yield axios({
        method: 'post',
        url: `${`http://localhost:${process.env.PORT}`}`,
        headers: {},
        data: animalData
    });
});
/**
 * @description central control of state
 */
scrapeRelatedDataBySciName();
