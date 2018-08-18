import axios from 'axios';
export default {
    transactionId: '',

    recordTransaction: (params) => {
        const promise = new Promise((resolve, reject) => {
            axios.post('http://localhost:8000/add_product/', params)
                .then(response => {
                    const res = response.data;
                    if (res.error) {
                        reject(res.msg);
                    }
                    else {
                        resolve(res.msg);
                    }
                })
                .catch(error => {
                    reject(error);
                })
        });
        return promise;
    }
}