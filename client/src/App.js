import React, { useRef, useState } from "react";
import "./App.css";
import PropTypes from "prop-types";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const MoveableItem = ({ name, index, moveCardHandler, setItems }) => {
  const changeItemColumn = (currentItem, columnName) => {
    setItems((prevState) => {
      return prevState.map((e) => {
        return {
          ...e,
          column: e.name === currentItem.name ? columnName : e.column,
        };
      });
    });
  };
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: "Our first type",
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveCardHandler(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    item: { index, name, type: "Our first type" },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.name === "Column 1") {
        changeItemColumn(item, "Column 1");
      } else {
        changeItemColumn(item, "Column 2");
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));
  return (
    <div ref={ref} className="movable-item" style={{ opacity }}>
      {name}
    </div>
  );
};

const Column = ({ children, className, title }) => {
  const [, drop] = useDrop({
    accept: "Our first type",
    drop: () => ({ name: "title" }),
  });

  return (
    <div ref={drop} className={className}>
      {title}
      {children}
    </div>
  );
};

export const App = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Item 1", column: "Column 1" },
    { id: 2, name: "Item 2", column: "Column 1" },
    { id: 3, name: "Item 3", column: "Column 1" },
  ]);
  const moveCardHandler = (dragIndex, hoverIndex) => {
    const dragItem = items[dragIndex];
    if (dragItem) {
      setItems((prevState) => {
        const coppiedStateArray = [...prevState];
        const prevItem = coppiedStateArray.splice(hoverIndex, 1, dragItem);
        coppiedStateArray.splice(dragIndex, 1, prevItem[0]);
        return coppiedStateArray;
      });
    }
  };
  const returnItemsForColumn = (columnName) => {
    return items
      .filter((item) => item.column === columnName)
      .map((item, index) => (
        <MoveableItem
          key={item.id}
          name={item.name}
          setItems={setItems}
          index={index}
          moveCardHandler={moveCardHandler}
        />
      ));
  };
  return (
    <div className="container">
      <DndProvider backend={HTML5Backend}>
        <Column title="Column 1" className="column first-column">
          {returnItemsForColumn("Column 1")}
        </Column>
        <Column title="Column 2" className="column second-column">
          {returnItemsForColumn("Column 2")}
        </Column>
      </DndProvider>
    </div>
  );
};

MoveableItem.propTypes = {
  name: PropTypes.any,
  index: PropTypes.any,
  moveCardHandler: PropTypes.any,
  setItems: PropTypes.func,
};
Column.propTypes = {
  children: PropTypes.array,
  className: PropTypes.string,
  title: PropTypes.string,
};
