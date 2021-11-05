
// node filename.js --url="https://www.hackerrank.com" --config=config.json 
//npm init -y
//npm i minimist
//npm i puppeteer

let minimist = require("minimist");
let fs = require("fs");
let puppeteer = require('puppeteer');

let args = minimist(process.argv);
let configJSON = fs.readFileSync(args.config,"utf-8");
let configJSO = JSON.parse(configJSON);

async function run(){
  let browser = await puppeteer.launch(                       //browser opened            
    {headless:false,
      
     
      args: [ '--start-maximized'],                      //full window open
      defaultViewport : null                                
      
    });    
    let pages = await browser.pages();
    let page = pages[0];                   //page mila
    await page.goto(args.url);             //page me url daldia
    //login1
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");
    //login2
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");
    //username 
    await page.waitForSelector("input[name='username']");   //iske bad username type
    await page.type("input[name='username']", configJSO.userid,{delay:10});
    //password
    await page.waitForSelector("input[name='password']");   //iske bad password type
    await page.type("input[name='password']", configJSO.password,{delay:10});
    //login3
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");
    //click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");
    //click on manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");
    //find number of pages
    await page.waitForSelector("a[data-attr1='Last']");
    //-> read how many pages are there
     let numPages = await page.$eval("a[data-attr1='Last']",function(atag){

      let totalPages = parseInt(atag.getAttribute("data-page"));
      return totalPages;
     }); 
 
     for(let i =1;i<=numPages;i++){    // 
      await handleAllContestsOfAPage(page,browser);    //ek page layi chlgya uske bd:    //async func h to await krna hoga
      if(i != numPages){                    //last page pe phonchne se phle hoga yeh kaam:
        await page.waitForSelector("a[data-attr1='Right']");
        await page.click("a[data-attr1='Right']");
      }
     
     }
  }  
 
async function handleAllContestsOfAPage(page,browser){
//find all urls of same page
    await page.waitForSelector("a.backbone.block-center"); 
    let curls = await page.$$eval("a.backbone.block-center",function(atags){
         let urls=[];             //array passed to funC atags
         for(let i = 0; i<atags.length;i++){
           let url = atags[i].getAttribute("href");    //href inside those atags
           urls.push(url);                              
         }
         return urls;
    });

      for(let i=0;i<curls.length;i++){          //loop in all the urls
        let curl = curls[i];
        let ctab = await browser.newPage();     //new tab open
       //main work
       await saveModeratorInAcontest(ctab, args.url + curls[i], configJSO.moderators);
        await ctab.close();                     //tab close after work done
        await ctab.waitFor(3000); 

      }   
}

async function saveModeratorInAcontest(ctab,fullCurl,moderators){               //we get tab, full contest url,moderator
  await ctab.bringToFront();                                          //bring tab to front
  await ctab.goto(fullCurl);                                          //open full contest url in the tab
  await ctab.waitFor(3000);

    // click on moderators tab
await ctab.waitForSelector("li[data-tab='moderators']");
await ctab.click("li[data-tab='moderators']");

// type in moderator
await ctab.waitForSelector("input#moderator");
await ctab.type("input#moderator", moderators, { delay: 50 });

// press enter
await ctab.keyboard.press("Enter");
}
  
  run();


 