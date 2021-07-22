require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('chai-ethers');
require('hardhat-deploy');

const { infuraKey, mnemonic } = require('./secrets.json');


module.exports = {
  solidity: "0.8.4",
  namedAccounts: {
    deployer: 0,
    consumer1: 1,
    consumer2: 2,
    consumer3: 3,
  },
  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: 5000
      },
      accounts: { mnemonic: mnemonic },
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/"+infuraKey,
      accounts: { mnemonic: mnemonic },
    },
  }
};
