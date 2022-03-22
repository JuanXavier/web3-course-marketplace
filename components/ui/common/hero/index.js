import Link from 'next/link';
import {Button} from '..';

export default function Hero() {
	return (
		<section className='lg:2/6 text-center my-28'>
			<div className='text-6xl font-semibold text-gray-900 leading-none'>
				Grow your career as a developer
			</div>
			<div className='mt-6 text-xl font-light text-true-gray-500 antialiased'>
				Learn programming and web development the easy way! Get unlimited access to all of
				our courses.
			</div>
		</section>
	);
}
