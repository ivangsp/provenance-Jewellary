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

export const fetchAssets = asset =>
  axios
    .get(BASE_URL + asset)
    .then(resp => resp)
    .catch(e => {
      console.warn('ERRROR>>', e);
    });
