import Image from 'next/image';
import {useEthPrice, COURSE_PRICE} from '@components/hooks/useEthPrice';
import {Loader} from '@components/ui/common';

export default function EthRates() {
	const {eth} = useEthPrice();

	return (
		<div className='flex flex-col xs:flex-row text-center'>
			<div className='p-6 border justify-center drop-shadow mr-2 rounded-md'>
				<p className='text-lg text-gray-500'>Current ETH Price</p>
				<div className='flex items-center justify-center'>
					{eth.data ? (
						<>
							<Image
								alt='img'
								layout='fixed'
								height='35'
								width='35'
								src='/small-eth.webp'
							/>
							<span className='text-xl font-bold'>= $ {eth.data} USD</span>
						</>
					) : (
						<div className='w-full flex justify-center'>
							<Loader size='md' />
						</div>
					)}
				</div>
			</div>

			{/*-------------------------------------------------------------------*/}

			<div className='p-6 border drop-shadow rounded-md'>
				<p className='text-lg text-gray-500'>Price per course</p>

				<div className='flex items-center justify-center'>
					{eth.data ? (
						<>
							<span className='text-xl font-bold'> {eth.perItem} </span>
							<Image
								alt='img'
								layout='fixed'
								height='35'
								width='35'
								src='/small-eth.webp'
							/>
							<span className='text-xl font-bold'> (${COURSE_PRICE})</span>
						</>
					) : (
						<div className='w-full flex justify-center'>
							<Loader size='md' />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
