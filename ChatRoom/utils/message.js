import moment from "moment";

export const formatMessage = (username, text, date = "") => {
  return {
    username,
    text,
    date: date === "" ? moment().format("lll") : moment(date).format("lll"),
  };
};
