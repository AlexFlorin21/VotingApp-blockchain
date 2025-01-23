
const path = require("path");
contracts_build_directory: path.join(__dirname, "voting-client/src/contracts")

module.exports = {


  contracts_build_directory: path.join(__dirname, "build/contracts"),
  networks: {

    development: {
      host: "127.0.0.1", 
      port: 7545, 
      network_id: "*", 
    },
  },


  mocha: {
    
  },

  compilers: {
    solc: {
      version: "0.8.14", 

    },
  },

};
