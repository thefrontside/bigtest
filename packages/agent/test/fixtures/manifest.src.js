module.exports = {
  description: "tests",
  steps: [],
  assertions: [],
  children: [
    {
      description: "test with failing assertion",
      steps: [
        {
          description: "successful step",
          action: async () => {}
        },
      ],
      assertions: [
        {
          description: "failing assertion",
          check: () => { throw new Error("boom") }
        },
        {
          description: "successful assertion",
          check: () => true
        }
      ],
      children: []
    }
  ]
}
