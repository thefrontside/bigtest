Feature: calculator
  Scenario: adding 2 numbers
    Given I take the number 5
    When I take the number 3
    And I add them
    Then I will have 8