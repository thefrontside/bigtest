export default {
  description: "Signing In",
  steps: [
    {
      description: "given a user",
      action: async (context) => ({ ...context, user: { username: "cowboyd" } })
    },
    {
      description: "when I fill in the login form",
      action: async () => {}
    },
    {
      description: "when I press the submit button",
      action: async () => {}
    }
  ],
  assertions: [
    {
      description: "then I am logged in",
      check: () => true
    },
    {
      description: "then I am on the homepage",
      check: () => true
    }
  ],
  children: [
    {
      description: "when I log out",
      steps: [
        {
          description: "when I click on the logout button",
          action: async () => {}
        }
      ],
      assertions: [
        {
          description: "it takes me back to the homepage",
          check: () => {}
        },
        {
          description: "My username is no longer in the top bar",
          check: () => {}
        }
      ],
      children: []
    },
    {
      description: "when I go to the main navigation page",
      steps: [
        {
          description: "I click the hamburger button",
          action: async () => {}
        }
      ],
      assertions: [
        {
          description: "I see my username",
          check: () => {}
        }
      ],
      children: []
    }
  ]
}
