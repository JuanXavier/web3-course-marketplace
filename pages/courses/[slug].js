import {useAccount, useOwnedCourse} from '@components/hooks/web3';
import {useWeb3} from '@components/providers';
import {Message, Modal} from '@components/ui/common';
import {CourseHero, Keypoints, Curriculum} from '@components/ui/course';
import {BaseLayout} from '@components/ui/layout';
import {getAllCourses} from '@content/courses/fetcher';
import Link from 'next/link';

export default function Course({course}) {
	const {isLoading} = useWeb3();
	const {account} = useAccount();
	const {ownedCourse} = useOwnedCourse(course, account.data);
	const courseState = ownedCourse.data?.state;
	const isLocked =
		!courseState || courseState === 'purchased' || courseState === 'deactivated';

	return (
		<>
			<div className='py-4 '>
				<CourseHero
					hasOwner={!!ownedCourse.data}
					title={course.title}
					description={course.description}
					image={course.coverImage}
				/>
			</div>
			<div className='mb-24 '>
				<div className='mb-6'>
					<Keypoints points={course.wsl} />
				</div>
				{courseState && (
					<div className='max-w-5xl mx-auto '>
						{courseState === 'purchased' && (
							<Message type='warning' className='font-bold'>
								Course is purchased and waiting for activation. Process can take up to 24
								hours.
								<br />
								For activating your course, please send an email from the email address
								registered to juanxaviervm@gmail.com containing the proof of the course
								you would like to activate. <br />
								<br />
								<Link href='/marketplace/courses/owned'>GET YOUR COURSE PROOF HERE</Link>
							</Message>
						)}

						{courseState === 'activated' && (
							<Message type='success'>
								{' '}
								We wish you happy watching of your course!{' '}
							</Message>
						)}

						{courseState === 'deactivated' && (
							<Message type='danger'>
								Course has been deactivated due to incorrect purchase data. The
								functionality to watch the course has been temporarily disabled.
								<i className='block font-normal'>
									Please contact customer support at customer@support.com
								</i>
							</Message>
						)}
					</div>
				)}

				<Curriculum isLoading={isLoading} locked={isLocked} courseState={courseState} />
				<Modal />
			</div>
		</>
	);
}

/*---------------Customized path for each course-----------------*/
// NextJS function for dynamic routes

export function getStaticPaths() {
	const {data} = getAllCourses();

	return {
		// map over the data to extract the slugs from each course to transform it into the path
		paths: data.map((c) => ({
			params: {
				slug: c.slug,
			},
		})),
		fallback: false,
	};
}

/*-------------Return data for a single course--------------------*/

export function getStaticProps({params}) {
	const {data} = getAllCourses();

	// The zero at the end is for obtaining the array item at index zero
	const course = data.filter((c) => c.slug === params.slug)[0];

	return {
		props: {
			course,
		},
	};
}

Course.Layout = BaseLayout;
