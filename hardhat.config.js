export default {
  solidity: "0.8.24",
  networks: {
    lacchain_local: {
      type: "http",                 // <-- requerido por Hardhat v3
      url: "http://98.89.1.157:4545"  // reemplaza por tu RPC si es otra
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
