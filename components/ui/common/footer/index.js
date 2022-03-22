export default function Footer() {
	return (
		<div style={{bottom: 0}} className='mt-5000'>
			<footer className='bg-gray-900 pt-1 mt-6 '>
				<div className='mt-5 flex flex-col items-center'>
					<p className='mb-6 text-white text-sm text-primary-2 font-bold'>
						© {new Date().getFullYear()} Juan Xavier Valverde
					</p>
				</div>
			</footer>
		</div>
	);
}
