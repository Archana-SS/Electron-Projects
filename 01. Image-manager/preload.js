const {contextBridge,ipcRenderer}=require('electron')

ipcRenderer.on("event-from-main-process",(event,data)=>{
    if(data){
        document.querySelector("img").src=data
    }
})

ipcRenderer.on("file-deleted",()=>{
    document.querySelector("img").removeAttribute("src")
})

ipcRenderer.on("attempt-delete-file", () => {
    console.log("image", document.querySelector("img").src);
    if(!document.querySelector("img").src == "" && window.confirm("Are you sure you want to delete this file?")) {
        renderer.delete_file(document.querySelector("img").src)
    }
})

const renderer = {
    openFile:async()=>{
        return await ipcRenderer.invoke("open-file")
    },
    show_contextmenu:(filename=undefined)=>{
        ipcRenderer.send("open-contextmenu",{filename})
    },
    delete_file:(filename)=>{
        console.log("filename delete", filename);
        ipcRenderer.send("delete-file",{filename})
    },
    requestDelete: () => ipcRenderer.send("request-delete")
}
contextBridge.exposeInMainWorld("electron",renderer)