export const flowchart =  `
graph TD;

init("Start");
start["Add 'start' position to the 'tree'.<br/>Set 'iteration' to 0."];
iterationCheck{{"Is the 'iteration' number <br/>less than or equal to <br/>the 'maximum iterations'?"}};
randomConfig["Select a 'configuration' at random."];
nearestNeighbour["Find the 'nearest node' in the 'tree'<br/> to this 'configuration'."];
extend["Simulate a path<br/>extending from the 'nearest node'<br/>towards the random 'configuration'<br/>until either the path is blocked,<br/>or the 'maximum distance' is reached.<br/>Place a 'new node' here."];
canConnect{{"Is there a new 'edge' from<br/>the 'nearest node'<br/>to this 'new node'?"}};
addToTree["Add to the 'tree' the 'edge'<br/>from the 'nearest node'<br/>to the 'new node'."];
goalCheck{{"Is the 'new node' within<br/>reach of the 'goal'?"}};
success("Use a tree search to<br/>find the shortest path<br/>from 'start' to the node<br/>closest to the 'goal'");
fail("Maximum iterations reached.<br/>Try again, or give up and <br/>accept that there may be<br/> no path to the goal.");

init-->start;
start-->iterationCheck;
iterationCheck-- Yes -->randomConfig;
iterationCheck-- No -->fail;
randomConfig-->nearestNeighbour;
nearestNeighbour-->extend;
extend-->canConnect;
canConnect-- Yes -->addToTree;
canConnect-- No -->iterationCheck;
addToTree-->goalCheck;
goalCheck-- Yes -->success;
goalCheck-- No -->iterationCheck;
`;
