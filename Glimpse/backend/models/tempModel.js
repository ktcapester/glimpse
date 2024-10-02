let tempStore = [{ id: 1, name: "Sample Data" }];

const getAllData = () => {
  return tempStore;
};

const addData = (newData) => {
  const newId = tempStore.length + 1;
  const data = { id: newId, ...newData };
  tempStore.push(data);
  return data;
};

module.exports = { getAllData, addData };
