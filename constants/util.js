
/** Implementation of the Fisher-Yates algorithm used to shuffle an array
 * @param {[]} array the array we want to shuffle
 * @return {[]} the provided array with a different order
 */
function shuffle(array) {
    const copy = [...array];
    let currentIndex = array.length;
    let temp;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random()*currentIndex);
        currentIndex -= 1;
        // Swap array[randomIndex] with array[currentIndex]
        temp = copy[currentIndex];
        copy[currentIndex] = copy[randomIndex];
        copy[randomIndex] = temp;
    }

    return copy;
};

/** Convert an array into a matrix (a 2D array)
 * Example : function([1, 2, 3, 4, 5, 6], 3) => [[1, 2, 3], [4, 5, 6]]
 * @param {[]} array the array you want to transform
 * @param {int} index the length of the subarray created
 * @return {[][]} a 2D array
 */
function fromArrayToMatrix(array, index) {
    const copy = [...array];
    const matrix = [];
    while (copy.length) {
        matrix.push(copy.splice(0, index));
    };
    return matrix;
};

exports.shuffle = shuffle;
exports.fromArrayToMatrix = fromArrayToMatrix;
