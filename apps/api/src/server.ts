import { createApp } from "./app.js"


const PORT=Number(process.env.PORT)
const app=createApp();

app.listen(PORT,()=>{
    console.log(`DevSync API listening on http://localhost:${PORT}`)
})
