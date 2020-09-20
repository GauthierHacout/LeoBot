const fs = require('fs');
const path = require('path');

/**
 * getPathToAsset will return the absolute path to the asset file that was asked for
 * or the default asset of the category if the asset doesn't exist.
 * @param {string} category the name of the folder containing the asset.
 * @param {string} name the name of the asset file.
 * @return {string} the absolute path to the asset file
 */
module.exports = function getPathToAsset(category, name) {
    const pathToAsset = path.join(__dirname, category, `${name}.png`);

    if (fs.existsSync(pathToAsset)) {
        return pathToAsset;
    }
    return path.join(__dirname, category, 'default.png');
};
