const { format } = require("date-fns");
const getDate = (date = new Date()) => {
  return format(date, "yyyy-MM-dd");
};

module.exports = {
  getDate,
};
