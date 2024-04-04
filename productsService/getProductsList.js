'use strict';
import { productsList } from './productsMock.js';

export async function getProductsList(event)  {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(productsList)
  };
};
