import React, { lazy } from "react";

interface IAppProps {
  [key: string]: string;
}

interface IDemos {
  [key: string]: React.ComponentType<{ demo: string }> | undefined;
}

const searchDemo = lazy(() => import("./demos/GraphSearch/AllSearchDemos"));

const demos: IDemos = {
  "dfs-random": searchDemo,
  "dfs-left": searchDemo,
  "dfs-right": searchDemo,
  bfs: searchDemo,
  "best-first-search": searchDemo,
  "uniform-cost-search": searchDemo,
  "a-star-search": searchDemo,
  rrt: lazy(() => import("./demos/MotionPlanning/RRTDemo")),
  "rrt-star": lazy(() => import("./demos/MotionPlanning/RRTStarDemo")),
};

const Fallback: React.FC<{ demo: string }> = () => (
  <>
    {Object.keys(demos).map(key => (
      <div>
        <a href={`?demo=${key}`} key={key}>
          {key}
        </a>
      </div>
    ))}
  </>
);

const App: React.FC<IAppProps> = ({ demo }) => {
  const DemoComponent: React.ComponentType<{ demo: string }> =
    demos[demo] || Fallback;

  return (
    <div className="App">
      <DemoComponent demo={demo} />
    </div>
  );
};

export default App;
