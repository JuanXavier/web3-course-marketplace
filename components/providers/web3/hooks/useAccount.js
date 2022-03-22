import {useEffect} from 'react';
import useSWR from 'swr';

/*-------------------------------------------------------------*/

const adminAddresses = {
	'0x0a4107076f1cc6be7f6772ae1d2a4a8b9c806c4369c2c8eab08c520cc5f83153': true,
	'0x1b0d8e52c643771d5b3c9ec3b78b6f00137c63453b31ca5b173931294b5f0a08': true,
};

/*-------------------------------------------------------------*/

export const handler = (web3, provider) => () => {
	const {data, mutate, ...rest} = useSWR(
		() => (web3 != null ? 'web3/accounts' : null),
		async () => {
			const accounts = await web3.eth.getAccounts();
			const account = accounts[0];

			if (!account) {
				throw new Error(
					'Cannot retrieve an account. Please connect to Metamask or refresh the browser'
				);
			}
			return account;
		}
	);

	/*------------Changes in Metamask------------*/

	useEffect(() => {
		const mutator = (accounts) => mutate(accounts[0] ?? null);
		provider?.on('accountsChanged', mutator);

		return () => {
			provider?.removeListener('accountsChanged', mutator);
		};
	}, [provider]);

	/*------------------------------------------*/

	return {
		data,
		isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
		mutate,
		...rest,
	};
};
