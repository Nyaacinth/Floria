import { dialog } from "electron"

const aboutMsg = `
A common interactive novel, internally named Floria, made by Nyaacinth (me).
This project bundled components from several other projects, you can find their licenses in {app.asar}/LICENSES/*
This project (parts written by me) is licensed to you under MIT license, which can be found in {app.asar}/LICENSE

(=ﾟωﾟ)=
`.trim()

function showAboutPage() {
    void dialog.showMessageBox({
        title: "About Page",
        message: aboutMsg,
        buttons: ["OK"]
    })
}

const exposeName = "FloriaApp:showAboutPage"

const combo = [exposeName, showAboutPage] as const

export default combo
