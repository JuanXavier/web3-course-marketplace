import {Hero} from '@components/ui/common';
import {CourseList, CourseCard} from '@components/ui/course';
import {BaseLayout} from '@components/ui/layout';
import {WalletBar} from '@components/ui/web3';
import {getAllCourses} from '@content/courses/fetcher';

/*---------------------MAIN PAGE---------------------------*/

export default function Home({courses}) {
	return (
		<>
			<div className='pt-4'>
				<WalletBar />
			</div>
			<Hero />
			<div style={{marginBottom: 88}}>
				<CourseList courses={courses}>
					{(course) => <CourseCard key={course.id} course={course} />}
				</CourseList>
			</div>
		</>
	);
}

/*------------------Fetch courses data---------------------*/
// Exports courses data as props

export function getStaticProps() {
	const {data} = getAllCourses();

	return {
		props: {
			courses: data,
		},
	};
}

Home.Layout = BaseLayout;
