import { useState } from "react";

const ITEMS_PER_PAGE = 8;

export default function Items({
  groupedInventory,
  selectedItems,
  handleAddItem,
  handleDecreaseItem,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState({}); // { category: number }

  const handleLoadMore = (category) => {
    setVisibleCount((prev) => ({
      ...prev,
      [category]: (prev[category] || ITEMS_PER_PAGE) + ITEMS_PER_PAGE,
    }));
  };

  const filteredGroupedInventory = Object.entries(groupedInventory).reduce(
    (acc, [category, items]) => {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length) acc[category] = filtered;
      return acc;
    },
    {}
  );

  return (
    <>
      <h3 className="slds-text-heading_small slds-m-bottom_small">Select Items</h3>
      <input
        type="text"
        className="slds-input slds-m-bottom_medium"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div>
        {Object.entries(filteredGroupedInventory).map(([category, items]) => {
          const visible = visibleCount[category] || ITEMS_PER_PAGE;
          const visibleItems = items.slice(0, visible);

          return (
            <div key={category} className="category-group slds-m-bottom_large">
              <h3 className="slds-text-heading_medium slds-m-bottom_small">
                {category}
              </h3>
              <div className="slds-grid slds-wrap">
                {visibleItems.map((item) => {
                  const selectedItem = selectedItems.find((i) => i.item === item._id);
                  const currentQty = selectedItem ? selectedItem.quantity : 0;
                  const isOutOfStock = item.stock === 0;
                  const disableAdd = isOutOfStock || currentQty >= item.stock;

                  return (
                    <div
                      key={item._id}
                      className="slds-box slds-m-around_x-small slds-size_1-of-1 slds-small-size_1-of-2 slds-medium-size_1-of-4"
                      style={{
                        minHeight: "160px",
                        position: "relative",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        borderRadius: "6px",
                      }}
                    >
                      <h4
                        className="slds-text-heading_small"
                        style={{ marginBottom: "0.5rem" }}
                      >
                        {item.name}
                      </h4>
                      <p>
                        <strong>Price:</strong> ₹{item.price}
                      </p>
                      <p>
                        <strong>Stock:</strong> {item.stock}
                      </p>

                      {currentQty > 0 ? (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <button
                            className="slds-button slds-button_icon slds-button_icon-border-filled"
                            onClick={() => handleDecreaseItem(item._id)}
                          >
                            −
                          </button>
                          <span>{currentQty}</span>
                          <button
                            className="slds-button slds-button_icon slds-button_icon-border-filled"
                            onClick={() => handleAddItem(item._id)}
                            disabled={disableAdd}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className={`slds-button ${
                            disableAdd
                              ? "slds-button_disabled"
                              : "slds-button_neutral"
                          }`}
                          onClick={() => handleAddItem(item._id)}
                          disabled={disableAdd}
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                          }}
                        >
                          {isOutOfStock ? "Out of Stock" : "Add"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {items.length > visible && (
                <button
                  className="slds-button slds-button_neutral slds-m-top_medium"
                  onClick={() => handleLoadMore(category)}
                >
                  Load more
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
