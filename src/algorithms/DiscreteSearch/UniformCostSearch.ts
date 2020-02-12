import { ISearch, search } from "./search";
import { PriorityNodeSet } from "./nodeSets";

export const UniformCostSearch: ISearch = {
  *search(start, isGoal) {
    const prioritySet = new PriorityNodeSet();
    yield* search(start, prioritySet, isGoal);
  }
};
