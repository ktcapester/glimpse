let tempStore = [{ id: 1, name: "Sample Data", price: 8.44 }];

const getAllCards = () => {
  return tempStore;
};

const addCard = (newData) => {
  const newId = tempStore.length + 1;
  const data = { id: newId, ...newData };
  tempStore.push(data);
  return data;
};

module.exports = { getAllCards, addCard };
