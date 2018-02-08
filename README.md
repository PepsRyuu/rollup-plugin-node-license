# rollup-plugin-node-license

When you're bundling your app, you should be including license information inside those bundles.
This module assumes you are using NPM modules.
If it detects a node_module was loaded at any point during bundling, it will check its package information and will confirm the license using [License Checker](https://github.com/davglass/license-checker/).
License comments are then appended to the generated bundle.

## How to use

Simply load the plugin into your rollup configuration.

```
let NodeLicense = require('rollup-plugin-node-license');

rollup({
    ...
    plugins: [
        new NodeLicense()
    ]
});
```

If you're using Uglify, you should apply the following rule so that the licenses are not removed:

```
uglify({
    output: {
        comments: (node, comment) => {
            if (comment.type === 'comment2') {
                return /^\!/i.test(comment.value);
            }
        }
    }
});
```

After a build, you'll see the license comments at the top of the bundle.