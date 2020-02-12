import { ISearch, search } from "./search";
import { QueueNodeSet } from "./nodeSets";

export const BreadthFirstSearch: ISearch = {
  *search(start, isGoal) {
    const stack = new QueueNodeSet();
    yield* search(start, stack, isGoal);
  }
};
