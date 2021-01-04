import { useEffect, useState } from "react";
import "./App.scss";
import { useMultipleSelection, useSelect } from "downshift";
import { Link, useLocation } from "react-router-dom";

const PropertyList = ({ items, color }) =>
  items.length ? (
    <ul className="list-unstyled d-inline">
      {items.map((property, i) => (
        <li
          key={`property-${i}`}
          className={`badge badge-pill badge-${color} mr-2`}
        >
          {property}
        </li>
      ))}
    </ul>
  ) : null;

const PokemonList = ({ items }) => (
  <ul className="pokemon-list list-unstyled">
    {items.map(({ id, img, name, num, type = [], weaknesses = [] }) => (
      <li
        key={`pokemon-list-item-${id}`}
        className="media pb-2 mb-2 border-bottom position-relative"
      >
        {img ? (
          <Link to={`/${num}`} className="stretched-link">
            <img src={img} alt={name} />
          </Link>
        ) : null}
        <div className="media-body ml-3">
          <Link to={`/${num}`}>{name || "--"}</Link>
          <span className="ml-2 num">{num || "--"}</span>
          <div>
            Type: <PropertyList items={type} color="info" />
          </div>
          <div>
            Weaknesses: <PropertyList items={weaknesses} color="danger" />
          </div>
        </div>
      </li>
    ))}
  </ul>
);

const useMultiSelect = ({ initialSelectedItems, items = [], onChange }) => {
  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems
  } = useMultipleSelection({
    onSelectedItemsChange: ({ selectedItems }) => onChange(selectedItems),
    initialSelectedItems
  });

  const getAvailableItems = () =>
    items.filter((item) => selectedItems.indexOf(item) < 0);

  const availableItems = getAvailableItems();

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps
  } = useSelect({
    selectedItem: null,
    defaultHighlightedIndex: 0, // after selection, highlight the first item.
    items: availableItems,
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useSelect.stateChangeTypes.MenuKeyDownEnter:
        case useSelect.stateChangeTypes.MenuKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true // keep the menu open after selection.
          };
        default:
          return changes;
      }
    },
    onStateChange: ({ type, selectedItem }) => {
      switch (type) {
        case useSelect.stateChangeTypes.MenuKeyDownEnter:
        case useSelect.stateChangeTypes.MenuKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
          if (selectedItem) {
            addSelectedItem(selectedItem);
          }
          break;
        default:
          break;
      }
    }
  });

  return {
    availableItems,
    getItemProps,
    getLabelProps,
    getMenuProps,
    getSelectedItemProps,
    getToggleButtonProps: () =>
      getToggleButtonProps(getDropdownProps({ preventKeyAction: isOpen })),
    highlightedIndex,
    isOpen,
    lastSelectedItem: selectedItem,
    removeSelectedItem,
    selectedItems
  };
};

const MultiSelect = ({
  className = "",
  initialSelectedItems,
  items,
  onChange,
  toggleText
}) => {
  const {
    availableItems,
    getItemProps,
    getMenuProps,
    getSelectedItemProps,
    getToggleButtonProps,
    highlightedIndex,
    isOpen,
    lastSelectedItem,
    removeSelectedItem,
    selectedItems
  } = useMultiSelect({ items, onChange, initialSelectedItems });

  return (
    <div className={`multi-select form-group ${className}`}>
      <button
        type="button"
        {...getToggleButtonProps()}
        className="btn btn-primary"
      >
        {lastSelectedItem || toggleText}
      </button>
      <ul {...getMenuProps()} className="options position-absolute pl-0">
        {isOpen &&
          availableItems.map((item, index) => (
            <li
              className={[
                "list-group-item list-group-item-action",
                highlightedIndex === index ? "highlighted" : null
              ]
                .filter(Boolean)
                .join(" ")}
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item}
            </li>
          ))}
      </ul>
      <ul className="selections pl-0 flex-row mt-2">
        {selectedItems.map((selectedItem, index) => (
          <li
            key={`selected-item-${index}`}
            className="badge badge-secondary mr-2"
            {...getSelectedItemProps({ selectedItem, index })}
          >
            {selectedItem}
            <button
              type="button"
              aria-label="remove"
              className="close text-white ml-1"
              onClick={(e) => {
                e.stopPropagation();
                removeSelectedItem(selectedItem);
              }}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const useQuery = () => new URLSearchParams(useLocation().search);

const getBoolMap = (array) =>
  array.reduce((map, el) => (map[el] = true) && map, {});

const getUniquesFromArrayProp = (items, prop) => {
  const allValues = items
    .filter(Boolean)
    .reduce((values, item) => [...values, ...(item[prop] || [])], []);

  return Object.keys(getBoolMap(allValues));
};

const applyFilter = ({ items, prop, filter }) =>
  items.filter((item) =>
    filter.every((val) => item[prop] && item[prop].includes(val))
  );

const parseQsValue = (value) =>
  (value || "")
    .split(",")
    .filter(Boolean)
    .map((val) => val.trim());

function Search({ pokemon: pokemonList }) {
  const query = useQuery();

  const initialTypes = parseQsValue(query.get("types"));
  const initialWeaknesses = parseQsValue(query.get("weaknesses"));

  const [searchText, setSearchText] = useState();
  const [typesSelected, setTypesSelected] = useState(initialTypes);
  const [weaknessesSelected, setWeaknessesSelected] = useState(
    initialWeaknesses
  );
  const [types, setTypes] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);

  useEffect(() => {
    setTypes(getUniquesFromArrayProp(pokemonList, "type").sort());
    setWeaknesses(getUniquesFromArrayProp(pokemonList, "weaknesses").sort());
  }, [pokemonList]);

  const handleSearchTextChange = (e) => setSearchText(e.target.value);

  const filterPokemonBySearchText = (items) =>
    searchText
      ? items.filter(
          ({ name }) =>
            name && name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
        )
      : items;

  const filterPokemonByTypes = (items) =>
    typesSelected.length
      ? applyFilter({ items, prop: "type", filter: typesSelected })
      : items;

  const filterPokemonByWeaknesses = (items) =>
    weaknessesSelected.length
      ? applyFilter({
          items,
          prop: "weaknesses",
          filter: weaknessesSelected
        })
      : items;

  const getFilteredPokemon = () =>
    filterPokemonBySearchText(
      filterPokemonByTypes(filterPokemonByWeaknesses(pokemonList))
    );

  return (
    <>
      <form className="row border mb-4">
        <fieldset className="col-md-6">
          <legend>Search</legend>
          <input
            type="text"
            onChange={handleSearchTextChange}
            className="form-control"
          />
        </fieldset>
        <fieldset className="col-md-6 mt-3 mt-md-0">
          <legend className="d-inline-block">Filter</legend>
          <div className="row">
            <div className="col">
              <MultiSelect
                initialSelectedItems={initialTypes}
                items={types}
                onChange={setTypesSelected}
                toggleText="Types"
              />
            </div>
            <div className="col">
              <MultiSelect
                initialSelectedItems={initialWeaknesses}
                items={weaknesses}
                onChange={setWeaknessesSelected}
                toggleText="Weaknesses"
              />
            </div>
          </div>
        </fieldset>
      </form>
      <PokemonList items={getFilteredPokemon()} />
    </>
  );
}

export default Search;
