const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const Flash = require("connect-flash");
const methodOverride = require("method-override");
const Users = require("./Models/User");
const app = express();
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const bodyParser = require('body-parser');
const LocalPassport = require("passport-local");
const User = require("./Models/User");
const contact = require("./Models/contact");
const Notes = require("./Models/Notes");
const College = require("./Models/College");
const fileUpload = require("express-fileupload");
const { Console } = require("console");
const fs = require("fs").promises;



app.use(
    fileUpload()
);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());




mongoose.connect("mongodb://localhost:27017/KuHacks", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "View"));

// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'Public')))
const SessionConfig = {
    secret: 'Thisshoudbebettersecret1',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


passport.use(new LocalPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(session(SessionConfig))
app.use(Flash())


app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.Error = req.flash('error');
    res.locals.CurrentUser = req.user;
    next();
})

app.get('/UserLogin', (req, res) => {
    res.render("Users/login");
});
app.post("/register", async(req, res, next) => {
    const { email, username, password } = req.body;
    const User = new Users({ email, username });
    const registeredUser = await Users.register(User, password);

    res.redirect('/');
})
app.get('/UserRegister', (req, res) => {
    res.render("Users/Register");
});
app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/userLogin' }), (req, res) => {
    res.redirect('/');
});
app.post("/:id/upload", (req, res) => {
    if (!req.files) {
        return res.status(400).send("No files were uploaded.");
    }
    const cllg = College.findById(req.params.id);
    const file = req.files.myFile;
    const path = __dirname + "/Public/College/" + cllg + '/' + file.name;
    file.mv(path, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        return res.send({ status: "success", path: path });
    });
});
app.get("/notes", async(req, res) => {
    const college = await College.find({})
    res.render("notes", { college });
});
app.get("/info", async(req, res) => {
    // const college = await College.find({})
    res.render("info", {});
});
app.post('/AddCollege', async(req, res) => {
    const Colleges = req.body.College;
    const newCollege = new College(Colleges);
    await newCollege.save();
    res.redirect('/notes');
});

app.post("/notes", async(req, res) => {
    const { collegeName, phoneNumber, email, HOD, DepartmentDetails, Branch } = req.body;
    const college = new College({ collegeName, phoneNumber, email, HOD, DepartmentDetails, Branch });
    await college.save();
    res.redirect("/notes");
});



app.get("/:id/post/:dept", async(req, res) => {
    const { id, dept } = req.params;
    const cllg = await College.findById(id);
    const folder = path.join(__dirname, "Public/College/" + cllg.CollegeName + '/' + dept);

    const filelist = await findFiles(folder);

    res.render("post", { cllg, dept, filelist, folder });
});

async function findFiles(folderName) {
    const items = await fs.readdir(folderName, { withFileTypes: true });
    var fileslist = [];
    items.forEach((item) => {
        if (path.extname(item.name) == ".pdf") {

            var tem = item.name;
            fileslist.push(tem.split(".")[0]);

        } else {
            try {
                findFiles(path.join(folderName, item.name));
            } catch (err) {
                console.log(err);
            }
        }


    });
    return fileslist;
}



app.post("/post", async(req, res) => {
    const { title, content } = req.body;
    const notes = new Notes({ title, content });
    await notes.save();
    res.redirect("/post");
});


app.get("/contact", (req, res) => {
    res.render("contact");
});
app.post('/contact', async(req, res) => {
    const { name, phone, email, query, message } = req.body;
    const Contact = new contact({ name, phone, email, query, message });
    await Contact.save();
    res.redirect('/contact');
});
app.get("/", (req, res) => {
    res.render("index");
});

app.all("*", (req, res, next) => {
    next(new ExpressError("What The Fuck Happened  Now??????", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render("error", { err });
});

app.listen(9483, () => {
    console.log("Serving on port 9483");
});