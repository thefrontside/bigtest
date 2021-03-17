const bigTestTemplate = ({ dependencies }) => {
  return {
    pkgjson: {
      "scripts": {
        "test:bigtest": "bigtest ci"
      },
      "dependencies": {
        "bigtest": `${dependencies.bigtest}`
      }
    },
    files: [
      'bigtest.json'
    ]
  }
};

module.exports = {
  bigTestTemplate
};
