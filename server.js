const express = require("express")
const exphb = require("express-handlebars")
const fs = require('fs')

const port = 3002;

const app = express()
const hbs = exphb.create({
    helpers: {
        eq: (a, b) => a === b,
    },
    defaultLayout: "main"
});

app.engine("handlebars", hbs.engine)
app.set("view engine", "handlebars")
app.use(express.static("public"));
app.set('trust proxy', true);

const groupedActs = {}
const groupedActsIF = {}
const groupedActsNIF = {}
fs.readFile('acts.json', "utf8", (err, data) => {
    if(err){
        console.error(err);
        return;
    }
    acts = JSON.parse(data)

    acts.forEach((act) => {
        const firstLetter = act.name.charAt(0).toUpperCase();
        const targetGroup = act.inForce ? groupedActsIF : groupedActsNIF;

        if (!targetGroup[firstLetter]) targetGroup[firstLetter] = [];
        if (!groupedActs[firstLetter]) groupedActs[firstLetter] = [];

        targetGroup[firstLetter].push(act);
        groupedActs[firstLetter].push(act);
    })
})

app.get("/", (req, res) => {
    res.render("index")
});

app.get("/disclaimer", (req, res) => {
    res.render("disclaimer")
})

app.get("/acts/:type?", (req, res) => {
    const typeMap = {
        inforce: { data: groupedActsIF, type: "if" },
        ceased: { data: groupedActsNIF, type: "nif" },
        default: { data: groupedActs, type: "all" }
    };
    
    const validTypes = ["inforce", "ceased"];
    const type = req.params.type;
    if(type && !validTypes.includes(type.toLowerCase())){res.redirect("/acts")}

    const { data, type: responseType } = typeMap[type] || typeMap.default;
    res.render("acts", { groupedActs: data, type: responseType });
});

app.get("/act/:act", (req, res) => {
    const act = acts.find(a => a.ID === req.params.act);
    if (!act) {
        res.status(404).send("Unable to find act");
        return;
    }

    res.render("act", { act: act })
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})