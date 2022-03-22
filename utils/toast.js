import {toast} from 'react-toastify';

export const withToast = (promise) => {
	toast.promise(
		promise,
		{
			pending: {
				render() {
					return (
						<div className='p-6 py-2'>
							<p className='mb-2'>Hang tight! Your transaction is being processed.</p>
						</div>
					);
				},
				icon: false,
			},

			success: {
				render({data}) {
					return (
						<div>
							<p className='font-bold'> Tx: {data.transactionHash.slice(0, 15)}...</p>
							<p> has been succesfully processed </p>
							<a
								href={`https://rinkeby.etherscan.io/tx/${data.transactionHash}`}
								target='_blank'>
								<i className='text-indigo-600 underline'>See transaction details</i>{' '}
							</a>
						</div>
					);
				},
				icon: '🟢',
			},

			error: {
				render({data}) {
					return <div>{data.message ?? 'Transaction has failed'}</div>;
				},
			},
		},
		{
			closeButton: true,
			position: toast.POSITION.TOP_LEFT,
		}
	);
};
