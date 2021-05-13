const baseTemplate = ({ dependencies }) => {
  return {
    pkgjson : {
      "name": "bigtest-sample-app",
      "version": "0.0.0",
      "private": true,
      "description": "BigTest Sample App",
      "repository": "https://github.com/thefrontside/bigtest.git",
      "author": "Frontside Engineering <engineering@frontside.com>",
      "license": "MIT",
      "scripts": {
        "start": "parcel src/index.html",
        "build": "parcel build src/index.html --no-cache"
      },
      "dependencies": {
        "parcel": `${dependencies.parcel}`,
        "react": `${dependencies.react}`,
        "react-dom": `${dependencies['react-dom']}`,
        "react-router-dom": `${dependencies['react-router-dom']}`,
        "typescript": `${dependencies.typescript}`,
        "eslint": `${dependencies.eslint}`
      },
      "volta": {
        "node": "12.16.0",
        "yarn": "1.19.1"
      }
    },
    files: [
      'package-lock.json',
      'yarn.lock',
      'README.md',
      'src'
    ]
  }
};

module.exports = {
  baseTemplate
};
