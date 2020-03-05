export default [
  {
    id: "test-1",
    test: "Loggin into the app",
    steps: [
      {
        "click button": "Sign In"
      },
      [
        {
          "modal.await": "Log in to App"
        },
        {
          test: "with good credentials",
          steps: [
            {
              independent: [
                {
                  fillIn: "username.cowboyd"
                },
                {
                  fillIn: "password.hello"
                }
              ]
            },
            {
              "click button": "Submit"
            },
            {
              expect: {
                notification: "Logged into App"
              }
            }
          ]
        },
        {
          test: "with bad credentials",
          steps: [
            {
              independent: [
                {
                  fillIn: "username.cowboyd"
                },
                {
                  fillIn: "password.goodbye"
                }
              ]
            },
            {
              "click button": "Submit"
            },
            {
              expect: {
                notification: "Authentication Failed"
              }
            },
            {
              expect: "not logged in"
            }
          ]
        }
      ]
    ]
  }
];
