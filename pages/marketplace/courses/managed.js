import {useAdmin, useManagedCourses} from '@components/hooks/web3';
import {Button} from '@components/ui/common';
import {CourseFilter, ManagedCourseCard} from '@components/ui/course';
import {BaseLayout} from '@components/ui/layout';
import {MarketHeader} from '@components/ui/marketplace';
import {useState} from 'react';
import {useWeb3} from '@components/providers';
import {Message} from '@components/ui/common';
import {normalizeOwnedCourse} from '@utils/normalize';
import {withToast} from '@utils/toast';

/*-------------------------------------------------------------------*/

const VerificationInput = ({onVerify}) => {
	const [email, setEmail] = useState('');

	return (
		<div className='flex mr-2 relative rounded-md'>
			<input
				value={email}
				onChange={({target: {value}}) => setEmail(value)}
				type='text'
				name='account'
				id='account'
				className='w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md'
				placeholder='Insert buyers email'
			/>
			<Button
				onClick={() => {
					onVerify(email);
				}}>
				Verify
			</Button>
		</div>
	);
};

/*-------------------------------------------------------------------*/

export default function ManagedCourses() {
	const [proofedOwnership, setProofedOwnership] = useState({});
	const [searchedCourse, setSearchedCourse] = useState(null);
	const [filters, setFilters] = useState({state: 'all'});
	const {web3, contract} = useWeb3();
	const {account} = useAdmin({redirectTo: '/marketplace'});
	const {managedCourses} = useManagedCourses(account);

	/*-------------------Verify course by mail-----------------------*/

	const verifyCourse = (email, {hash, proof}) => {
		if (!email) {
			return;
		}

		const emailHash = web3.utils.soliditySha3(email);

		const proofToCheck = web3.utils.soliditySha3(
			{type: 'bytes32', value: emailHash},
			{type: 'bytes32', value: hash}
		);

		proofToCheck === proof
			? setProofedOwnership({
					...proofedOwnership,
					[hash]: true,
			  })
			: setProofedOwnership({
					...proofedOwnership,
					[hash]: false,
			  });
	};

	/*-----------------Change course state----------------------*/
	// If we want to get a dynamic value and we want to pass it in a function as a paramenter
	// We can use square brackets[] instead of . (dot notation) EG:
	// contract.methods[method](courseHash).send   				instead of
	// contract.methods.activateCourse(courseHash).send

	const changeCourseState = async (courseHash, method) => {
		try {
			const result = await contract.methods[method](courseHash).send({
				from: account.data,
			});
			return result;
		} catch (e) {
			console.error(e.message);
			throw new Error(e.message);
		}
	};

	/*----------------Activate/Deactivate-------------------------*/

	const activateCourse = async (courseHash) => {
		withToast(changeCourseState(courseHash, 'activateCourse'));
	};

	const deactivateCourse = async (courseHash) => {
		withToast(changeCourseState(courseHash, 'deactivateCourse'));
	};

	/*-----------------------Search-------------------------------*/

	const searchCourse = async (hash) => {
		// Check if is hexadecimal
		const re = /[0-9A-Fa-f]{6}/g;

		if (hash && hash.length === 66 && re.test(hash)) {
			const course = await contract.methods.getCourseByHash(hash).call();

			if (course.owner !== '0x0000000000000000000000000000000000000000') {
				const normalized = normalizeOwnedCourse(web3)({hash}, course);
				setSearchedCourse(normalized);
				return;
			}
		}

		setSearchedCourse(null);
	};

	/*--------------------------Render-------------------------------*/

	if (!account.isAdmin) {
		return null;
	}

	const renderCard = (course, isSearched) => {
		return (
			<ManagedCourseCard
				key={course.ownedCourseId}
				isSearched={isSearched}
				course={course}>
				<VerificationInput
					onVerify={(email) => {
						verifyCourse(email, {
							hash: course.hash,
							proof: course.proof,
						});
					}}
				/>

				{proofedOwnership[course.hash] && (
					<div className='mt-2'>
						<Message>Verified!</Message>
					</div>
				)}

				{proofedOwnership[course.hash] === false && (
					<div className='mt-2'>
						<Message type='danger'>Wrong Proof!</Message>
					</div>
				)}

				{course.state === 'purchased' && (
					<div className='mt-2'>
						<Button onClick={() => activateCourse(course.hash)} variant='green'>
							Activate
						</Button>

						<Button onClick={() => deactivateCourse(course.hash)} variant='red'>
							Deactivate
						</Button>
					</div>
				)}
			</ManagedCourseCard>
		);
	};

	/*-----------------------Filter courses------------------------------*/

	const filteredCourses = managedCourses.data
		?.filter((course) => {
			if (filters.state === 'all') {
				return true;
			}

			return course.state === filters.state;
		})
		.map((course) => renderCard(course));

	/*-------------------------------------------------------------------*/

	return (
		<>
			<MarketHeader />

			<CourseFilter
				onSearchSubmit={searchCourse}
				onFilterSelect={(value) => setFilters({state: value})}
			/>

			<section className='grid grid-cols-1 pb-40 mb-40'>
				{searchedCourse && (
					<div>
						<h1 className='text-2xl font-bold p-5'>Search result:</h1>
						{renderCard(searchedCourse, true)}
					</div>
				)}

				<h1 className='text-2xl font-bold p-5 '>All Courses</h1>

				{filteredCourses}

				{filteredCourses?.length === 0 && (
					<div className='mb-40 pb-40'>
						<Message type='warning'>There are no courses to display</Message>
					</div>
				)}
			</section>
		</>
	);
}

ManagedCourses.Layout = BaseLayout;
