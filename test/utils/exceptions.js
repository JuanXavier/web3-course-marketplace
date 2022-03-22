const PREFIX = 'Returned error: VM Exception while processing transaction: ';

async function tryCatch(promise, message) {
	try {
		await promise;
		throw null;
	} catch (error) {
		// Assert will throw error if null, undfnied or false is provded
		// assert (false, "Cannot assert")
		// Check if we have error object
		assert(error, 'Expected an error but did not get one');

		// Check if error message starts with PREFIX + MESSAGE
		assert(
			error.message.startsWith(PREFIX + message),
			"Expected an error starting with '" +
				PREFIX +
				message +
				"' but got '" +
				error.message +
				"' instead"
		);
	}
}

module.exports = {
	catchRevert: async function (promise) {
		await tryCatch(promise, 'revert');
	},
	catchOutOfGas: async function (promise) {
		await tryCatch(promise, 'out of gas');
	},
	catchInvalidJump: async function (promise) {
		await tryCatch(promise, 'invalid JUMP');
	},
	catchInvalidOpcode: async function (promise) {
		await tryCatch(promise, 'invalid opcode');
	},
	catchStackOverflow: async function (promise) {
		await tryCatch(promise, 'stack overflow');
	},
	catchStackUnderflow: async function (promise) {
		await tryCatch(promise, 'stack underflow');
	},
	catchStaticStateChange: async function (promise) {
		await tryCatch(promise, 'static state change');
	},
};
