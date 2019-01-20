let fs = require('fs');
let licenseChecker = require('license-checker');
let MODULE_NAME_REGEX = /(?:node_modules(?:\\|\/)((?:@[^\\|\/]+(?:\\|\/)[^\\|\/]+)|[^\\|\/]+))/;

function checkLicense (path) {
    return new Promise(resolve => {
        licenseChecker.init({
            start: path
        }, (err, json) => {
            resolve(json);
        })
    });
}

module.exports = function (options) {
    let cache = {};

    return {
        load: (id) => {
            let matches = id.match(MODULE_NAME_REGEX);

            if (matches) {
                let match = matches[matches.length - 1];
                let basePath = id.substring(0, id.indexOf(match) + match.length);
                let json = JSON.parse(fs.readFileSync(`${basePath}/package.json`, 'utf8'));
                let cacheKey = `${json.name}@${json.version}`;

                if (!cache[cacheKey]) {
                    cache[cacheKey] = { basePath, json };
                }
            }
        },

        renderChunk: async (code) => {
            let output = '';
            
            for (let key in cache) {
                let entry = cache[key];
                let license = await checkLicense(entry.basePath);
                
                Object.keys(license).forEach(dep => {
                    output += [
                        `/*!`,
                        ` * @package ${entry.json.name}`,
                        ` * @version ${entry.json.version}`,
                        ` * @license ${license[dep].licenses}`,
                        ` * @author ${license[dep].publisher}`,
                        ` * @url ${license[dep].repository || license[dep].email}`,
                        ` */`
                    ].join('\n');
                });                
            }

            return output + code;
        }
    }
}