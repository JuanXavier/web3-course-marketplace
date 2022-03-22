import {useWeb3} from '@components/providers';
import {ActiveLink, Button} from '@components/ui/common';
import {useAccount} from '@components/hooks/web3';
import {useRouter} from 'next/router';
import Link from 'next/link';

/*------------------------------------------------------------*/

export default function Navbar() {
	const {connect, isLoading, requireInstall} = useWeb3();
	const {account} = useAccount();
	const {pathname} = useRouter();
	const navClass = 'font-medium mr-6 text-gray-600 hover:text-black';

	return (
		<section>
			<div className='relative pt-6 px-4 sm:px-6 lg:px-8'>
				<nav className='relative' aria-label='Global'>
					<div className='flex flex-col xs:flex-row justify-between items-center'>
						<div>
							<ActiveLink href='/'>
								<a className={`${navClass}`}>Home</a>
							</ActiveLink>
							<ActiveLink href='/marketplace'>
								<a className={`${navClass}`}>Marketplace</a>
							</ActiveLink>
							<Link href='/#'>
								<a className={`${navClass}`}>Blogs</a>
							</Link>
						</div>
						<div className='text-center'>
							<ActiveLink href='/'>
								<a className={`${navClass}`}>Wishlist</a>
							</ActiveLink>

							{isLoading ? (
								<Button disabled={true}> Loading... </Button>
							) : account.data ? (
								<Button hoverable={false} className='cursor-default'>
									Welcome back {account.isAdmin && 'Administrator'}
								</Button>
							) : requireInstall ? (
								<Button
									onClick={() => window.open('https://metamask.io/download', '_blank')}>
									Install Metamask
								</Button>
							) : (
								<Button onClick={connect}> Connect </Button>
							)}
						</div>
					</div>
				</nav>
			</div>
			{/* {account.data && !pathname.includes('/marketplace') && (
				<div className='flex justify-end pt-1 sm:px-4 lg:px-8'>
					<div className='text-white bg-indigo-600 rounded-lg p-2'>{account.data}</div>
				</div>
			)} */}
		</section>
	);
}
