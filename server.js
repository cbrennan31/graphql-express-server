const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
// GraphQL schema
const schema = buildSchema(`
    type Query {
      course(id: Int!): Course
      courses(topic: String): [Course]
		},
    type Mutation {
      updateCourseTopic(input: UpdateCourseTopicInput!): UpdateCourseTopicPayload
		},
    type Course {
			id: Int
			title: String
			author: String
			description: String
			topic: String
			url: String,
			instructor: Instructor! 
    },
    type Instructor {
      id: Int
      name: String
      courses: [Course!]!
		},
		input UpdateCourseTopicInput {
			id: Int!
			topic: String!
		},
		type UpdateCourseTopicPayload {
			course: Course
		}
`);
const coursesData = [
	{
		id: 1,
		title: 'The Complete Node.js Developer Course',
		author: 'Andrew Mead, Rob Percival',
		description:
			'Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!',
		topic: 'Node.js',
		url: 'https://codingthesmartway.com/courses/nodejs/',
		instructorId: 1,
	},
	{
		id: 2,
		title: 'Node.js, Express & MongoDB Dev to Deployment',
		author: 'Brad Traversy',
		description:
			'Learn by example building & deploying real-world Node.js applications from absolute scratch',
		topic: 'Node.js',
		url: 'https://codingthesmartway.com/courses/nodejs-express-mongodb/',
		instructorId: 2,
	},
	{
		id: 3,
		title: 'JavaScript: Understanding The Weird Parts',
		author: 'Anthony Alicea',
		description:
			'An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.',
		topic: 'JavaScript',
		url: 'https://codingthesmartway.com/courses/understand-javascript/',
		instructorId: 1,
	},
];
const instructorsData = [
	{
		id: 1,
		name: 'Casey',
	},
	{
		id: 2,
		name: 'Aaron',
	},
];
const getCourse = function(variables) {
	const id = variables.id;
	const course = coursesData.filter(course => {
		return course.id == id;
	})[0];
	course.instructor = instructorsData.find(
		instructor => instructor.id === course.id,
	);
	return course;
};

const getCourses = async function(variables) {
	const findCourses = () =>
		new Promise(res => {
			setTimeout(() => {
				const coursesWithInstructor = coursesData.map(course => {
					const instructor = instructorsData.find(
						instructor => instructor.id === course.instructorId,
					);
					return { ...course, instructor };
				});
				res(coursesWithInstructor);
			}, 500);
		});

	const courses = await findCourses();

	if (variables.topic) {
		const topic = variables.topic;
		return courses.filter(course => course.topic === topic);
	} else {
		return courses;
	}
};

const updateCourseTopic = ({ input: { id, topic } }) => {
	const course = coursesData.find(course => course.id === id);
	const index = coursesData.indexOf(course);
	if (course) {
		course.topic = topic;
	}
	if (index !== -1) {
		coursesData[index] = course;
	}

	return { course };
};

const root = {
	course: getCourse,
	courses: getCourses,
	updateCourseTopic,
};
// Create an express server and a GraphQL endpoint
const app = express();
app.use(
	'/graphql',
	express_graphql({
		schema,
		rootValue: root,
		graphiql: true,
	}),
);
app.listen(4000, () =>
	console.log('Express GraphQL Server Now Running On localhost:4000/graphql'),
);
