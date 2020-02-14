import React from "react";
import { css } from "emotion";
import { DataType } from "../../algorithms/DiscreteSearch/nodeSets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
  faLongArrowAltRight
} from "@fortawesome/free-solid-svg-icons";

interface IDataItem {
  value: string;
  rank?: number;
}

interface IDataCollectionDiagramProps {
  members: Array<IDataItem>;
  dataType: DataType;
  previewSize?: number;
}

const itemCss = css({
  display: "inline-block",
  textAlign: "center",
  padding: "8px",
  fontWeight: "bold",
  border: "1px solid #666",
  margin: "3px",
  minWidth: "32px",
  borderRadius: "3px",
  backgroundColor: "#ccf",
  color: "black"
});

const emptyCss = css({
  display: "inline-block",
  textAlign: "center",
  padding: "8px",
  color: "#888",
  fontWeight: "bold",
  margin: "4px"
});

const DataItem: React.FC<IDataItem> = ({ value, rank }) => (
  <div className={itemCss}>
    <div>{value}</div>
    {rank && <div>{rank}</div>}
  </div>
);

const dataDiagramCss = css({
  display: "flex",
  textAlign: "center",
  justifyContent: "center",
  padding: "4px"
});

const containerCss = css({
  border: "1px solid #ddd",
  width: "100%",
  backgroundColor: "#eee",
  display: "flex",
  textAlign: "center",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px"
});

const DataCollectionContainer: React.FC<{
  children: React.ReactNode;
  dataType: DataType;
}> = ({ children, dataType }) => (
  <div className={containerCss}>
    <div>
      {dataType === DataType.Stack ? (
        <FontAwesomeIcon icon={faExchangeAlt} />
      ) : dataType === DataType.Queue ? (
        <FontAwesomeIcon icon={faLongArrowAltRight} />
      ) : null}
    </div>
    <div className={dataDiagramCss}>{children}</div>
    {dataType === DataType.Queue && (
      <FontAwesomeIcon icon={faLongArrowAltRight} />
    )}
  </div>
);

export const DataCollectionDiagram: React.FC<IDataCollectionDiagramProps> = ({
  members,
  dataType,
  previewSize = 3
}) => {
  const items =
    dataType === DataType.PriorityQueue
      ? [...members].sort((a, b) => (a.rank || 0) - (b.rank || 0))
      : [...members].reverse();

  if (items.length === 0) {
    return (
      <DataCollectionContainer dataType={dataType}>
        <div className={emptyCss}>Empty</div>
      </DataCollectionContainer>
    );
  } else if (items.length <= previewSize * 2) {
    return (
      <DataCollectionContainer dataType={dataType}>
        {items.map(item => (
          <DataItem {...item} />
        ))}
      </DataCollectionContainer>
    );
  } else {
    const firstPreview = items.slice(0, previewSize);
    const lastPreview = items.slice(items.length - previewSize, items.length);

    return (
      <DataCollectionContainer dataType={dataType}>
        {firstPreview.map(item => (
          <DataItem {...item} />
        ))}
        <div>...</div>
        {lastPreview.map(item => (
          <DataItem {...item} />
        ))}
      </DataCollectionContainer>
    );
  }
};
