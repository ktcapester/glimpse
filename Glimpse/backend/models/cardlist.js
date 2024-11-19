let tempStore = [];
let currentTotal = 0.0;

const getAllCards = () => {
  return { list: tempStore, currentTotal: currentTotal };
};

const addCard = (newData) => {
  console.log("got data:", newData);
  const itemidx = tempStore.findIndex((item) => item.name === newData.name);
  var data;
  if (itemidx === -1) {
    const newId = tempStore.length + 1;
    data = { id: newId, count: 1, ...newData };
    tempStore.push(data);
    currentTotal += data.price;
  } else {
    console.log("already in list, incrementing count");
    const foo = tempStore[itemidx];
    foo.count += 1;
    currentTotal += foo.price;
    data = tempStore[itemidx];
  }
  console.log("stored data:", data);
  console.log("updated total:", currentTotal);
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
    const target = tempStore[itemidx];
    currentTotal -= target.count * target.price;
    tempStore.splice(itemidx, 1);
  } else {
    return { message: "Item not found!" };
  }
  return { list: tempStore, currentTotal: currentTotal };
};

const getItem = (id) => {
  console.log("getting an item with ID:", id);
  const itemID = parseInt(id);
  const itemidx = tempStore.findIndex((item) => item.id === itemID);
  if (itemidx === -1) {
    return { message: "Item not found!" };
  }
  return tempStore[itemidx];
};

const updateItem = (cardItem) => {
  console.log("updating an item with ID:", cardItem.id);
  const itemID = parseInt(cardItem.id);
  const itemidx = tempStore.findIndex((item) => item.id === itemID);
  if (itemidx === -1) {
    return { message: "Item not found!" };
  }
  const target = tempStore[itemidx];
  if (target.count !== cardItem.count) {
    console.log("target=", target);
    console.log("cardItem=", cardItem);

    currentTotal -= target.count * target.price;
    tempStore[itemidx] = cardItem;
    currentTotal += cardItem.count * cardItem.price;
  }
  return { currentTotal: currentTotal };
};

module.exports = {
  getAllCards,
  addCard,
  clearList,
  getItem,
  updateItem,
  removeItem,
};
