const decisions: {[key: string]: {[key: string] : number}} = {
  "iterationCheck": {
    "Yes": 2,
    "No": 3
  },
  "canConnect": {
    "Yes": 7,
    "No": 8
  },
  "goalCheck": {
    "Yes": 13,
    "No": 14
  }
};

export const flowchart = (status?: string, decision?: string) => `
graph TD;

init("Start");
start["Add 'start' position to the 'tree'<br/>with cost = 0.<br/>Set 'iteration' to 0."];
iterationCheck{{"Is the 'iteration' count <br/>less than or equal to <br/>the 'maximum iterations'?"}};
randomConfig["Select a 'configuration' at random."];
nearestNeighbour["Find the 'nearest node' in the 'tree'<br/> to the chosen 'configuration'."];
extend["Model (simulate) the motion of the agent<br/>extending from the 'nearest node'<br/>towards the chosen 'configuration'<br/>until either a collision,<br/>or the 'maximum distance' is reached.<br/>Place a 'new node' here."];
canConnect{{"Was the motion to the 'new node'<br/> free from collisions?"}};
findNeighbourhood["Find all 'neighbourhood nodes' (and their costs)<br/>that are reachable within a given distance<br/>of the 'new node'"];
findLowestCostNeighbour["Find the 'lowest cost node',<br/> out of the 'neighbourhood nodes',<br/>which has the lowest overall travel cost.<br/>(path cost to the<br/>'neighbourhood node' + additional travel cost<br/>to the 'new node')"]
addToTree["Add to the 'tree' the 'edge'<br/>from the 'lowest cost node'<br/>to the 'new node'."];
rewire["Re-wire all the 'neighbourhood nodes'<br/>which can now take a lower cost path<br/>via the 'new node'."]
goalCheck{{"Is the 'new node' within<br/>reach of the 'goal'?"}};
increment["Increment the 'iteration' count."];
success("Use a tree search to<br/>find the shortest path<br/>from 'start' to the node<br/>closest to the 'goal'");
fail("Maximum iterations reached.<br/>Try again, or give up and <br/>accept that there may be<br/> no path to the goal.");

init-->start;
start-->iterationCheck;
iterationCheck-- Yes -->randomConfig;
iterationCheck-- No -->fail;
randomConfig-->nearestNeighbour;
nearestNeighbour-->extend;
extend-->canConnect;
canConnect-- Yes -->findNeighbourhood;
canConnect-- No -->increment;
findNeighbourhood-->findLowestCostNeighbour;
findLowestCostNeighbour-->addToTree;
addToTree-->rewire;
rewire-->goalCheck;
goalCheck-- Yes -->success;
goalCheck-- No -->increment;
increment-->iterationCheck;

${status ? `style ${status} stroke:#f66,stroke-width:2px` : ''}
${status && decision !== undefined && decisions[status] ? `linkStyle ${decisions[status][decision]} stroke:#f66` : ''}
`;
