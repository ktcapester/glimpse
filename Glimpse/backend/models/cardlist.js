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

module.exports = { getAllCards, addCard };
