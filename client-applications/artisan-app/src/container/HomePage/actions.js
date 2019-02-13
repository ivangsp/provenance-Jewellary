import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/';
export const createAsset = params =>
  axios
    .post(`${BASE_URL}ProductItem`, params)
    .then(resp => resp)
    .catch(e => {
      console.warn('ERRROR>>', e);
    });

export const fetchAlProducts = () =>
  axios
    .get(`${BASE_URL}ProductItem`)
    .then(resp => resp)
    .catch(e => {
      console.warn('ERRROR>>', e);
    });
