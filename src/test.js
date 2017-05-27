var test = { };

test.isArrayOf = function(subTest) {
    function inner(data) {
        return Array.isArray(data) &&
            data.every(subTest);
    }
    return inner;
}

test.isNumericArray = test.isArrayOf(Number.isFinite);

export default test;
