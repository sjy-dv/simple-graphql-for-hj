const db = require("./models");
const faker = require("faker");
const faker_kr = require("faker/locale/ko");
const { base64encode } = require("nodejs-base64");
//create dummy user
//password is example, not important in this project
db.sequelize.authenticate().then(async () => {
    try {
        await db.sequelize.sync({ force: false });

        for (let i = 0; i < 50; i++) {
            await db.User.findOrCreate({
                where: {
                    idx: i,
                },
                defaults: {
                    user_id: `${faker.internet.email()}`,
                    username: `${faker_kr.name.lastName()}${faker_kr.name.firstName()}`,
                    password: base64encode(i),
                },
            });
            setTimeout(() => {
                console.log("wait 1 sec");
            }, 1000);
        }
    } catch (error) {
        console.log(error);
    }
});

const express = require("express");
const app = express();
const { PORT } = process.env;
const { graphqlHTTP } = require("express-graphql");
const { buildSchema, graphql } = require("graphql");

app.use(require("cors")());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));

// in graphql
const schema = buildSchema(
    `type Query {
        hello : String
        myname: String
        food : String
    }`
);

let root = {
    hello: () => {
        return "hello world";
    },
    myname: () => {
        return "my name is ...";
    },
    food: () => {
        return "friday food is ...";
    },
};

// use graphql gui
app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true,
    })
);

//using in restapi
app.get("/get_graphql", async (req, res) => {
    try {
        let graphql_api = req.query.api;
        let response = await graphql(schema, `{ ${graphql_api} }`, root);
        res.status(200).send(response);
    } catch (error) {
        console.log(error);
    }
});

//using database

const schemaInDB = buildSchema(
    `
   
    type User {
        idx : Int
        user_id : String
        username : String
        password :String 
    },
     type Query {
        finduser(idx:Int!) : [User]
        findAll : [User]
    },
    `
);

const rootInDB = {
    finduser: async (data) => {
        try {
            const rows = await db.User.findOne({
                where: {
                    idx: data.idx,
                },
            });

            return [
                {
                    user_id: rows.user_id,
                    username: rows.username,
                    password: rows.password,
                },
            ];
        } catch (error) {
            console.log(error);
        }
    },
    findAll: async () => {
        try {
            const rows = await db.User.findAll();
            let result = [];

            for (let i = 0; i < rows.length; i++) {
                let simple_json = {
                    idx: rows[i].idx,
                    user_id: rows[i].user_id,
                    username: rows[i].username,
                    password: rows[i].password,
                };
                result.push(simple_json);
            }
            return result;
        } catch (error) {
            console.log(error);
        }
    },
};

// use graphql gui
app.use(
    "/graphql2",
    graphqlHTTP({
        schema: schemaInDB,
        rootValue: rootInDB,
        graphiql: true,
    })
);

/*
  >>>>> finduser 쓰려면
======graphql query=======
query getuserInfo($userIdx:Int!) {
    finduser(idx:$userIdx){
        user_id
        username
        password
    }
}
 ==== Variables ==== 
 {
    "userIdx" : 원하는 회원번호
}

 >>>> findAll 쓰려면
 ===== graphql query ====== 
 query getallInfo {
    findAll{
        user_id
        username
        password
    }
}
*/
require("http")
    .createServer(app)
    .listen(PORT || 8081);
