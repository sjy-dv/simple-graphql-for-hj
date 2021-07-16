const db = require("./models");
const faker = require("faker");
const faker_kr = require("faker/locale/ko");
const { base64encode } = require("nodejs-base64");
//create dummy user
//password is example, not important in this project
db.sequelize.authenticate().then(async () => {
    try {
        await db.sequelize.sync({ force: false });
    } catch (error) {
        console.log(error);
    }
});

const express = require("express");
const app = express();
const { PORT } = process.env;
const { graphqlHTTP } = require("express-graphql");
const {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLSchema,
} = require("graphql");
app.use(require("cors")());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));

const userType = new GraphQLObjectType({
    name: "User",
    fields: {
        idx: { type: GraphQLInt },
        user_id: { type: GraphQLString },
        username: { type: GraphQLString },
        password: { type: GraphQLString },
    },
});

const queryType = new GraphQLObjectType({
    name: "Query",
    fields: {
        finduser: {
            type: userType,
            args: {
                idx: { type: GraphQLInt },
            },
            resolve: async (_, { idx }) => {
                try {
                    const rows = await db.User.findOne({
                        where: {
                            idx: idx,
                        },
                    });
                    console.log(rows.user_id);
                    let result = {
                        user_id: rows.user_id,
                        username: rows.username,
                        password: rows.password,
                    };
                    return result;
                } catch (error) {
                    console.log(error);
                }
            },
        },
        findAll: {
            type: new GraphQLList(userType),
            resolve: async (_) => {
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
        },
    },
    name: "Mutation",
    fields: {
        createUser: {
            type: GraphQLString,
            args: {
                user_id: { type: GraphQLString },
                username: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            resolve: async (_, { user_id, username, password }) => {
                try {
                    const rows = await db.User.create({
                        user_id: user_id,
                        username: username,
                        password: password,
                    });
                    if (rows) return "success";
                    else return "failed";
                } catch (error) {
                    console.log(error);
                }
            },
        },
    },
});

/**
 * =====graphql query=======
 *  finduser 쓸 때,
 * {   
    finduser(idx : 1){    
        user_id,
        username,
        password
    }
}
 * =====graphql query=======
 *  findAll 쓸 때,
 * {   
    findAll{    
        user_id,
        username,
        password
    }
}

 * =====graphql query=======
 *  createUser 쓸 때,
{
    createUser(
        user_id: "dsddsdss", 
        username: "김현지2", 
        password:"13131"
        ) 
}
 * 
 */

const schema = new GraphQLSchema({ query: queryType });

app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        graphiql: true,
    })
);

require("http")
    .createServer(app)
    .listen(PORT || 8081);
