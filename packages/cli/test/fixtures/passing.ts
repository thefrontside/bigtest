export default {
  description: "Passing test",
  steps: [
    {
      description: "some step",
      action: async () => true
    }
  ],
  assertions: [
    {
      description: "check the thing",
      check: () => true
    }
  ],
  children: []
}
