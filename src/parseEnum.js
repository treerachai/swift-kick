const R = require('ramda')

const tapLog = (id) => R.tap(input => console.log(id, input))

const parseName = R.pipe(
	R.match(/\s?[\w]*\s?enum ([^\s:]+).+{/),
	R.prop(1)
)

const parseAssociated = R.pipe(
	R.defaultTo(''),
	R.replace(/^\s*\(/, ''),
	R.replace(/\)?\s*$/, ''),
	R.split(/,\s?/),
	R.reject(R.isEmpty),
	R.map(R.pipe(
		R.split(':'),
		R.map(R.trim),
		R.when(
			R.propEq('length', 1),
			R.prepend(undefined)
		),
		R.zipObj(['name', 'type'])
	))
)
	
const parseCases = R.pipe(
	R.split('}'),
	R.head(),
	R.split(/\scase/),
	R.tail(), // Remove initial `enum ... {`
	R.map(R.pipe(
		R.trim(),
		R.match(/([^(]+)(\([\s\S]+\))?/),
		R.tail,
		R.over(R.lensIndex(1), parseAssociated),
		R.zipObj(['name', 'associated'])
	))
)

const parseEnum = R.converge(
	(name, cases) => ({
		name,
		cases
	}), [
		parseName,
		parseCases
	]
)

module.exports = parseEnum
