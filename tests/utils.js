QUnit.module('fa.utils');

QUnit.test('objectToMap', function(assert) {
	var assertEqual = function(map1, map2) {
		assert.equal(map1.size, map2.size);
		for(var key of map1.keys()) {
			assert.ok(map2.has(key));
			assert.deepEqual(map1.get(key), map2.get(key));
		}
	};
	
	assertEqual(fa.utils.objectToMap({
		question: 'the ultimate question',
		answer: 42
	}), new Map([
		['question', 'the ultimate question'],
		['answer', 42]
	]));
	
	assertEqual(fa.utils.objectToMap({
		letters: ['a', 'b', 'c', 'd', 'e'],
		1: 'a', 2: 'b', 3: 'c'
	}), new Map([
		['letters', ['a', 'b', 'c', 'd', 'e']],
		[1, 'a'], [2, 'b'], [3, 'c']
	]));
	
	assertEqual(fa.utils.objectToMap({}), new Map());
});
