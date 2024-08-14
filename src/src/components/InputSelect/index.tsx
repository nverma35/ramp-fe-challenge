import Downshift from "downshift";
import { useCallback, useState, useEffect } from "react";
import classNames from "classnames";
import { DropdownPosition, GetDropdownPositionFn, InputSelectOnChange, InputSelectProps } from "./types";

export function InputSelect<TItem>({
  label,
  defaultValue,
  onChange: consumerOnChange,
  items,
  parseItem,
  isLoading,
  loadingLabel,
}: InputSelectProps<TItem>) {
  const [selectedValue, setSelectedValue] = useState<TItem | null>(defaultValue ?? null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
  });

  // Update 1: Type narrowing in updateDropdownPosition to handle EventTarget correctly
  const updateDropdownPosition = useCallback((target: EventTarget | null) => {
    if (target instanceof Element) { // Ensure target is an Element before calculating position
      setDropdownPosition(getDropdownPosition(target));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const inputElement = document.querySelector(".RampInputSelect--input"); // Select the input element
      if (inputElement) {
        updateDropdownPosition(inputElement); // Update dropdown position on scroll
      }
    };

    window.addEventListener("scroll", handleScroll, true); // Add scroll event listener

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [updateDropdownPosition]);

  const onChange = useCallback<InputSelectOnChange<TItem>>(
    (selectedItem) => {
      if (selectedItem === null) {
        return;
      }

      consumerOnChange(selectedItem);
      setSelectedValue(selectedItem);
    },
    [consumerOnChange]
  );

  return (
    <Downshift<TItem>
      id="RampSelect"
      onChange={onChange}
      selectedItem={selectedValue}
      itemToString={(item) => (item ? parseItem(item).label : "")}
    >
      {({
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
        getToggleButtonProps,
        inputValue,
      }) => {
        const toggleProps = getToggleButtonProps();
        const parsedSelectedItem = selectedItem === null ? null : parseItem(selectedItem);

        return (
          <div className="RampInputSelect--root">
            <label className="RampText--s RampText--hushed" {...getLabelProps()}>
              {label}
            </label>
            <div className="RampBreak--xs" />
            <div
              className="RampInputSelect--input"
              onClick={(event) => {
                updateDropdownPosition(event.currentTarget); // Ensure dropdown position is calculated on click
                toggleProps.onClick(event);
              }}
            >
              {inputValue}
            </div>

            <div
              className={classNames("RampInputSelect--dropdown-container", {
                "RampInputSelect--dropdown-container-opened": isOpen,
              })}
              {...getMenuProps()}
              style={{ top: dropdownPosition.top, left: dropdownPosition.left, position: 'absolute' }} // Ensure the dropdown is absolutely positioned
            >
              {renderItems()}
            </div>
          </div>
        );

        function renderItems() {
          if (!isOpen) {
            return null;
          }

          if (isLoading) {
            return <div className="RampInputSelect--dropdown-item">{loadingLabel}...</div>;
          }

          if (items.length === 0) {
            return <div className="RampInputSelect--dropdown-item">No items</div>;
          }

          return items.map((item, index) => {
            const parsedItem = parseItem(item);
            return (
              <div
                key={parsedItem.value}
                {...getItemProps({
                  key: parsedItem.value,
                  index,
                  item,
                  className: classNames("RampInputSelect--dropdown-item", {
                    "RampInputSelect--dropdown-item-highlighted": highlightedIndex === index,
                    "RampInputSelect--dropdown-item-selected": parsedSelectedItem?.value === parsedItem.value,
                  }),
                })}
              >
                {parsedItem.label}
              </div>
            );
          });
        }
      }}
    </Downshift>
  );
}

// Updated getDropdownPosition to correctly calculate the dropdown position relative to the viewport with type narrowing
const getDropdownPosition: GetDropdownPositionFn = (target) => {
  if (target instanceof Element) { // Ensure target is an Element
    const { top, left, height } = target.getBoundingClientRect();
    return {
      top: window.scrollY + top + height, // Adjust dropdown to be below the input
      left,
    };
  }

  return { top: 0, left: 0 }; // Provide a default position if the target is not an Element
};
