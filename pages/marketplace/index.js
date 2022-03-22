import {CourseList, CourseCard} from '@components/ui/course';
import {BaseLayout} from '@components/ui/layout';
import {getAllCourses} from '@content/courses/fetcher';
import {useOwnedCourses, useWalletInfo} from '@components/hooks/web3';
import {Button, Loader} from '@components/ui/common';
import {OrderModal} from '@components/ui/order';
import {useState} from 'react';
import {MarketHeader} from '@components/ui/marketplace';
import {useWeb3} from '@components/providers';
import {withToast} from '@utils/toast';

/*----------------------------MAIN MARKETPLACE--------------------------------*/

export default function Marketplace({courses}) {
	const {web3, contract, requireInstall} = useWeb3();
	const {hasConnectedWallet, isConnecting, account} = useWalletInfo();
	const {ownedCourses} = useOwnedCourses(courses, account.data);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [busyCourseId, setBusyCourseId] = useState(null);
	const [isNewPurchase, setIsNewPurchase] = useState(true);

	/*----------------------Purchase on submit in Modal----------------------------*/

	const purchaseCourse = async (order, course) => {
		//Convert course id to hexadecimal
		const hexCourseId = web3.utils.utf8ToHex(course.id);

		// email hash + course hash
		const orderHash = web3.utils.soliditySha3(
			{type: 'bytes16', value: hexCourseId},
			{type: 'address', value: account.data}
		);

		// Course price
		const value = web3.utils.toWei(String(order.price));

		setBusyCourseId(course.id);

		if (isNewPurchase) {
			// if it is a new purchase,
			// the input email is hashed and the _purchaseCourse() executes
			// If it is an activation repurchase, execite repurchase course
			const emailHash = web3.utils.soliditySha3(order.email);

			const proof = web3.utils.soliditySha3(
				{type: 'bytes32', value: emailHash},
				{type: 'bytes32', value: orderHash}
			);
			console.log(proof);

			withToast(_purchaseCourse({hexCourseId, proof, value}, course));
		} else {
			withToast(_repurchaseCourse({courseHash: orderHash, value}, course));
		}
	};

	/*------------------------Purchase----------------------------------*/

	const _purchaseCourse = async ({hexCourseId, proof, value}, course) => {
		try {
			const result = await contract.methods
				.purchaseCourse(hexCourseId, proof)
				.send({from: account.data, value});

			ownedCourses.mutate([
				...ownedCourses.data,
				{
					...course,
					proof,
					state: 'purchased',
					owner: account.data,
					price: value,
				},
			]);

			return result;
		} catch (error) {
			throw new Error(error.message);
		} finally {
			setBusyCourseId(null);
		}
	};

	/*----------------------Repurchase----------------------------------*/

	const _repurchaseCourse = async ({courseHash, value}, course) => {
		try {
			const result = await contract.methods
				.repurchaseCourse(courseHash)
				.send({from: account.data, value});

			const index = ownedCourses.data.findIndex((c) => c.id === course.id);

			if (index >= 0) {
				ownedCourses.data[index].state = 'purchased';
				ownedCourses.mutate(ownedCourses.data);
			} else {
				ownedCourses.mutate();
			}

			return result;
		} catch (error) {
			throw new Error(error.message);
		} finally {
			setBusyCourseId(null);
		}
	};

	const cleanupModal = () => {
		setSelectedCourse(null);
		setIsNewPurchase(true);
	};

	/*-------------------------------------------------------------------*/

	return (
		<>
			<MarketHeader />
			<div style={{marginBottom: 88}}>
				<CourseList courses={courses}>
					{(course) => {
						const owned = ownedCourses.lookup[course.id];

						return (
							<CourseCard
								key={course.id}
								course={course}
								state={owned?.state}
								disabled={!hasConnectedWallet}
								/*----------------Footer starts-----------------*/
								Footer={() => {
									if (requireInstall) {
										return (
											<Button size='sm' disabled={true} variant='lightPurple'>
												Install{' '}
											</Button>
										);
									}

									if (isConnecting) {
										return (
											<Button size='sm' disabled={true} variant='lightPurple'>
												<Loader size='sm' />
											</Button>
										);
									}

									if (!ownedCourses.hasInitialResponse) {
										<Button disabled={true} size='sm'>
											{hasConnectedWallet ? 'Loading...' : 'Connect'}
										</Button>;
									}

									const isBusy = busyCourseId === course.id;

									if (owned) {
										return (
											<>
												<div className='flex'>
													<Button
														onClick={() => alert('You are owner of this course!')}
														size='sm'
														disabled={false}
														variant='white'>
														Owned &#10004;
													</Button>

													{owned.state === 'deactivated' && (
														<div className='ml-1'>
															<Button
																size='sm'
																disabled={isBusy}
																onClick={() => {
																	setIsNewPurchase(false);
																	setSelectedCourse(course);
																}}
																variant='purple'>
																{isBusy ? (
																	<div className='flex'>
																		<Loader size='sm' />
																		<div className='ml-2'> In progress</div>
																	</div>
																) : (
																	<div> Fund to activate </div>
																)}
															</Button>
														</div>
													)}
												</div>
											</>
										);
									}

									return (
										<Button
											size='sm'
											onClick={() => setSelectedCourse(course)}
											variant='lightPurple'
											disabled={!hasConnectedWallet || isBusy}>
											{isBusy ? (
												<div className='flex'>
													<Loader size='sm' />
													<div className='ml-2'> In progress</div>
												</div>
											) : (
												<div> Purchase </div>
											)}
										</Button>
									);
								}}

								/*----------------Footer ends-----------------*/
							/>
						);
					}}
				</CourseList>
			</div>
			{/*------------------------------------*/}
			{selectedCourse && (
				<OrderModal
					course={selectedCourse}
					isNewPurchase={isNewPurchase}
					onSubmit={(formData, course) => {
						purchaseCourse(formData, course);
						cleanupModal();
					}}
					onClose={cleanupModal}
				/>
			)}
		</>
	);
}

export function getStaticProps() {
	const {data} = getAllCourses();

	return {
		props: {
			courses: data,
		},
	};
}

Marketplace.Layout = BaseLayout;
