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
const { makeExecutableSchema } = require("graphql-tools");
const { ApolloServer } = require("apollo-server-express");
app.use(require("cors")());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));

const typeDefs = `
    type User {
        idx : Int
        user_id : String
        username : String
        password :String 
    }

    type Query {
       finduser(idx : Int!): User
       findAll:[User]
        createUser(user_id : String!, username:String!, password:String!) : String
    }
`;

const resolvers = {
    Query: {
        async finduser(_, { idx }) {
            try {
                const rows = await db.User.findOne({
                    where: {
                        idx: idx,
                    },
                });
                let result = {
                    idx: rows.idx,
                    user_id: rows.user_id,
                    username: rows.username,
                    password: rows.password,
                };
                return result;
            } catch (error) {
                console.log(error);
            }
        },
        async findAll() {
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
        async createUser(_, { user_id, username, password }) {
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
};

async function ApplicationWithApollo() {
    try {
        const server = new ApolloServer({
            typeDefs,
            resolvers,
        });
        await server.start();

        server.applyMiddleware({
            app,
            path: "/graphql",
        });
        await new Promise((resolve) =>
            require("http")
                .createServer(app)
                .listen(PORT || 8081, resolve)
        );
        return { server, app };
    } catch (error) {
        console.log(error);
    }
}

ApplicationWithApollo();
/**
 *  apollo서버는 직접 접속해야됨, postman사용불가
 */
