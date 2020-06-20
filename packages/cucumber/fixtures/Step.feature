Feature: calculator
  Scenario: adding
    Given I take the number 5
    And I take the number 3
    When I add them
    Then I will have 8