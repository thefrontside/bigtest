const cypressTemplate = ({ dependencies }) => {
  return {
    pkgjson: {
      "scripts": {
        "cypress:run": "npx cypress run --spec 'src/test/cypress.spec.js'",
        "test:cypress": "start-server-and-test 'npm run start -- -p 3000' http://localhost:3000 cypress:run",
      },
      "dependencies": {
        "@babel/core": `${dependencies['@babel/core']}`,
        "@bigtest/cypress": `${dependencies['@bigtest/cypress']}`,
        "eslint-plugin-cypress": `${dependencies['eslint-plugin-cypress']}`,
        "start-server-and-test": `${dependencies['start-server-and-test']}`
      },
      "eslintConfig": {
        "extends": [
          "react-app",
          "plugin:cypress/recommended"
        ]
      }
    },
    files: [
      'cypress',
      'cypress.json'
    ]
  }
};

module.exports = {
  cypressTemplate
};
