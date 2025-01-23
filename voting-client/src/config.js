// src/config.js

import electionJson from './contracts/Election.json';
import resultJson from './contracts/ResultContract.json';

const config = {
  Election: {
    abi: electionJson.abi,
    networks: electionJson.networks,
  },
  ResultContract: {
    abi: resultJson.abi,
    networks: resultJson.networks,
  },
};

export default config;
