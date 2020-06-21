Feature: calculator
  Scenario: adding
    Given I take the number 5
    When I take the number 3
    And I add them
    Then I will have 8