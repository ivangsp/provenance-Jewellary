import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/';

export const createAsset = (params, asset) =>
  axios
    .post(BASE_URL + asset, params)
    .then(resp => {
      console.log('response', resp)
    })
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
