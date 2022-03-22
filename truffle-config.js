const HDWalletProvider = require('@truffle/hdwallet-provider');
const private = require('./keys.json');

module.exports = {
	networks: {
		development: {
			host: '127.0.0.1', // Localhost (default: none)
			port: 8545, // Standard Ethereum port (default: none)
			network_id: '*', // Any network (default: none)
		},

		ropsten: {
			provider: () =>
				new HDWalletProvider(String(private.key), String(private.ropstenWssEndpoint)),
			network_id: 3, // Ropsten's id
			//gas: 5500000,
			//gasPrice: 10000000000,
			networkCheckTimeout: 1000000,
			timeoutBlocks: 200, // # of blocks before a deployment times out (minimum/default: 50)
			skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
			maxFeePerGas: 1000000108, // - use maxFeePerGas and maxPriorityFeePerGas if creating type 2 transactions (https://eips.ethereum.org/EIPS/eip-1559)
			maxPriorityFeePerGas: 1000000, //
			//confirmations: 2, // # of confs to wait between deployments. (default: 0)
		},

		rinkeby: {
			provider: () =>
				new HDWalletProvider(String(private.key), String(private.rinkebyWssEndpoint)),
			network_id: 4, // Rinkeby's id
			gas: 5500000,
			gasPrice: 10000000000,
			networkCheckTimeout: 1000000,
			timeoutBlocks: 200, // # of blocks before a deployment times out (minimum/default: 50)
			skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
			//confirmations: 2, // # of confs to wait between deployments. (default: 0)
		},
	},

	contracts_build_directory: './public/contracts',

	compilers: {
		solc: {
			version: '^0.8.0', // Fetch exact version from solc-bin (default: truffle's version)
		},
	},
};
