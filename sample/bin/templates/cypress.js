const cypressTemplate = ({ dependencies }) => {
  return {
    pkgjson: {
      "scripts": {
        "cypress:run": "npx cypress run --spec 'src/test/cypress.spec.js'",
        "test:cypress": "start-server-and-test 'npm run start -- -p 3000' http://localhost:3000 cypress:run",
      },
      "dependencies": {
        "@interactors/with-cypress": `${dependencies['@interactors/with-cypress']}`,
        "cypress": `${dependencies['cypress']}`,
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
