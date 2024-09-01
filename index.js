const mysql = require("mysql2");
const express = require("express");
const { faker } = require("@faker-js/faker");
const app = express();
const path = require("path");
const { v4: uuidv4 } = require('uuid');


// Method-Override Package :
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

//faker package area

let createRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// Create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "Yash@3203",
});

app.set("views", path.join(__dirname, "/views"));
app.set("public", path.join(__dirname, "/public"));
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");

// port
const port = 8080;
// listening :
app.listen(port, () => {
  console.log(`App will listening on the route : ${port}`);
});

// routes :

// Home route to show All the  users

app.get("/", (req, res) => {
  let q = `select count(*) from user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home", { count });
    });
  } catch (error) {
    console.log(error);
    res.send("ERROR IN DATABASE");
  }
});

// user route :
app.get("/users", (req, res) => {
  let q = `select * from user ORDER BY username ASC;`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      // console.log(result);
      res.render("users", { result });
    });
  } catch (error) {
    console.log(error);
    res.send("ERROR IN DATABASE");
  }
});

// show specific details :
app.get("/users/:id/", (req, res) => {
  let { id } = req.params;
  try {
    let q = `select * from user where id = '${id}'`;
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("user.ejs", { user });
    });
  } catch (error) {
    console.log(error);
    res.send("ERROR IN DATABASE");
  }
});

// edit route
app.get("/users/:id/edit/", (req, res) => {
  let { id } = req.params;
  let q = `select * from user where id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit", { user });
    });
  } catch (error) {
    console.log(error);
    res.send("ERROR IN DATABASE");
  }
});

// Update route in Actually in (DB)
app.patch("/users/:id/", (req, res) => {
  let { password: formPass, username: formUname } = req.body;
  let { id } = req.params;
  let q = `select * from user where id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.render("password-error.ejs");
      } else {
        let q2 = `UPDATE USER SET USERNAME = '${formUname}' where  id = '${id}'`;
        try {
          connection.query(q2, (err, result) => {
            if (err) throw err;
            res.redirect("/users");
          });
        } catch (err) {
          console.log(err);
        }
      }
    });
  } catch (error) {
    res.send("ERROR IN DATABASE");
  }
});

// delete page route :
app.get("/users/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM USER WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete", { user });
    });
  } catch (error) {}
});
app.delete("/users/:id/", (req, res) => {
  let { email: formEmail, password: formPass } = req.body;
  let { id } = req.params;
  let q = `SELECT * FROM USER WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formEmail != user.email || formPass != user.password) {
        res.render("password-error.ejs");
      } else {
        let q2 = `DELETE FROM USER WHERE email = '${formEmail}' AND password = '${formPass}'`;
        try {
          connection.query(q2, (err, result) => {
            if (err) throw err;
            res.redirect("/users");
          });
        } catch (error) {
          console.log(err);
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});
app.post("/user/new", (req, res) => {
  console.log(req.body);
  let id = uuidv4();
  let {username, email, password} = req.body;
  let user = [id, username, email, password];
  let q = `INSERT INTO USER (id, username, email, password) values (?,?,?,?)`;
  try {
    connection.query(q, user, (err, result) => {
      if(err) throw err;
      res.redirect("/users");
    } )
  } catch (error) {
    console.log(error);
  }
});