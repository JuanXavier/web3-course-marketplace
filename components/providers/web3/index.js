import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import {createContext, useEffect, useState, useMemo, useContext} from 'react';
import {setupHooks} from './hooks/setupHooks';
import {loadContract} from '@utils/loadContract';

/*----------------------Locate web3 provider------------------------*/
// react's createContext for web3

const Web3Context = createContext(null);

/*----------------Helpers-------------------*/

const setListeners = (provider) => {
	provider.on('chainChanged', (_) => window.location.reload());
};

const createWeb3State = ({web3, provider, contract, isLoading}) => {
	return {
		web3,
		provider,
		contract,
		isLoading,
		hooks: setupHooks({web3, provider, contract}),
	};
};

/*------------------------------------------*/

export default function Web3Provider({children}) {
	const [web3Api, setWeb3Api] = useState(
		createWeb3State({
			web3: null,
			provider: null,
			contract: null,
			isLoading: true,
		})
	);

	/*------------Load injected provider from Metamask and contract------------*/

	useEffect(() => {
		const loadProvider = async () => {
			const provider = await detectEthereumProvider();

			if (provider) {
				const web3 = new Web3(provider);
				const contract = await loadContract('CourseMarketplace', web3);
				console.log(contract);
				setListeners(provider);

				setWeb3Api(
					createWeb3State({
						web3,
						provider,
						contract,
						isLoading: false,
					})
				);
			} else {
				setWeb3Api((api) => ({...api, isLoading: false}));
				console.log('Please install Metamask');
			}
		};

		loadProvider();
	}, []);

	/*-----------------------CONNECT TO WALLET-----------------------------*/

	const _web3Api = useMemo(() => {
		const {web3, provider, isLoading} = web3Api;

		return {
			...web3Api,
			requireInstall: !isLoading && !web3,
			connect: provider
				? async () => {
						try {
							await provider.request({method: 'eth_requestAccounts'});
						} catch {
							location.reload();
						}
				  }
				: () => {
						console.error('Cant connect to Metamask. Try reloading the page');
				  },
		};
	}, [web3Api]);

	return <Web3Context.Provider value={_web3Api}>{children}</Web3Context.Provider>;
}

/*----------------------------------------------*/

export function useWeb3() {
	return useContext(Web3Context);
}

/*----------------------------------------------*/

export function useHooks(cb) {
	const {hooks} = useWeb3();
	return cb(hooks);
}
