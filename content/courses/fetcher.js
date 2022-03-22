import courses from './index.json';

export const getAllCourses = () => {
	return {
		data: courses,

		// a=accumulator, c=course, i=index (for iteration)
		courseMap: courses.reduce((a, c, i) => {
			// Assigns each course data to its Id
			a[c.id] = c;

			// Creates an index property to assign the iteration number as its value
			a[c.id].index = i;

			return a;
		}, {}),
	};
};
