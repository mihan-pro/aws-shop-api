'use strict';

const {productsList} = require("./productsMock");

module.exports.getProductsList = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(
      {
        data: JSON.stringify(productsList)
      }
    ),
  };
};
