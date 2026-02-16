const {app,BrowserWindow}=require('electron')
const path=require("path")
const url=require("url")

let mainWindow;

app.whenReady().then(()=>{
    mainWindow=new BrowserWindow({
        width:265,
        height:460,
        icon:__dirname+"./img/system.png"
    })

    //mainWindow.loadFile('./index.html')

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true,
        })
    );
})

app.on("window-all-closed",()=>{
    if(process.platform!=="darwin"){
        app.quit()
    }
})

app.on("closed",()=>{
    mainWindow=null;
})