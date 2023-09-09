require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectBB = require("./src/db/mongo");

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

const init = async () => {
  await connectBB(PORT);
  server.listen(PORT, () => {
    console.log(`server listening on Port : ${PORT} ...`);
  });
};

init();
