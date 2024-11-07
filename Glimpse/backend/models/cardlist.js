let tempStore = [];
let currentTotal = 0.0;

const getAllCards = () => {
  return { list: tempStore, currentTotal: currentTotal };
};

const addCard = (newData) => {
  console.log("got data:", newData);

  const newId = tempStore.length + 1;
  const data = { id: newId, ...newData };
  tempStore.push(data);
  currentTotal += data.price;
  console.log("stored as:", data);

  return { data, currentTotal };
};

const clearList = () => {
  console.log("clearing the list!");
  tempStore = [];
  currentTotal = 0;
  return { list: tempStore, currentTotal: currentTotal };
};

const removeItem = (id) => {
  console.log("removing an item with ID:", id);
  const itemID = parseInt(id);
  const itemidx = tempStore.findIndex((item) => item.id === itemID);
  if (itemidx !== -1) {
    tempStore.slice(itemidx, 1);
  } else {
    return { message: "Item not found!" };
  }
  return { list: tempStore, currentTotal: currentTotal };
};

module.exports = { getAllCards, addCard, clearList, removeItem };
