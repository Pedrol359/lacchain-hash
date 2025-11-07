export default {
  solidity: "0.8.24",
  networks: {
    lacchain_local: {
      type: "http",                 // <-- requerido por Hardhat v3
      url: "http://127.0.0.1:4545"  // reemplaza por tu RPC si es otra
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
