import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/';
export const createAsset = params =>
  axios
    .post(`${BASE_URL}ProductItem`, params)
    .then(resp => resp)
    .catch(e => {
      console.warn('ERRROR>>', e);
    });
