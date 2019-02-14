import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/';
export const createPurchaseOrder = params =>
  axios
    .post(`${BASE_URL}CreatePurchaseOrder`, params)
    .then(resp => resp)
    .catch(e => {
      console.warn('ERRROR>>', e);
    });