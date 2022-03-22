import {Web3Provider} from '@components/providers';
import {Navbar, Footer} from '@components/ui/common';

/*------------------Base Layout------------------------*/

export default function BaseLayout({children}) {
	return (
		<div className='toxic-sunset'>
			<Web3Provider>
				<div className='max-w-7xl mx-auto px-4'>
					<Navbar />
					<div className='fit'> {children} </div>
				</div>
				<div>
					<Footer />
				</div>
			</Web3Provider>
		</div>
	);
}
