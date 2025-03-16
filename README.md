# A productivity tool to restrict time spent on certain websites

## Features:
- User controlled domains
- User controlled time allowance on each domain
- Time spent is reset every day at midnight


Issues:
- [X] When a user removes the limit, the sites should be reset
- [X] When a user enters a new website, the sites should be reset
- [X] When clicked RemoveBtn, while on the site, does not delete sites[site]
- [X] Does not reset at 12 am
- [ ] www.twitch.tv needed instead of twitch.tv

Cases:
- When user enters a limit on site A, while already on site A

1. Uses npm tldts to get domain name, not hostname (without www.)
2. Extensions don't allow import, so this project uses Webpack to bundle the npm package with the background.js file
3. Steps:
    1. npm install tldts
    2. Modify manifest.json to read from dist folder
        "background" {
            "service_worker" : "dist/background.js"
    }
    3. npm install --save-dev webpack webpack-cli
    4. Create webpack.config.js
        const path = require('path');

        module.exports = {
            entry: './background.js',
            output: {
                filename: 'background.js',
                path: path.resolve(__dirname, 'dist'),
            },
            mode: 'production',
        };
    5. Run webpack on every change
        npx webpack
    6. Alternatively, automatically updates when file is changed        npx webpack --watch
        

