# Hero turn

## Lifecycle

1. Increment hunger (max value 4)
1. Perform actions (see [performing actions](#performing-actions)). If hunger is 4 only Devour can be used.
1. If hunger is 4 (Ravenous) then decrease health by 1.
1. If health is 0 hero is dead and game is over.


## Performing actions
Each hero can perform 3 actions (see [actions.md](actions.md)) by default on their turn.
A zombie hero's turn consists of actions.
Every action type can be used multiple times.