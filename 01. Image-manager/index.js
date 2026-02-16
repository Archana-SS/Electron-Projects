document.querySelector("#select-file").onclick=async ()=>{
    const file=await window.electron.openFile()
    console.log("file: ",file)
    document.querySelector("img").src=file
}

document.querySelector("img").onauxclick=(e)=>{
    window.electron.show_contextmenu(document.querySelector("img").src)
}

/*document.querySelector("#delete-file").onclick=()=>{
    if(document.querySelector("img").src=="")
        return

    if(window.confirm("Are you sure you want to delete this file?")){
        electron.delete_file(document.querySelector("img").src)
    }
}*/

document.querySelector("#delete-file").onclick = () => {
    window.electron.requestDelete();
};
