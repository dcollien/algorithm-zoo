
const breadthFirst = `OPEN = Queue containing START
CLOSED = empty Set
while OPEN is not empty and the first item in OPEN is not the GOAL:
  current = remove first item in OPEN
  add current to CLOSED
  for each neighbour in neighbours of current:
    if neighbour not in OPEN and neighbour not in CLOSED:
      add neighbour to the end of OPEN
      set neighbour's parent to current

if first item in OPEN is the goal:
  return the path of parents back to the START
else:
  return no goal found`;


const depthFirst = `OPEN = Stack containing START
CLOSED = empty Set
while OPEN is not empty and the first item in OPEN is not the GOAL:
  current = remove first item in OPEN
  add current to CLOSED
  for each neighbour in neighbours of current:
    if neighbour not in OPEN and neighbour not in CLOSED:
      add neighbour to the front of OPEN
      set neighbour's parent to current

if first item in OPEN is the goal:
  return the path of parents back to the start
else:
  return no goal found`;

const costDirected = `OPEN = PriorityQueue containing START
CLOSED = empty Set
while OPEN is not empty and the lowest rank item in OPEN is not the GOAL:
  current = remove lowest rank item from OPEN
  add current to CLOSED
  for each neighbour in neighbours of current:
    cost = g(current) + movementCost(current, neighbour)
    if neighbor in OPEN and cost less than g(neighbor):
      remove neighbor from OPEN, because new path is better
    if neighbour not in OPEN and neighbour not in CLOSED:
      set g(neighbour) to cost
      add neighbour to OPEN with rank g(neighbour)
      set neighbour's parent to current

if lowest ranked item in OPEN is the goal:
  return the path of parents back to the start
else:
  return no goal found`;

const greedy = `OPEN = PriorityQueue containing START
CLOSED = empty Set
while OPEN is not empty and the lowest rank item in OPEN is not the GOAL:
  current = remove lowest rank item from OPEN
  add current to CLOSED
  for each neighbour in neighbours of current:
    if neighbour not in OPEN and neighbour not in CLOSED:
      add neighbour to OPEN with rank h(neighbour)
      set neighbour's parent to current

if lowest ranked item in OPEN is the goal:
  return the path of parents back to the start
else:
  return no goal found`;

const aStar = `OPEN = PriorityQueue containing START
CLOSED = empty Set
while OPEN is not empty and the lowest rank item in OPEN is not the GOAL:
  current = remove lowest rank item from OPEN
  add current to CLOSED
  for each neighbour in neighbours of current:
    cost = g(current) + movementCost(current, neighbour)
    if neighbor in OPEN and cost less than g(neighbor):
      remove neighbor from OPEN, because new path is better
    if neighbor in CLOSED and cost less than g(neighbor):
      remove neighbor from CLOSED, in case heurstic isn't admissible
    if neighbour not in OPEN and neighbour not in CLOSED:
      set g(neighbour) to cost
      add neighbour to OPEN with rank g(neighbour) + h(neighbour)
      set neighbour's parent to current

if lowest ranked item in OPEN is the goal:
  return the path of parents back to the start
else:
  return no goal found`;

const iterativeDeepening = `ids(start):
  bound = 0
  loop:
    parents = Empty Map of Node -> Parent
    visited = Empty Set
    result = search(start, bound, parents, visited)
    if result is GOAL_VALUE:
      return the path of parents back to the start
    if result is NO_GOAL_VALUE:
      return no goal found
    bound = bound + 1

search(node, bound, parents, visited):
  if bound is 0 then return bound
  if node is the GOAL then return GOAL_VALUE

  isDeadEnd = true

  add node to visited

  for each neighbour in neighbours of current:
    if neighbour not in visited:
      set parents[neighbour] to current
      result = search(neighbour, bound - 1, parents, visited)
      if result is GOAL_VALUE:
        return result
      else if result is not NO_GOAL_VALUE:
        isDeadEnd = false

  remove node from visited

  if isDeadEnd:
    return NO_GOAL_VALUE
  else:
    return bound`;

const IDAstar = `ida_star(start):
  bound = h(start)
  loop:
    parents = Empty Map of Node -> Parent
    visited = Empty Set
    result = search(start, 0, bound, parents, visited)
    if result is GOAL_VALUE:
      return the path of parents from the start
    if result is ∞ :
      return no goal found
    bound = result

search(node, g, bound, parents, visited):
  f = g + h(node)
  if f > bound then return f
  if node is the GOAL then return GOAL_VALUE

  add node to visited

  min = ∞
  for each neighbour in neighbours of current:
    if neighbour not in visited:
      set parents[neighbour] to current
      cost = movementCost(current, neighbour)
      result = search(neighbour, g + cost, bound, parents, visited)
      if result is GOAL_VALUE:
        return result
      if result < min:
        min = result

  remove node from visited

  return min`;

const biCostDirected = `OPEN = PriorityQueue with START and END
set START's side to SIDE_A
set END's side to SIDE_B

CLOSED = empty Set
found = false

while OPEN is not empty and not found:
  current = remove lowest rank item from OPEN

  if current's side is BOTH:
    found = true
  else:
    add current to CLOSED
    for each neighbour in neighbours of current:
      cost = g(current) + movementCost(current, neighbour)
      if neighbor in OPEN and cost less than g(neighbor):
        remove neighbor from OPEN, because new path is better
      if neighbour not in OPEN and neighbour not in CLOSED:
        set g(neighbour) to cost
        add neighbour to OPEN with rank g(neighbour)
        set neighbour's parent to current
        set neighbour's side to the same as current
      else if neighbour's side isn't current's side:
        set neighbour's side to BOTH

if lowest ranked item in OPEN's side is BOTH:
  start_to_middle = path of parents back to START
  middle_to_end   = path of parents back to END
  return reversed(start_to_middle) then middle_to_end
else:
  return no goal found
`;

const biAStar = `OPEN = PriorityQueue containing START and END
set START's side to SIDE_A
set END's side to SIDE_B

CLOSED = empty Set
found = false

while OPEN is not empty and not found:
  current = remove lowest rank item from OPEN

  if current's side is BOTH:
    found = true
  else:
    add current to CLOSED
    for each neighbour in neighbours of current:
      cost = g(current) + movementCost(current, neighbour)
      if neighbor in OPEN and cost less than g(neighbor):
        remove neighbor from OPEN, because new path is better
      if neighbor in CLOSED and cost less than g(neighbor):
        remove neighbor from CLOSED, in case heurstic isn't admissible
      if neighbour not in OPEN and neighbour not in CLOSED:
        set g(neighbour) to cost
        add neighbour to OPEN with rank g(neighbour) + h(neighbour)
        set neighbour's parent to current
        set neighbour's side to the same as current
      else if neighbour's side isn't current's side:
        set neighbour's side to BOTH

if lowest ranked item in OPEN's side is BOTH:
  start_to_middle = path of parents back to START
  middle_to_end   = path of parents back to END
  return reversed(start_to_middle) then middle_to_end
else:
  return no goal found`;

export default {
  depthFirst,
  breadthFirst,
  costDirected,
  greedy,
  aStar,
  IDAstar,
  iterativeDeepening,
  biCostDirected,
  biAStar
};
