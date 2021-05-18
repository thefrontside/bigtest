const jestTemplate = ({ dependencies, browserslist, babel, jest }) => {
  return {
    pkgjson: {
      "scripts": {
        "test:jest": "jest 'src/test/jest.test.js'",
      },
      "dependencies": {
        "@babel/preset-env": `${dependencies['@babel/preset-env']}`,
        "@babel/preset-react": `${dependencies['@babel/preset-react']}`,
        "@testing-library/react": `${dependencies['@testing-library/react']}`,
        "babel-jest": `${dependencies['babel-jest']}`,
        "bigtest":`${dependencies['bigtest']}`,
        "jest": `${dependencies['jest']}`,
        "jest-css-modules-transform": `${dependencies['jest-css-modules-transform']}`,
        "react-test-renderer": `${dependencies['react-test-renderer']}`,
        "ts-jest": `${dependencies['ts-jest']}`,
      },
      browserslist,
      babel,
      jest
    },
    files: []
  }
};

module.exports = {
  jestTemplate
};
