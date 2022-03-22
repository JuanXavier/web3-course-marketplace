const SIZE = {
	sm: 'p-2 text-sm xs:px-4',
	md: 'p-3 text-base xs:px-6',
	lg: 'p-3 text-lg xs:px-8',
};

export default function Button({
	children,
	className,
	variant = 'purple',
	hoverable = 'true',
	size = 'md',
	...rest
}) {
	const sizeClass = SIZE[size];

	const variants = {
		purple: `text-white bg-indigo-600 ${hoverable && 'hover:bg-indigo-700'}`,
		green: `text-white bg-green-600 ${hoverable && 'hover:bg-green-700'}`,
		red: `text-white bg-red-600 ${hoverable && 'hover:bg-red-700'}`,
		lightPurple: `text-indigo-700 bg-indigo-100 ${hoverable && 'hover:bg-indigo-200'}`,
		white: `text-black bg-white ${hoverable && 'hover:bg-gray-50'}`,
	};

	return (
		<button
			{...rest}
			className={`${sizeClass} disabled:opacity-50 disabled:cursor-not-allowed 
			xs:px-8 xs:py-3 rounded-lg border font-medium  ${className} ${variants[variant]}`}>
			{children}
		</button>
	);
}