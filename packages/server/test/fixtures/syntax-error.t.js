export default {
  description: "Signing In",
  steps: [
    {
      description: "given a user",
      action: async (context) => ({ ..context, user: { username: "cowboyd" } })
    },
  ],
};
