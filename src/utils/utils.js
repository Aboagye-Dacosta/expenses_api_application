const getDate = () => {
  return new Date();
};

const resetId = (obj) => {
  const id = obj._id;
  delete obj._id;
  obj["id"] = id;
  return obj;
};

module.exports = {
  getDate,
  resetId,
};
