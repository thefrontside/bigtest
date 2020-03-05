export default [
  {
    id: "test-1",
    test: "Logging into the app",
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
  },
  { id: 'test-2', test: "Let's see if this works"},
  { id: 'test-3', test: "Very nice"}
];
